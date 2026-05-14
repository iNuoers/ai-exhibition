import type Taro from '@tarojs/taro'
import type { ISystemInfo } from './common'

/**
 * RAM 缓存：随进程生命周期，重启后丢失
 */
export interface IRamCache {
    launchOptions: Taro.getLaunchOptionsSync.LaunchOptions
}

/**
 * 本地持久缓存：基于 Taro Storage，重启后保留
 */
export interface ILocalCache {
    sysInfo: ISystemInfo
    access_token: string
    refresh_token: string
    expires_at: string
}
