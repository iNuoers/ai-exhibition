import { Text, View } from '@tarojs/components'
import PageWrapper from '~/components/page-wrapper'
import { RouteNames } from '~/constants/routes'
import { navigateTo } from '~/utils/route'

/**
 * 详情页 — 从首页进入，导航栏显示「返回」按钮
 */
export default function DemoDetail() {
    return (
        <PageWrapper navTitle='详情页' className='p-4'>
            <View className='space-y-6'>
                <View className='rounded-2xl bg-white p-4 shadow-sm'>
                    <Text className='text-base font-medium text-gray-800'>这是详情页</Text>
                    <Text className='mt-1 text-sm text-gray-500'>
                        导航栏左侧有「返回」按钮，点击可返回首页。
                    </Text>
                </View>

                <View
                    className='flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm active:bg-gray-50'
                    onClick={() => navigateTo(RouteNames.DEMO_SUB)}
                >
                    <View>
                        <Text className='text-base font-medium text-gray-800'>进入子页面</Text>
                        <Text className='mt-1 text-xs text-gray-400'>导航栏带返回 + 首页按钮</Text>
                    </View>
                    <Text className='text-gray-300'>›</Text>
                </View>
            </View>
        </PageWrapper>
    )
}
