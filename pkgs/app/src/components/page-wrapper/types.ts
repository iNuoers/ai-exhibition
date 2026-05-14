import type { ReactNode } from 'react'

/**
 * 菜单按钮（胶囊）位置信息
 */
export interface MenuButtonInfo {
    /** 按钮顶部距屏幕顶部的距离 (px) */
    top: number
    /** 按钮高度 (px) */
    height: number
    /** 状态栏高度 (px) */
    statusBarHeight: number
    /** 按钮宽度 (px) */
    width: number
    /** 按钮右边距 (px) */
    marginRight: number
}

export interface NavigationProps {
    navTitle?: ReactNode
    navClassName?: string
    shouldShowNavigationMenu: boolean
    renderCustomHeader?: (navHeight: number, statusBarHeight: number, safeAreaRight: number) => ReactNode
}

export interface NavBarProps extends NavigationProps {
    title: ReactNode
    menuButton: MenuButtonInfo
}

export interface NavigationMenuProps {
    homeUrl: string
    menuButton: MenuButtonInfo
}
