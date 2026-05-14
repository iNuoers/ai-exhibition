/**
 * HTTP 请求相关类型定义
 * 对齐后端 FastAPI 的标准响应格式
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestConfig<D = any> {
    url: string
    method?: HttpMethod
    data?: D
    header?: Record<string, string>
    /** 是否跳过 token 注入（登录接口用） */
    noAuth?: boolean
}

/** 后端标准响应结构 */
export interface ApiResponse<T = any> {
    request_id: string
    data?: T
    detail?: string
    errors?: Array<{ field: string; message: string }>
}
