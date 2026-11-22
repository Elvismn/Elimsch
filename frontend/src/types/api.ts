export interface ApiError {
  path?: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: ApiError[] | null;
}

export interface NormalizedError {
  status: number;
  message: string;
  errors: ApiError[] | null;
  original: unknown;
}