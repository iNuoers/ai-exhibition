import type { ReactNode } from 'react'
import { View } from '@tarojs/components'
import { memo } from 'react'

interface FloatingButtonProps {
    /** 点击按钮时的回调函数 */
    onClick: () => void
    /** 按钮内容（图标或文字） */
    children?: ReactNode
    /** 自定义定位类名，默认右下角 */
    className?: string
}

/**
 * 悬浮按钮组件
 */
const FloatingButton = memo(
    ({ onClick, children = '+', className = 'bottom-18 right-4' }: FloatingButtonProps) => {
        return (
            <View
                className={`fixed ${className} z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 shadow-lg active:scale-95`}
                onClick={onClick}
            >
                {typeof children === 'string' ? (
                    <View className='text-2xl text-white'>{children}</View>
                ) : (
                    children
                )}
            </View>
        )
    },
)

FloatingButton.displayName = 'FloatingButton'

export default FloatingButton
