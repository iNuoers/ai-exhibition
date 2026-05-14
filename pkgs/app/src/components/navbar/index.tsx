import type { CSSProperties } from 'react'
import type { MenuRect, NavbarProps } from './types'
import { ArrowLeft, WapHomeOutlined } from '@taroify/icons'
import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './index.css'

/** 默认胶囊尺寸（兜底值，视频号直播间等场景获取不到） */
const BASE_MENU_RECT = {
    width: 87,
    height: 32,
    top: 24,
    right: 10,
}

/** 获取微信胶囊按钮位置 */
function getMenuRect(): MenuRect {
    const windowInfo = Taro.getWindowInfo()
    try {
        const raw = Taro.getMenuButtonBoundingClientRect()
        if (raw && typeof raw === 'object' && raw.width) {
            return raw as MenuRect
        }
    }
    catch { /* fallback */ }

    return {
        ...BASE_MENU_RECT,
        right: windowInfo.windowWidth - BASE_MENU_RECT.right,
        bottom: BASE_MENU_RECT.top + BASE_MENU_RECT.height,
        left: windowInfo.windowWidth - BASE_MENU_RECT.right - BASE_MENU_RECT.width,
    }
}

/** 获取节点位置信息 */
function queryRect(selector: string): Promise<{ right: number, width: number }> {
    return new Promise((resolve) => {
        const query = Taro.createSelectorQuery()
        query
            .select(selector)
            .boundingClientRect((res: any) => {
                resolve(res || { right: 0, width: 0 })
            })
            .exec()
    })
}

/**
 * 计算导航栏布局所有数值
 * 对应 TDesign 的 initStyle + calcCenterStyle
 */
function calcLayout(menuRect: MenuRect, leftRight: number) {
    const windowInfo = Taro.getWindowInfo()
    const statusBarHeight = windowInfo.statusBarHeight || 0
    const navHeight = (menuRect.top - statusBarHeight) * 2 + menuRect.height
    const navRight = windowInfo.windowWidth - menuRect.left

    // 标题居中核心算法：取 leftRight 和 navRight 的最大值
    // 保证标题在左右对称区域内真正居中
    const maxSpacing = Math.max(leftRight, navRight)
    const centerWidth = Math.max(menuRect.left - maxSpacing, 0)

    return {
        statusBarHeight,
        navHeight,
        navRight,
        capsuleHeight: menuRect.height,
        capsuleWidth: menuRect.width,
        maxLeftWidth: menuRect.left,
        centerLeft: maxSpacing,
        centerWidth,
    }
}

// ---------- 唯一实例 ID，用于选择器查询 ----------
let navbarUid = 0

