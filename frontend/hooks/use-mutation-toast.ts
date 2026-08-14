/*eslint-disable*/
import { useMutation, type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/services/https";

interface MutationToastOptions<TData, TVariables> {
  successMsg?: string | ((data: TData) => string);
  errorMsg?: string;
  showValidationErrors?: boolean;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: ApiError) => void;
}

type MutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<TData, ApiError, TVariables>,
  "mutationFn" | "onSuccess" | "onError"
>;

export function useMutationWithToast<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  toastOptions: MutationToastOptions<TData, TVariables> = {},
  mutationOptions?: MutationOptions<TData, TVariables>
): UseMutationResult<TData, ApiError, TVariables> {
  const {
    successMsg,
    errorMsg,
    showValidationErrors = true,
    onSuccess,
    onError,
  } = toastOptions;

  return useMutation<TData, ApiError, TVariables>({
    mutationFn,
    ...mutationOptions,

    onSuccess: (data, variables, _context) => {
      if (successMsg) {
        const message =
          typeof successMsg === "function" ? successMsg(data) : successMsg;
        toast.success(message);
      }
      onSuccess?.(data, variables);
    },

    onError: (error) => {
   if (showValidationErrors && error.errors?.length > 0) {
  error.errors.forEach(({ field, message }) => {
    toast.error(`${field}: ${message}`);
  });

  onError?.(error);
  return;
}

      const message = errorMsg || error.message || "Kuch ghalat ho gaya";
      toast.error(message);
      onError?.(error);
    },
  });
}