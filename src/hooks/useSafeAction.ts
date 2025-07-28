import { useCallback, useState } from 'react';
import type { SafeActionResult } from '@/lib/safe-action';

// AIDEV-NOTE: Custom hook for using safe actions with better UX
// Provides loading states, error handling, and success callbacks

interface UseSafeActionOptions<TOutput> {
  onSuccess?: (data: TOutput) => void;
  onError?: (error: string) => void;
  onSettled?: () => void;
}

export function useSafeAction<TInput, TOutput>(
  action: (input: TInput) => Promise<SafeActionResult<TOutput>>,
  options?: UseSafeActionOptions<TOutput>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<TOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (input: TInput) => {
      setIsLoading(true);
      setError(null);
      setData(null);

      try {
        const result = await action(input);

        if (result.data && !result.serverError && !result.validationErrors) {
          // Success case
          setData(result.data);
          options?.onSuccess?.(result.data);
        } else {
          // Error case
          let errorMessage = '알 수 없는 오류가 발생했습니다.';
          
          if (result.serverError) {
            errorMessage = result.serverError;
          } else if (result.validationErrors) {
            const errors = Object.values(result.validationErrors).flat();
            errorMessage = errors.join(', ');
          }

          setError(errorMessage);
          options?.onError?.(errorMessage);
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '예상치 못한 오류가 발생했습니다.';
        setError(errorMessage);
        options?.onError?.(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
        options?.onSettled?.();
      }
    },
    [action, options]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setData(null);
    setError(null);
  }, []);

  return {
    execute,
    reset,
    isLoading,
    data,
    error,
    isSuccess: !!data && !error,
    isError: !!error,
  };
}

// Specific hooks for common patterns
export function useSafeActionWithToast<TInput, TOutput>(
  action: (input: TInput) => Promise<SafeActionResult<TOutput>>,
  options?: UseSafeActionOptions<TOutput>
) {
  return useSafeAction(action, {
    onSuccess: (data) => {
      // You can import and use toast here if needed
      // toast.success('작업이 성공적으로 완료되었습니다.');
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      // toast.error(error);
      options?.onError?.(error);
    },
    onSettled: options?.onSettled,
  });
}

// Form-specific hook
export function useSafeActionForm<TInput, TOutput>(
  action: (input: TInput) => Promise<SafeActionResult<TOutput>>,
  options?: UseSafeActionOptions<TOutput> & {
    resetOnSuccess?: boolean;
  }
) {
  const [formData, setFormData] = useState<TInput | null>(null);

  const safeAction = useSafeAction(action, {
    ...options,
    onSuccess: (data) => {
      if (options?.resetOnSuccess) {
        setFormData(null);
      }
      options?.onSuccess?.(data);
    },
  });

  const executeForm = useCallback(
    (input: TInput) => {
      setFormData(input);
      return safeAction.execute(input);
    },
    [safeAction]
  );

  return {
    ...safeAction,
    executeForm,
    formData,
    setFormData,
  };
}