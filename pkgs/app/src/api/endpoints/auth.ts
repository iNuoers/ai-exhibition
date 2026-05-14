/** 认证相关 API */
import { http } from '~/services/request'
import type { UserCreate, UserResponse, SessionResponse } from '../models/auth'

const PREFIX = '/api/v1/auth'

export const authApi = {
    register: (data: UserCreate) =>
        http.post<UserResponse>(`${PREFIX}/register`, data, { noAuth: true }),

    login: (data: { email: string; password: string }) =>
        http.post<UserResponse>(`${PREFIX}/login`, data, { noAuth: true }),

    createSession: () =>
        http.post<SessionResponse>(`${PREFIX}/session`),
}
