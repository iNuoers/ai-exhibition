import type { CSSProperties, FC, PropsWithChildren } from 'react'
import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'

interface KeyboardAdaptivePopupProps {
    open: boolean
    onClose: () => void
    placement?: 'center' | 'bottom' | 'top' | 'left' | 'right'
    rounded?: boolean
    zIndex?: number
    closeOnOverlayClick?: boolean
    className?: string
    style?: CSSProperties
}

/**
 * 适配键盘高度的自定义弹出层组件
 */
const KeyboardAdaptivePopup: FC<PropsWithChildren<KeyboardAdaptivePopupProps>> = ({
    open,
    onClose,
    placement = 'bottom',
    rounded = false,
    zIndex = 1010,
    closeOnOverlayClick = true,
    className = '',
    style = {},
    children,
}) => {
    const [keyboardHeight, setKeyboardHeight] = useState(0)
    const [animation, setAnimation] = useState(false)

    // 处理键盘高度变化
    useEffect(() => {
        if (!open) return

        const onKeyboardChange = (res: { height: number }) => {
            setKeyboardHeight(res.height)
        }

        Taro.onKeyboardHeightChange(onKeyboardChange)
        return () => {
            Taro.offKeyboardHeightChange(onKeyboardChange)
        }
    }, [open])

    // 处理弹窗开关动画
    useEffect(() => {
        if (open) {
            setTimeout(() => setAnimation(true), 10)
        } else {
            setAnimation(false)
        }
    }, [open])

    // 计算容器位置样式
    const getContentPositionStyle = (): CSSProperties => {
        const baseStyle: CSSProperties = { zIndex: zIndex + 1 }

        switch (placement) {
            case 'bottom':
                return {
                    ...baseStyle,
                    left: 0,
                    right: 0,
                    bottom: keyboardHeight > 0 ? `${keyboardHeight}px` : 0,
                    borderTopLeftRadius: rounded ? '16px' : 0,
                    borderTopRightRadius: rounded ? '16px' : 0,
                    transform: animation ? 'translateY(0)' : 'translateY(100%)',
                    transition: 'transform 0.3s ease, bottom 0.3s ease',
                }
            case 'top':
                return {
                    ...baseStyle,
                    left: 0,
                    right: 0,
                    top: 0,
                    borderBottomLeftRadius: rounded ? '16px' : 0,
                    borderBottomRightRadius: rounded ? '16px' : 0,
                    transform: animation ? 'translateY(0)' : 'translateY(-100%)',
                    transition: 'transform 0.3s ease',
                }
            case 'left':
                return {
                    ...baseStyle,
                    left: 0,
                    top: 0,
                    bottom: 0,
                    borderTopRightRadius: rounded ? '16px' : 0,
                    borderBottomRightRadius: rounded ? '16px' : 0,
                    transform: animation ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.3s ease',
                }
            case 'right':
                return {
                    ...baseStyle,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    borderTopLeftRadius: rounded ? '16px' : 0,
                    borderBottomLeftRadius: rounded ? '16px' : 0,
                    transform: animation ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.3s ease',
                }
            case 'center':
            default:
                return {
                    ...baseStyle,
                    top: '50%',
                    left: '50%',
                    borderRadius: rounded ? '16px' : 0,
                    transform: animation
                        ? 'translate(-50%, -50%) scale(1)'
                        : 'translate(-50%, -50%) scale(0.8)',
                    opacity: animation ? 1 : 0,
                    transition: 'transform 0.3s ease, opacity 0.3s ease',
                }
        }
    }

    const handleOverlayClick = () => {
        if (closeOnOverlayClick) onClose()
    }

    const handleContentClick = (e: { stopPropagation: () => void }) => {
        e.stopPropagation()
    }

    if (!open) return null

    return (
        <View
            className='fixed inset-0 flex items-center justify-center'
            style={{ zIndex }}
            catchMove
        >
            {/* 背景蒙层 */}
            <View
                className={`absolute inset-0 bg-black transition-opacity duration-300 ${animation ? 'opacity-70' : 'opacity-0'}`}
                onClick={handleOverlayClick}
            />
            {/* 内容容器 */}
            <View
                className={`absolute bg-white ${className}`}
                style={{ ...style, ...getContentPositionStyle() }}
                onClick={handleContentClick}
            >
                {children}
            </View>
        </View>
    )
}

export default KeyboardAdaptivePopup
