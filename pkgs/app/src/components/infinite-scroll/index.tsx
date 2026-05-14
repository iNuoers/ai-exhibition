import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useCallback, useEffect, useRef, useState } from 'react'

interface InfiniteScrollProps {
    /** 是否还有更多数据 */
    hasMore: boolean
    /** 加载更多回调函数 */
    onLoadMore: () => void
    /** 加载中状态 */
    loading?: boolean
    /** 加载器组件 */
    loader?: React.ReactNode
    /** 全部加载完成显示的内容 */
    endMessage?: React.ReactNode
    /** 子组件 */
    children: React.ReactNode
    /** 包裹容器的类名 */
    className?: string
    /** 底部触发距离，默认 50px */
    threshold?: number
}

interface ObserveResult {
    intersectionRatio: number
}

/**
 * 无限滚动组件，基于微信小程序 IntersectionObserver 实现
 */
const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
    hasMore,
    onLoadMore,
    loading = false,
    loader = <View className='p-3 text-center text-sm text-gray-500'>加载中...</View>,
    endMessage = <View className='p-3 text-center text-sm text-gray-400'>—— 已经到底了 ——</View>,
    children,
    className = '',
    threshold = 50,
}) => {
    const [isVisible, setIsVisible] = useState(false)
    const loadingRef = useRef(false)
    const observerRef = useRef<Taro.IntersectionObserver | null>(null)
    const triggerRef = useRef<string>(`trigger-${Math.random().toString(36).slice(2, 9)}`)

    const setupObserver = useCallback(() => {
        if (observerRef.current) {
            observerRef.current.disconnect()
        }

        const observer = Taro.createIntersectionObserver(
            Taro.getCurrentInstance().page as any,
            { thresholds: [0] },
        )

        observer
            .relativeToViewport({ bottom: threshold })
            .observe(`#${triggerRef.current}`, (res: ObserveResult) => {
                setIsVisible(res.intersectionRatio > 0)
            })

        observerRef.current = observer
    }, [threshold])

    // 处理加载更多
    useEffect(() => {
        if (isVisible && hasMore && !loading && !loadingRef.current) {
            loadingRef.current = true
            onLoadMore()
            setTimeout(() => {
                loadingRef.current = false
            }, 300)
        }
    }, [isVisible, hasMore, loading, onLoadMore])

    // 设置观察器
    useEffect(() => {
        setupObserver()
        return () => {
            observerRef.current?.disconnect()
        }
    }, [setupObserver])

    return (
        <View className={className}>
            {children}
            <View id={triggerRef.current} className='h-px' />
            {loading && loader}
            {!hasMore && !loading && endMessage}
        </View>
    )
}

export default InfiniteScroll
