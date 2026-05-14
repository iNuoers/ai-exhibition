import { Text, View } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import PageWrapper from '~/components/page-wrapper'
import PrivacyPolicyPopup from '~/components/privacy-policy-popup'
import { RouteNames } from '~/constants/routes'
import { navigateTo } from '~/utils/route'

export default function Index() {
    const [showPrivacy, setShowPrivacy] = useState(false)

    useLoad(() => {
        const hasAgreed = Taro.getStorageSync('privacy_agreed')
        if (!hasAgreed) {
            setShowPrivacy(true)
        }
    })

    return (
        <PageWrapper
            navTitle='展会智能助手'
            className='p-4'
            shouldShowNavigationMenu={false}
        >
            <View className='space-y-6'>
                <View className='flex items-center space-x-2'>
                    <Text className='text-2xl'>👋</Text>
                    <Text className='text-lg font-medium text-gray-800'>你好，欢迎使用展会智能助手</Text>
                </View>

                <View className='rounded-2xl bg-white p-4 shadow-sm'>
                    <Text className='text-base font-medium text-gray-800'>开始探索</Text>
                    <Text className='mt-1 text-sm text-gray-500'>
                        这里是展会智能 Agent 平台，帮助你快速了解展会信息。
                    </Text>
                </View>

                {/* 演示导航 */}
                <View className='space-y-3'>
                    <Text className='text-sm font-medium text-gray-500'>导航演示</Text>
                    <View
                        className='flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm active:bg-gray-50'
                        onClick={() => navigateTo(RouteNames.DEMO_DETAIL)}
                    >
                        <View>
                            <Text className='text-base font-medium text-gray-800'>详情页</Text>
                            <Text className='mt-1 text-xs text-gray-400'>导航栏带返回按钮</Text>
                        </View>
                        <Text className='text-gray-300'>›</Text>
                    </View>
                </View>
            </View>

            <PrivacyPolicyPopup open={showPrivacy} onClose={() => setShowPrivacy(false)} />
        </PageWrapper>
    )
}
