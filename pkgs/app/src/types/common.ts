import { getAppAuthorizeSetting, getAppBaseInfo, getDeviceInfo, getWindowInfo } from '@tarojs/taro'

export interface IAnyObject {
    [key: string]: any
}

/**
 * 从 const object 中提取值的联合类型
 * 用法: type MyEnum = IEnums<typeof MY_CONST_OBJECT>
 */
export type IEnums<T extends Record<keyof T, string | number>> = T[keyof T]

/** 系统信息 */
export interface ISystemInfo {
    appBaseInfo: ReturnType<typeof getAppBaseInfo>
    windowInfo: ReturnType<typeof getWindowInfo>
    appAuthorizeSetting: ReturnType<typeof getAppAuthorizeSetting>
    deviceInfo: ReturnType<typeof getDeviceInfo>
}

/** 小程序运行环境 */
export type AppEnvironment = 'development' | 'preview' | 'production'
