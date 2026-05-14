import type { PropsWithChildren } from 'react'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'

/**
 * 延迟渲染组件
 * @description 针对页面内容渲染较多导致白屏率过高时，使用该组件延迟渲染内容
 * @example
 * ```tsx
 * <NextTickWrapper>
 *   <HeavyContent />
 * </NextTickWrapper>
 * ```
 */
const NextTickWrapper = ({ children }: PropsWithChildren) => {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        Taro.nextTick(() => setIsMounted(true))
    }, [])

    return isMounted ? <>{children}</> : null
}

export default NextTickWrapper
