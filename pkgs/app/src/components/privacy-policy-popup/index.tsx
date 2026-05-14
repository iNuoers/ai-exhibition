import { Button, Popup } from '@taroify/core'
import '@taroify/core/popup/style'
import '@taroify/core/button/style'
import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useCallback } from 'react'

interface PrivacyPolicyPopupProps {
    open: boolean
    onClose: () => void
}

/**
 * 隐私政策弹窗
 * 首次打开小程序时展示，用户同意后关闭
 */
export default function PrivacyPolicyPopup({ open, onClose }: PrivacyPolicyPopupProps) {
    const handleAgree = useCallback(() => {
        Taro.setStorageSync('privacy_agreed', 'true')
        onClose()
    }, [onClose])

    const handleDisagree = useCallback(() => {
        Taro.exitMiniProgram()
    }, [])

    // 阻止默认关闭行为（强制用户做出选择）
    const handleClose = useCallback(() => {}, [])

    return (
        <Popup open={open} placement='bottom' rounded onClose={handleClose}>
            <Popup.Backdrop closeable={false} />
            <View className='mx-auto max-w-md rounded-t-2xl bg-white p-6 shadow-lg'>
                <View className='mb-4 text-center text-lg font-bold'>展会智能助手隐私保护指引</View>
                <View className='mb-4 space-y-2 text-xs leading-relaxed text-gray-700'>
                    <View>
                        点击"同意并继续"表示你已阅读并理解
                        <Text className='text-blue-600'>《用户协议》</Text>
                        <Text>和</Text>
                        <Text className='text-blue-600'>《隐私政策》</Text>
                        ，同意开启基本业务功能。
                    </View>
                    <View>
                        当你在使用过程中自愿开启功能时，我们将告知提供该功能所必须收集的个人信息范围并征得你的单独同意。
                        针对收集敏感个人信息、向第三方共享你的信息以及获取设备系统权限，我们都将单独征得你的同意。
                    </View>
                    <View>若点击"不同意并退出"，你将无法使用我们的产品和服务，并会退出本小程序。</View>
                </View>
                <View className='space-y-2'>
                    <Button className='font-bold' color='primary' shape='round' block onClick={handleAgree}>
                        同意并继续
                    </Button>
                    <Button className='font-bold' shape='round' block onClick={handleDisagree}>
                        不同意并退出
                    </Button>
                </View>
            </View>
        </Popup>
    )
}
