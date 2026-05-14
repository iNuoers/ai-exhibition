import type { ReactNode } from 'react'
import type { RouteName } from '~/constants/routes'
import { FixedView } from '@taroify/core'
import '@taroify/core/fixed-view/style'
import { Text, View } from '@tarojs/components'
import { getCurrentInstance, useDidShow } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { PAGES, RouteNames } from '~/constants/routes'
import { reLaunch } from '~/utils/route'

export default function BottomActions() {
    const getCurrentPath = () => getCurrentInstance().router?.path || ''

    const [currentPage, setCurrentPage] = useState(getCurrentPath())

    useDidShow(() => setCurrentPage(getCurrentPath()))

    useEffect(() => {
        setCurrentPage(getCurrentPath())
    }, [])

    // 只在 tab 页面显示底部导航
    const showBottomActions = Object.values(PAGES).some((path) => {
        const normalized = currentPage.replace(/^\//, '').split('?')[0]
        return normalized === path.replace(/^\//, '')
    })

    const isCurrentTab = (pagePath: string) => {
        const normalized = currentPage.replace(/^\//, '').split('?')[0]
        return normalized === pagePath.replace(/^\//, '')
    }

    const handleTabSwitch = (route: RouteName) => reLaunch(route)

    if (!showBottomActions) return null

    return (
        <FixedView position='bottom' safeArea='bottom'>
            <View
                className='mx-auto mb-3 flex justify-around rounded-full bg-white px-4 py-2 shadow-lg'
                style={{ width: 'fit-content' }}
            >
                <TabButton
                    active={isCurrentTab(PAGES[RouteNames.HOME])}
                    onClick={() => handleTabSwitch(RouteNames.HOME)}
                    index={0}
                >
                    ⌂
                </TabButton>
                <TabButton
                    active={isCurrentTab(PAGES[RouteNames.PROFILE])}
                    onClick={() => handleTabSwitch(RouteNames.PROFILE)}
                    index={1}
                >
                    ☺
                </TabButton>
            </View>
        </FixedView>
    )
}

interface TabButtonProps {
    active: boolean
    onClick: () => void
    index: number
    children: ReactNode
}

function TabButton({ active, onClick, index, children }: TabButtonProps) {
    const marginClass = index === 0 ? 'mr-2' : 'ml-2'

    return (
        <View
            className={`flex h-10 w-10 items-center justify-center rounded-full ${marginClass} ${
                active ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
            }`}
            onClick={onClick}
        >
            <Text className='text-base'>{children}</Text>
        </View>
    )
}
