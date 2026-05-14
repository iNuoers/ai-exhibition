import { Text, View } from '@tarojs/components'
import PageWrapper from '~/components/page-wrapper'

/**
 * 子页面 — 从详情页进入（页面栈 >= 3），导航栏显示「返回」+「首页」按钮
 */
export default function DemoSub() {
    return (
        <PageWrapper navTitle='子页面' className='p-4'>
            <View className='space-y-6'>
                <View className='rounded-2xl bg-white p-4 shadow-sm'>
                    <Text className='text-base font-medium text-gray-800'>这是子页面</Text>
                    <Text className='mt-1 text-sm text-gray-500'>
                        导航栏左侧同时显示「返回」和「首页」按钮，因为当前页面栈深度 ≥ 3。
                    </Text>
                </View>

                <View className='rounded-2xl bg-blue-50 p-4'>
                    <Text className='text-sm text-blue-700'>
                        点击「‹」返回详情页，点击「⌂」直接回到首页。
                    </Text>
                </View>
            </View>
        </PageWrapper>
    )
}
