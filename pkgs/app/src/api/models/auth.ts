/** 认证相关类型 — 对齐后端 app/schemas/auth.py */

export interface Token {
    access_token: string
    token_type: string
    expires_at: string
}

export interface UserCreate {
    email: string
    password: string
    username?: string
}

export interface UserResponse {
    request_id: string
    id: number
    email: string
    username?: string
    token: Token
}

export interface SessionResponse {
    request_id: string
    session_id: string
    name: string
    token: Token
}
