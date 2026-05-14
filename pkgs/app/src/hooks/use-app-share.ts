import Taro, { useLoad, useShareAppMessage, useShareTimeline } from '@tarojs/taro'

/**
 * 展会 Agent 分享功能
 * 支持分享到聊天和朋友圈
 */
export default function useAppShare(options?: {
    title?: string
    path?: string
    imageUrl?: string
}) {
    const {
        title = '展会智能助手',
        path = '/pages/index/index',
        imageUrl,
    } = options || {}

    useLoad(() => {
        Taro.showShareMenu({
            withShareTicket: true,
            showShareItems: ['shareAppMessage', 'shareTimeline'],
        })
    })

    useShareAppMessage(() => ({
        title,
        path,
        imageUrl,
    }))

    useShareTimeline(() => ({
        title,
        path,
    }))
}
