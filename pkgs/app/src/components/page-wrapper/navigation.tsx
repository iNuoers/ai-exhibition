import type { NavBarProps, NavigationProps, MenuButtonInfo } from './types'
import { View } from '@tarojs/components'
import Taro, { usePageScroll } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import NavigationMenu from '~/components/page-wrapper/navigation-menu'
import { ADAPTED_PAGES, RouteNames } from '~/constants/routes'

function NavBar({ title, navClassName, renderCustomHeader, menuButton, shouldShowNavigationMenu }: NavBarProps) {
    const navHeight = menuButton.top + menuButton.height + (menuButton.top - menuButton.statusBarHeight)
    const { statusBarHeight } = menuButton
    const horizontalPadding = menuButton.width + menuButton.marginRight * 2

    const [scrolled, setScrolled] = useState(false)

    usePageScroll(({ scrollTop }) => {
        if (scrollTop > navHeight / 8) {
            !scrolled && setScrolled(true)
        } else {
            scrolled && setScrolled(false)
        }
    })

    return (
        <>
            <View
                className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
                    scrolled ? 'bg-white/60 backdrop-blur-md' : ''
                } ${navClassName || ''}`}
            >
                <View
                    style={{
                        height: `${navHeight}px`,
                        paddingTop: `${statusBarHeight}px`,
                    }}
                >
                    {shouldShowNavigationMenu && (
                        <NavigationMenu
                            homeUrl={ADAPTED_PAGES[RouteNames.HOME]}
                            menuButton={menuButton}
                        />
                    )}
                    <View
                        className='flex h-full flex-col items-center justify-center'
                        style={{
                            marginLeft: `${horizontalPadding}px`,
                            marginRight: `${horizontalPadding}px`,
                        }}
                    >
                        <View className='w-full truncate text-center text-base font-bold'>
                            {title}
                        </View>
                    </View>
                </View>
                {renderCustomHeader?.(navHeight, statusBarHeight, horizontalPadding)}
            </View>
            {/* 占位元素 */}
            <View className='invisible relative' style={{ top: '-999px' }}>
                <View style={{ height: `${navHeight}px`, width: '100%' }} />
                {renderCustomHeader?.(navHeight, statusBarHeight, horizontalPadding)}
            </View>
        </>
    )
}

export default function Navigation({
    navTitle,
    navClassName,
    renderCustomHeader,
    shouldShowNavigationMenu,
}: NavigationProps) {
    const [menuButton, setMenuButton] = useState<MenuButtonInfo | null>(null)

    useEffect(() => {
        try {
            const windowInfo = Taro.getWindowInfo()
            const menuButtonInfo = Taro.getMenuButtonBoundingClientRect()
            setMenuButton({
                top: menuButtonInfo.top,
                height: menuButtonInfo.height,
                statusBarHeight: windowInfo.statusBarHeight || 0,
                width: menuButtonInfo.width,
                marginRight: windowInfo.windowWidth - menuButtonInfo.right,
            })
        } catch (error) {
            console.error('获取菜单按钮信息失败:', error)
        }
    }, [])

    return menuButton ? (
        <NavBar
            title={navTitle}
            menuButton={menuButton}
            shouldShowNavigationMenu={shouldShowNavigationMenu}
            navClassName={navClassName}
            renderCustomHeader={renderCustomHeader}
        />
    ) : null
}
