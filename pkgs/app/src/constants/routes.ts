/**
 * 展会 AI Agent 平台 - 路由定义
 * 单一数据源：所有页面路由集中在此管理
 */

/** 路由名称 */
export const RouteNames = {
    HOME: 'HOME',
    PROFILE: 'PROFILE',
    DEMO_DETAIL: 'DEMO_DETAIL',
    DEMO_SUB: 'DEMO_SUB',
} as const

export type RouteName = (typeof RouteNames)[keyof typeof RouteNames]

/** 页面路径（带前导斜杠） */
export const PAGES: Record<RouteName, string> = {
    [RouteNames.HOME]: '/pages/index/index',
    [RouteNames.PROFILE]: '/pages/profile/index',
    [RouteNames.DEMO_DETAIL]: '/pages/demo-detail/index',
    [RouteNames.DEMO_SUB]: '/pages/demo-sub/index',
} as const

/** 路由参数类型 */
export interface RouteParamMap {
    [RouteNames.HOME]: { from?: string }
    [RouteNames.PROFILE]: { from?: string }
    [RouteNames.DEMO_DETAIL]: { from?: string }
    [RouteNames.DEMO_SUB]: { from?: string }
}

/**
 * 适配 Taro 的页面路径（移除开头斜杠）
 * Taro 的 app.config.ts pages 数组要求不带前导斜杠
 */
export function adaptPath(path: string): string {
    return path.replace(/^\//, '')
}

/** Taro app.config 用的页面路径（不带前导斜杠） */
export const ADAPTED_PAGES: Record<RouteName, string> = (
    Object.entries(PAGES) as [RouteName, string][]
).reduce(
    (acc, [key, path]) => ({ ...acc, [key]: adaptPath(path) }),
    {} as Record<RouteName, string>,
)
