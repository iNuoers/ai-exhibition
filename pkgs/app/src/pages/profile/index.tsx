import { Text, View } from '@tarojs/components'
import PageWrapper from '~/components/page-wrapper'
import ListItem from '~/components/list-item'

export default function Profile() {
    return (
        <PageWrapper
            navTitle='我的'
            className='p-4'
            shouldShowNavigationMenu={false}
        >
            <View className='space-y-4'>
                {/* 用户信息区域 */}
                <View className='flex items-center space-x-3 rounded-2xl bg-white p-4 shadow-sm'>
                    <View className='flex h-14 w-14 items-center justify-center rounded-full bg-blue-100'>
                        <Text className='text-2xl'>☺</Text>
                    </View>
                    <View>
                        <Text className='text-lg font-medium text-gray-800'>未登录</Text>
                        <Text className='text-sm text-gray-500'>点击登录账号</Text>
                    </View>
                </View>

                {/* 设置列表 */}
                <View className='rounded-2xl bg-white shadow-sm'>
                    <ListItem icon={<Text>⚙</Text>} label='设置' />
                    <ListItem icon={<Text>ℹ</Text>} label='关于' />
                </View>
            </View>
        </PageWrapper>
    )
}
