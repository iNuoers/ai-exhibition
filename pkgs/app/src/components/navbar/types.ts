import type { ReactNode } from 'react'

export interface NavbarProps {
    /** 页面标题 */
    title?: ReactNode
    /** 标题文字最大长度，超出用 ... 表示 */
    titleMaxLength?: number
    /** 是否固定在顶部 */
    fixed?: boolean
    /** 固定时是否开启占位 */
    placeholder?: boolean
    /** 是否展示左侧箭头（返回按钮） */
    leftArrow?: boolean
    /** 是否显示 */
    visible?: boolean
    /** 是否添加显示/隐藏动画效果 */
    animation?: boolean
    /** 是否开启顶部安全区适配 */
    safeAreaInsetTop?: boolean
    /** 导航栏层级 */
    zIndex?: number
    /** 导航栏背景色 */
    background?: string
    /** 自定义类名 */
    className?: string
    /** 左侧自定义内容 */
    left?: ReactNode
    /** 右侧自定义内容 */
    right?: ReactNode
    /** 胶囊区域自定义内容（返回+首页组合按钮） */
    capsule?: ReactNode
    /** 返回按钮后退层数，0 则不执行 navigateBack */
    delta?: number
    /** 点击返回箭头时触发 */
    onGoBack?: () => void
    /** 点击右侧区域时触发 */
    onRightClick?: () => void
    /** navigateBack 执行成功后触发 */
    onSuccess?: (e: TaroGeneral.CallbackResult) => void
    /** navigateBack 执行失败后触发 */
    onFail?: (e: TaroGeneral.CallbackResult) => void
    /** navigateBack 执行完成后触发（无论成功失败） */
    onComplete?: (e: TaroGeneral.CallbackResult) => void
}

/** 微信胶囊按钮位置信息 */
export interface MenuRect {
    width: number
    height: number
    top: number
    right: number
    bottom: number
    left: number
}
