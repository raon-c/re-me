'use client';

import { useReducer, useCallback, useRef, useEffect } from 'react';
import {
  EditorState,
  EditorAction,
  EditorHistory,
  EditorElement,
} from '@/types/editor';

const initialState: EditorState = {
  elements: [],
  selectedElementId: null,
  template: null,
  weddingInfo: {
    brideName: '',
    groomName: '',
    weddingDate: '',
    weddingTime: '',
    venue: '',
    venueAddress: '',
    contact: '',
    rsvpEnabled: true,
    rsvpDeadline: '',
  },
  isDirty: false,
  lastSaved: null,
};

// AIDEV-NOTE: Editor state reducer with undo/redo functionality for invitation editing
function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_TEMPLATE':
      return {
        ...state,
        template: action.payload,
        isDirty: true,
      };

    case 'ADD_ELEMENT':
      return {
        ...state,
        elements: [...state.elements, action.payload],
        selectedElementId: action.payload.id,
        isDirty: true,
      };

    case 'UPDATE_ELEMENT':
      return {
        ...state,
        elements: state.elements.map((element) =>
          element.id === action.payload.id
            ? { ...element, ...action.payload.updates }
            : element
        ),
        isDirty: true,
      };

    case 'DELETE_ELEMENT':
      return {
        ...state,
        elements: state.elements.filter(
          (element) => element.id !== action.payload
        ),
        selectedElementId:
          state.selectedElementId === action.payload
            ? null
            : state.selectedElementId,
        isDirty: true,
      };

    case 'SELECT_ELEMENT':
      return {
        ...state,
        selectedElementId: action.payload,
      };

    case 'UPDATE_WEDDING_INFO':
      return {
        ...state,
        weddingInfo: { ...state.weddingInfo, ...action.payload },
        isDirty: true,
      };

    case 'SET_DIRTY':
      return {
        ...state,
        isDirty: action.payload,
      };

    case 'SET_LAST_SAVED':
      return {
        ...state,
        lastSaved: action.payload,
        isDirty: false,
      };

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
}

export function useEditorState() {
  const [state, dispatch] = useReducer(editorReducer, initialState);
  const [history, setHistory] = useReducer(
    (
      state: EditorHistory,
      action: { type: 'PUSH' | 'UNDO' | 'REDO'; payload?: EditorState }
    ) => {
      switch (action.type) {
        case 'PUSH':
          return {
            past: [...state.past, state.present],
            present: action.payload!,
            future: [],
          };
        case 'UNDO':
          if (state.past.length === 0) return state;
          return {
            past: state.past.slice(0, -1),
            present: state.past[state.past.length - 1],
            future: [state.present, ...state.future],
          };
        case 'REDO':
          if (state.future.length === 0) return state;
          return {
            past: [...state.past, state.present],
            present: state.future[0],
            future: state.future.slice(1),
          };
        default:
          return state;
      }
    },
    { past: [], present: initialState, future: [] }
  );

  const historyTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-save state to history
  useEffect(() => {
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }

    historyTimeoutRef.current = setTimeout(() => {
      setHistory({ type: 'PUSH', payload: state });
    }, 1000);

    return () => {
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
    };
  }, [state]);

  const undo = useCallback(() => {
    setHistory({ type: 'UNDO' });
    dispatch({
      type: 'LOAD_STATE',
      payload: history.past[history.past.length - 1],
    });
  }, [history]);

  const redo = useCallback(() => {
    setHistory({ type: 'REDO' });
    dispatch({ type: 'LOAD_STATE', payload: history.future[0] });
  }, [history]);

  const addElement = useCallback(
    (type: EditorElement['type'], position: { x: number; y: number }) => {
      const newElement: EditorElement = {
        id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        content: type === 'text' ? '텍스트를 입력하세요' : '',
        position,
        size: { width: 200, height: type === 'text' ? 40 : 100 },
        style: {
          fontSize: 16,
          fontFamily: 'Noto Sans KR',
          color: '#000000',
          textAlign: 'center',
          fontWeight: 'normal',
          fontStyle: 'normal',
        },
      };

      dispatch({ type: 'ADD_ELEMENT', payload: newElement });
    },
    []
  );

  const updateElement = useCallback(
    (id: string, updates: Partial<EditorElement>) => {
      dispatch({ type: 'UPDATE_ELEMENT', payload: { id, updates } });
    },
    []
  );

  const deleteElement = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ELEMENT', payload: id });
  }, []);

  const selectElement = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_ELEMENT', payload: id });
  }, []);

  const updateWeddingInfo = useCallback(
    (updates: Partial<EditorState['weddingInfo']>) => {
      dispatch({ type: 'UPDATE_WEDDING_INFO', payload: updates });
    },
    []
  );

  const setTemplate = useCallback((template: EditorState['template']) => {
    dispatch({ type: 'SET_TEMPLATE', payload: template });
  }, []);

  const markSaved = useCallback(() => {
    dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
  }, []);

  const loadState = useCallback((newState: EditorState) => {
    dispatch({ type: 'LOAD_STATE', payload: newState });
  }, []);

  return {
    state,
    actions: {
      addElement,
      updateElement,
      deleteElement,
      selectElement,
      updateWeddingInfo,
      setTemplate,
      markSaved,
      loadState,
      undo,
      redo,
    },
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
