import { cache } from '~/cache'
import Taro, { getAppAuthorizeSetting, getAppBaseInfo, getDeviceInfo, getWindowInfo } from '@tarojs/taro'
import type { AppEnvironment, ISystemInfo } from '~/types'

export type { ISystemInfo, AppEnvironment }

/** 获取系统信息并写入缓存 */
async function getSystemInfo(): Promise<ISystemInfo> {
    const systemInfo: ISystemInfo = {
        appBaseInfo: getAppBaseInfo(),
        windowInfo: getWindowInfo(),
        appAuthorizeSetting: getAppAuthorizeSetting(),
        deviceInfo: getDeviceInfo(),
    }
    await cache.set('sysInfo', systemInfo)
    return systemInfo
}

/**
 * 获取系统信息（优先从缓存读取）
 */
export async function getSystemInfoByCache(force = false): Promise<ISystemInfo> {
    if (force) return getSystemInfo()

    const cached = await cache.get('sysInfo')
    return cached && Object.keys(cached).length > 0 ? cached : getSystemInfo()
}

/** 获取当前小程序运行环境 */
export function getCurrentEnvironment(): AppEnvironment {
    try {
        const { envVersion } = Taro.getAccountInfoSync().miniProgram
        switch (envVersion) {
            case 'develop': return 'development'
            case 'trial': return 'preview'
            case 'release': return 'production'
            default: return 'development'
        }
    } catch {
        return 'development'
    }
}
