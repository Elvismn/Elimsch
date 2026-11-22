import { api, unwrap } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { User } from '@/types/domain';
import type { LoginInput } from './schemas';

interface LoginResponse {
  token: string;
  user: User;
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  return unwrap<LoginResponse>(api.post<ApiResponse<LoginResponse>>('/auth/login', input));
}

export async function me(): Promise<User> {
  return unwrap<User>(api.get<ApiResponse<User>>('/auth/me'));
}