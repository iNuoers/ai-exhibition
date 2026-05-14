import type { ReactNode } from 'react'
import { Text, View } from '@tarojs/components'

interface ListItemProps {
    /** 左侧图标（ReactNode） */
    icon?: ReactNode
    /** 标签文字 */
    label: string
    /** 右侧内容（默认显示箭头 >） */
    rightContent?: ReactNode
    /** 点击事件 */
    onClick?: () => void
    /** 自定义容器类名 */
    className?: string
    /** 自定义标签类名 */
    labelClassName?: string
}

export default function ListItem({
    icon,
    label,
    rightContent,
    onClick,
    className = '',
    labelClassName = '',
}: ListItemProps) {
    return (
        <View
            className={`flex items-center justify-between px-4 py-3 ${className}`}
            onClick={onClick}
        >
            <View className='flex items-center'>
                {icon && <View className='mr-3'>{icon}</View>}
                <Text className={`text-base font-bold ${labelClassName}`}>{label}</Text>
            </View>
            <View className='flex items-center'>
                {rightContent ?? <Text className='text-gray-400'>›</Text>}
            </View>
        </View>
    )
}