export default function Navbar({
    title,
    titleMaxLength,
    fixed = true,
    placeholder = true,
    leftArrow = false,
    visible = true,
    animation = true,
    safeAreaInsetTop = true,
    zIndex = 1,
    background,
    className = '',
    left,
    right,
    capsule,
    delta = 1,
    onGoBack,
    onRightClick,
    onSuccess,
    onFail,
    onComplete,
}: NavbarProps) {
    // 唯一 ID，避免多个 Navbar 实例选择器冲突
    const [uid] = useState(() => `navbar-${++navbarUid}`)

    const [menuRect, setMenuRect] = useState<MenuRect | null>(null)
    const [leftRight, setLeftRight] = useState(0)
    const [hideLeft, setHideLeft] = useState(false)
    const [hideCenter, setHideCenter] = useState(false)
    const [visibleClass, setVisibleClass] = useState('')
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // ---------- 初始化：获取胶囊位置 ----------
    useEffect(() => {
        const rect = getMenuRect()
        setMenuRect(rect)

        // 初始 leftRight = navRight（TDesign: iLeftRect.right = windowWidth - menuRect.left）
        const windowInfo = Taro.getWindowInfo()
        setLeftRight(windowInfo.windowWidth - rect.left)
    }, [])

    // ---------- 渲染后测量左侧实际宽度并更新居中 ----------
    useEffect(() => {
        if (!menuRect) return

        // 等渲染完再测量
        const timer = setTimeout(() => {
            queryRect(`.${uid} .navbar__left`).then((res) => {
                if (res && res.right > leftRight) {
                    setLeftRight(res.right)
                }
            })
        }, 50)

        return () => clearTimeout(timer)
    }, [menuRect, leftArrow, left, capsule, uid]) // eslint-disable-line react-hooks/exhaustive-deps

    // ---------- 监听窗口 resize ----------
    useEffect(() => {
        const onResize = () => {
            const rect = getMenuRect()
            setMenuRect(rect)
        }
        Taro.onWindowResize(onResize)
        return () => Taro.offWindowResize(onResize)
    }, [])

    // ---------- 监听胶囊按钮位置变化（重叠检测） ----------
    useEffect(() => {
        const api = (Taro as any).onMenuButtonBoundingClientRectWeightChange
        if (!api) return

        const callback = (capsuleRect: { left: number }) => {
            Promise.all([
                queryRect(`.${uid} .navbar__left`),
                queryRect(`.${uid} .navbar__center`),
            ]).then(([leftRect, centerRect]) => {
                const lRight = Math.round(leftRect?.right || 0)
                const cRight = Math.round(centerRect?.right || 0)
                const cLeft = capsuleRect.left

                setHideLeft(lRight > cLeft)
                setHideCenter(lRight > cLeft ? true : cRight > cLeft)
            })
        }

        api(callback)
        return () => {
            const offApi = (Taro as any).offMenuButtonBoundingClientRectWeightChange
            if (offApi) offApi(callback)
        }
    }, [uid])

    // ---------- visible 动画 ----------
    useEffect(() => {
        const base = visible ? 'navbar--visible' : 'navbar--hide'
        setVisibleClass(animation ? `${base}-animation` : base)

        if (animation) {
            if (timerRef.current) clearTimeout(timerRef.current)
            timerRef.current = setTimeout(() => {
                setVisibleClass(base)
            }, 300)
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [visible, animation])

    // ---------- 计算布局 ----------
    const layout = useMemo(() => {
        if (!menuRect) return null
        return calcLayout(menuRect, leftRight)
    }, [menuRect, leftRight])

    // ---------- 返回 ----------
    const handleGoBack = useCallback(() => {
        onGoBack?.()
        if (delta > 0) {
            Taro.navigateBack({
                delta,
                success: e => onSuccess?.(e),
                fail: e => onFail?.(e),
                complete: e => onComplete?.(e),
            })
        }
    }, [delta, onGoBack, onSuccess, onFail, onComplete])

    // ---------- 标题截断 ----------
    const showTitle = useMemo(() => {
        if (typeof title !== 'string') return title
        if (!titleMaxLength || title.length <= titleMaxLength) return title
        return `${title.slice(0, titleMaxLength)}...`
    }, [title, titleMaxLength])

    if (!layout) return null

    // ---------- 样式计算 ----------
    const paddingTop = safeAreaInsetTop ? layout.statusBarHeight : 0

    const contentStyle: CSSProperties = {
        paddingTop: `${paddingTop}px`,
        height: `${layout.navHeight}px`,
        width: `calc(100% - ${layout.navRight}px)`,
        paddingRight: `${layout.navRight}px`,
        background: background || 'white',
        zIndex,
    }

    const placeholderStyle: CSSProperties = {
        paddingTop: `${paddingTop}px`,
        height: `${layout.navHeight}px`,
    }

    const centerStyle: CSSProperties = {
        left: `${layout.centerLeft}px`,
        width: `${layout.centerWidth}px`,
        height: `${layout.navHeight}px`,
    }

    return (
        <View
            className={[
                'navbar',
                uid,
                fixed ? 'navbar--fixed' : '',
                visibleClass,
                className,
            ].filter(Boolean).join(' ')}
        >
            {/* 占位 */}
            {fixed && placeholder && (
                <View className='navbar__placeholder' style={placeholderStyle} />
            )}

            {/* 实际导航栏 */}
            <View className='navbar__content' style={contentStyle}>
                {/* 左侧区域 */}
                <View
                    className={`navbar__left${hideLeft ? ' navbar__left--hide' : ''}`}
                    style={{ maxWidth: `${layout.maxLeftWidth}px` }}
                >
                    {leftArrow && (
                        <View
                            className='navbar__btn'
                            onClick={handleGoBack}
                            aria-role='button'
                            aria-label='返回'
                        >
                            <ArrowLeft size='24' />
                        </View>
                    )}
                    {left}
                    {capsule && (
                        <View
                            className='navbar__capsule'
                            style={{
                                width: `${layout.capsuleWidth}px`,
                                height: `${layout.capsuleHeight}px`,
                            }}
                        >
                            {capsule}
                        </View>
                    )}
                </View>

                {/* 中间标题 */}
                <View
                    className={`navbar__center${hideCenter ? ' navbar__center--hide' : ''}`}
                    style={centerStyle}
                >
                    {typeof showTitle === 'string'
                        ? <Text className='navbar__center-title'>{showTitle}</Text>
                        : showTitle}
                </View>

                {/* 右侧区域 */}
                {right && (
                    <View className='navbar__right' onClick={onRightClick}>
                        {right}
                    </View>
                )}
            </View>
        </View>
    )
}

/**
 * 仿 TDesign 胶囊：返回 + 首页组合按钮
 * 用法: <Navbar capsule={<NavbarCapsule onBack={...} onHome={...} showHome={true} />} />
 * 按钮宽度 = 系统胶囊宽度 / 2，按钮数量自动撑开胶囊总宽
 */
export function NavbarCapsule({
    onBack,
    onHome,
    showHome = true,
}: {
    onBack?: () => void
    onHome?: () => void
    showHome?: boolean
}) {
    const btnWidth = useMemo(() => {
        const rect = getMenuRect()
        return Math.round(rect.width / 2)
    }, [])

    return (
        <View className='navbar-capsule'>
            <View
                className='navbar-capsule__btn'
                style={{ width: `${btnWidth}px` }}
                onClick={onBack}
                aria-role='button'
                aria-label='返回'
            >
                <ArrowLeft size='20' />
            </View>
            {showHome && (
                <>
                    <View className='navbar-capsule__divider' />
                    <View
                        className='navbar-capsule__btn'
                        style={{ width: `${btnWidth}px` }}
                        onClick={onHome}
                        aria-role='button'
                        aria-label='首页'
                    >
                        <WapHomeOutlined size='20' />
                    </View>
                </>
            )}
        </View>
    )
}
