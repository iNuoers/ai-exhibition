import type { PropsWithChildren, ReactNode } from 'react'
import { PullRefresh } from '@taroify/core'
import '@taroify/core/pull-refresh/style'
import { View } from '@tarojs/components'
import { getCurrentPages } from '@tarojs/taro'
import { useCallback, useEffect, useMemo, useState } from 'react'
import LoadingAnimation from '~/components/loading-animation'
import Navbar, { NavbarCapsule } from '~/components/navbar'
import { ADAPTED_PAGES, RouteNames } from '~/constants/routes'
import { navigateBack, reLaunch } from '~/utils/route'
import BottomActions from './bottom-actions'

interface PageWrapperProps extends PropsWithChildren {
    className: string
    /** 是否显示导航栏 */
    shouldShowNavigation?: boolean
    /** 是否显示导航菜单（返回/首页按钮） */
    shouldShowNavigationMenu?: boolean
    /** 是否显示底部 Tab 栏 */
    shouldShowBottomActions?: boolean
    /** 导航栏标题 */
    navTitle?: ReactNode
    /** 导航栏自定义类名 */
    navClassName?: string
    /** 导航栏背景色 */
    navBackground?: string
    /** 是否启用下拉刷新 */
    enablePullToRefresh?: boolean
    /** 刷新回调函数 */
    onRefresh?: () => Promise<void>
    /** 是否正在刷新 */
    isRefreshing?: boolean
    /** 自定义背景类名 */
    backgroundClassName?: string
    /** 是否显示加载遮罩 */
    loading?: boolean
}

/** 不显示左侧返回/首页胶囊的页面 */
const TAB_PAGES = [
    ADAPTED_PAGES[RouteNames.HOME],
    ADAPTED_PAGES[RouteNames.PROFILE],
]

export default function PageWrapper({
    navTitle,
    navClassName,
    navBackground,
    children,
    isRefreshing,
    className,
    shouldShowNavigation = true,
    shouldShowNavigationMenu = true,
    shouldShowBottomActions = true,
    onRefresh,
    enablePullToRefresh = false,
    backgroundClassName,
    loading = false,
}: PageWrapperProps) {
    const [showBack, setShowBack] = useState(false)
    const [showHome, setShowHome] = useState(false)

    useEffect(() => {
        if (!shouldShowNavigationMenu) return
        const pages = getCurrentPages()
        if (pages.length === 0) return

        const currentPage = pages[pages.length - 1]
        let currentUrl = currentPage?.route || (currentPage as any)?.__route__ || ''
        if (currentUrl[0] === '/') currentUrl = currentUrl.substring(1)
        const currentRoute = currentUrl.split('?')[0]
        const isTabPage = TAB_PAGES.includes(currentRoute)

        setShowBack(pages.length > 1 && !isTabPage)
        setShowHome(
            pages.length > 2
            && currentRoute !== ADAPTED_PAGES[RouteNames.HOME]
            && !isTabPage,
        )
    }, [shouldShowNavigationMenu])

    const handleGoBack = useCallback(() => navigateBack(), [])
    const handleGoHome = useCallback(() => reLaunch(RouteNames.HOME), [])

    const capsuleNode = useMemo(() => {
        if (!shouldShowNavigationMenu || !showBack) return undefined
        return (
            <NavbarCapsule
                onBack={handleGoBack}
                onHome={handleGoHome}
                showHome={showHome}
            />
        )
    }, [shouldShowNavigationMenu, showBack, showHome, handleGoBack, handleGoHome])

    const content = <View className={className}>{children}</View>
    const wrapperBg = backgroundClassName || 'bg-gray-50'

    return (
        <View className={`relative flex min-h-screen flex-col ${wrapperBg}`}>
            {shouldShowNavigation && (
                <Navbar
                    title={navTitle}
                    className={navClassName}
                    background={navBackground}
                    leftArrow={false}
                    capsule={capsuleNode}
                    delta={0}
                />
            )}
            {enablePullToRefresh ? (
                <PullRefresh loading={isRefreshing} onRefresh={onRefresh} className='h-full w-full'>
                    {content}
                </PullRefresh>
            ) : (
                content
            )}
            {loading && (
                <View className='absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80'>
                    <LoadingAnimation />
                </View>
            )}
            {shouldShowBottomActions && <BottomActions />}
        </View>
    )
}
