/**
 * 路由导航工具函数
 * 基于 Taro 导航 API 封装，支持类型安全的路由参数
 */
import Taro from '@tarojs/taro'
import type { RouteName } from '~/constants/routes'
import { PAGES, type RouteParamMap } from '~/constants/routes'
import { loggerDebug } from './logger'

// 微信小程序页面栈最大深度限制
const MAX_PAGE_STACK = 10
// 当页面栈深度达到该值时使用 redirectTo
const REDIRECT_THRESHOLD = 8

/** 获取当前页面栈深度 */
function getPageStackDepth(): number {
    return Taro.getCurrentPages().length
}

/**
 * 构建带参数的路由 URL
 */
export function buildRoute<T extends RouteName>(
    route: T,
    params?: RouteParamMap[T],
): string {
    const baseUrl = PAGES[route]

    if (!params || Object.keys(params).length === 0) {
        return baseUrl
    }

    const queryParts: string[] = []

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
            if (typeof value === 'boolean') {
                queryParts.push(`${key}=${value ? 'true' : 'false'}`)
            } else {
                queryParts.push(`${key}=${encodeURIComponent(String(value))}`)
            }
        }
    })

    return queryParts.length > 0 ? `${baseUrl}?${queryParts.join('&')}` : baseUrl
}

/**
 * 解析 URL 中的查询参数
 */
export function parseRouteParams(url: string): Record<string, string> {
    const [, queryString] = url.split('?')
    if (!queryString) return {}

    return queryString.split('&').reduce((params: Record<string, string>, pair) => {
        const [key, value] = pair.split('=')
        if (key && value) {
            params[key] = decodeURIComponent(value)
        }
        return params
    }, {})
}

/**
 * 智能导航 — 根据页面栈深度自动选择 navigateTo 或 redirectTo
 */
export function navigateTo<T extends RouteName>(
    route: T,
    params?: RouteParamMap[T],
) {
    const depth = getPageStackDepth()

    if (depth >= REDIRECT_THRESHOLD) {
        loggerDebug(
            `Page stack depth (${depth}) approaching limit ${MAX_PAGE_STACK}, using redirectTo`,
        )
        return redirectTo(route, params)
    }

    return Taro.navigateTo({ url: buildRoute(route, params) })
}

/**
 * 重定向（替换当前页面）
 */
export function redirectTo<T extends RouteName>(
    route: T,
    params?: RouteParamMap[T],
) {
    return Taro.redirectTo({ url: buildRoute(route, params) })
}

/**
 * 返回上一页
 */
export function navigateBack(delta = 1, success?: () => void) {
    return Taro.navigateBack({ delta, success })
}

/**
 * 切换 Tab 页面
 */
export function switchTab(route: RouteName) {
    return Taro.switchTab({ url: PAGES[route] })
}

/**
 * 重启动（关闭所有页面后打开目标页）
 */
export function reLaunch<T extends RouteName>(
    route: T,
    params?: RouteParamMap[T],
) {
    return Taro.reLaunch({ url: buildRoute(route, params) })
}
