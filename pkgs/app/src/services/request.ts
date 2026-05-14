/**
 * 基于 Taro.request 的 HTTP 请求封装
 * 对齐后端 FastAPI 的标准响应格式
 */
import Taro from '@tarojs/taro'
import { cache } from '~/cache'
import type { RequestConfig } from '~/types'

// ── 环境配置 ────────────────────────────────────────────────────────

function getBaseUrl(): string {
    const envVersion = (() => {
        try {
            return Taro.getAccountInfoSync().miniProgram.envVersion
        } catch {
            return 'develop'
        }
    })()

    switch (envVersion) {
        case 'release':
            return process.env.TARO_APP_API_BASE_URL || 'https://api.example.com'
        case 'trial':
            return process.env.TARO_APP_API_BASE_URL || 'https://api-staging.example.com'
        default:
            return process.env.TARO_APP_API_BASE_URL || 'http://localhost:8000'
    }
}

// ── 核心请求函数 ────────────────────────────────────────────────────

export async function request<T = any>(config: RequestConfig): Promise<T> {
    const { url, method = 'GET', data, header = {}, noAuth = false } = config

    // 注入 token
    if (!noAuth) {
        const token = cache.getSync('access_token')
        if (token) {
            header['Authorization'] = `Bearer ${token}`
        }
    }

    const fullUrl = url.startsWith('http') ? url : `${getBaseUrl()}${url}`

    const response = await Taro.request({
        url: fullUrl,
        method,
        data,
        header: {
            'Content-Type': 'application/json',
            ...header,
        },
        timeout: 30000,
    })

    const { statusCode, data: resData } = response

    // 2xx 成功
    if (statusCode >= 200 && statusCode < 300) {
        return resData as T
    }

    // 401 未授权 → 清除 token
    if (statusCode === 401) {
        cache.removeSync('access_token')
        cache.removeSync('refresh_token')
        // 可以在这里触发重新登录
    }

    // 错误处理
    const message = resData?.detail || resData?.message || `请求失败 (${statusCode})`
    const error = new Error(message)
    Object.assign(error, { statusCode, data: resData })
    throw error
}

// ── 便捷方法 ────────────────────────────────────────────────────────

export const http = {
    get: <T>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>) =>
        request<T>({ url, method: 'GET', ...config }),

    post: <T>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>) =>
        request<T>({ url, method: 'POST', data, ...config }),

    put: <T>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>) =>
        request<T>({ url, method: 'PUT', data, ...config }),

    patch: <T>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>) =>
        request<T>({ url, method: 'PATCH', data, ...config }),

    delete: <T>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>) =>
        request<T>({ url, method: 'DELETE', ...config }),
}
