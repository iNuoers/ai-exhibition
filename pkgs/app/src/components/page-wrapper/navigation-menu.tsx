import type { NavigationMenuProps } from './types'
import { Text, View } from '@tarojs/components'
import { getCurrentPages } from '@tarojs/taro'
import { useCallback, useEffect, useState } from 'react'
import { ADAPTED_PAGES, RouteNames } from '~/constants/routes'
import { navigateBack, reLaunch } from '~/utils/route'

/**
 * 仿微信原生胶囊按钮：
 * - 只有返回：单按钮胶囊
 * - 返回 + 首页：双按钮胶囊，中间竖线分隔
 */
function CapsuleMenu({ menuButton, homeUrl }: NavigationMenuProps) {
    const [showBack, setShowBack] = useState(false)
    const [showHome, setShowHome] = useState(false)

    const handleGoBack = useCallback(() => navigateBack(), [])
    const handleGoHome = useCallback(() => reLaunch(RouteNames.HOME), [])

    useEffect(() => {
        const pages = getCurrentPages()
        if (pages.length > 0) {
            const currentPage = pages[pages.length - 1]
            let currentUrl = currentPage?.route || (currentPage as any)?.__route__

            const noMenuPages = [
                ADAPTED_PAGES[RouteNames.HOME],
                ADAPTED_PAGES[RouteNames.PROFILE],
            ]

            if (currentUrl?.[0] === '/') {
                currentUrl = currentUrl.substring(1)
            }
            const currentRoute = currentUrl?.split('?')[0]
            const isNoMenuPage = noMenuPages.includes(currentRoute!)

            setShowBack(pages.length > 1 && !isNoMenuPage)
            setShowHome(pages.length > 2 && currentRoute !== homeUrl && !isNoMenuPage)
        }
    }, [homeUrl])

    if (!showBack && !showHome) return null

    const capsuleHeight = menuButton.height

    return (
        <View
            className='fixed z-50 flex flex-row items-center'
            style={{
                top: `${menuButton.top}px`,
                left: `${menuButton.marginRight}px`,
            }}
        >
            <View
                className='flex flex-row items-center overflow-hidden rounded-full'
                style={{
                    height: `${capsuleHeight}px`,
                    border: '1px solid rgba(0, 0, 0, 0.15)',
                    background: 'rgba(0, 0, 0, 0.05)',
                }}
            >
                {/* 返回按钮 */}
                <View
                    className='flex items-center justify-center active:bg-black/10'
                    style={{
                        width: `${capsuleHeight}px`,
                        height: `${capsuleHeight}px`,
                    }}
                    onClick={handleGoBack}
                >
                    {/* SVG 返回箭头 — 模仿微信原生 */}
                    <Text className='text-sm font-bold' style={{ color: 'rgba(0, 0, 0, 0.9)' }}>
                        ‹
                    </Text>
                </View>

                {/* 分隔线 + 首页按钮 */}
                {showHome && (
                    <>
                        <View
                            style={{
                                width: '1px',
                                height: '60%',
                                background: 'rgba(0, 0, 0, 0.15)',
                            }}
                        />
                        <View
                            className='flex items-center justify-center active:bg-black/10'
                            style={{
                                width: `${capsuleHeight}px`,
                                height: `${capsuleHeight}px`,
                            }}
                            onClick={handleGoHome}
                        >
                            <View
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    position: 'relative',
                                }}
                            >
                                {/* 简易房屋 icon：用 border 画三角屋顶 + 方形房体 */}
                                <View
                                    style={{
                                        position: 'absolute',
                                        top: '1px',
                                        left: '2px',
                                        width: '0',
                                        height: '0',
                                        borderLeft: '7px solid transparent',
                                        borderRight: '7px solid transparent',
                                        borderBottom: '6px solid rgba(0, 0, 0, 0.9)',
                                    }}
                                />
                                <View
                                    style={{
                                        position: 'absolute',
                                        bottom: '1px',
                                        left: '4px',
                                        width: '10px',
                                        height: '8px',
                                        background: 'rgba(0, 0, 0, 0.9)',
                                        borderRadius: '1px',
                                    }}
                                />
                            </View>
                        </View>
                    </>
                )}
            </View>
        </View>
    )
}

export default function NavigationMenu({ homeUrl, menuButton }: NavigationMenuProps) {
    if (!menuButton || process.env.TARO_ENV === 'alipay') return null
    return <CapsuleMenu menuButton={menuButton} homeUrl={homeUrl} />
}
