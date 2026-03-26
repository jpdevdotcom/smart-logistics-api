export type ApiError = {
  error: string;
  message: string;
  code: number;
  details?: unknown;
};

export const apiError = (
  error: string,
  message: string,
  code: number,
  details?: unknown,
): ApiError => ({
  error,
  message,
  code,
  ...(details ? { details } : {}),
});
