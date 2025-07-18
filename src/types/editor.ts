export interface EditorElement {
  id: string;
  type: 'text' | 'image' | 'divider';
  content: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  style: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
  };
}

export interface EditorState {
  elements: EditorElement[];
  selectedElementId: string | null;
  template: {
    id: string;
    name: string;
    category: string;
    htmlContent: string;
    previewImageUrl: string;
  } | null;
  weddingInfo: {
    brideName: string;
    groomName: string;
    weddingDate: string;
    weddingTime: string;
    venue: string;
    venueAddress: string;
    contact: string;
    rsvpEnabled?: boolean;
    rsvpDeadline?: string;
  };
  isDirty: boolean;
  lastSaved: Date | null;
}

export type EditorAction =
  | { type: 'SET_TEMPLATE'; payload: EditorState['template'] }
  | { type: 'ADD_ELEMENT'; payload: EditorElement }
  | {
      type: 'UPDATE_ELEMENT';
      payload: { id: string; updates: Partial<EditorElement> };
    }
  | { type: 'DELETE_ELEMENT'; payload: string }
  | { type: 'SELECT_ELEMENT'; payload: string | null }
  | {
      type: 'UPDATE_WEDDING_INFO';
      payload: Partial<EditorState['weddingInfo']>;
    }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'SET_LAST_SAVED'; payload: Date }
  | { type: 'LOAD_STATE'; payload: EditorState };

export interface EditorHistory {
  past: EditorState[];
  present: EditorState;
  future: EditorState[];
}
