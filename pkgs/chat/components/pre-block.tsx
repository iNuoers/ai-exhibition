'use client'

import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  bundledLanguages,
  codeToHast,
  type BundledLanguage,
} from 'shiki'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'

interface PreBlockProps {
  children?: React.ReactNode
}

/**
 * 代码块组件 — 参考 better-chatbot + bolt.new
 *
 * 从 ReactMarkdown 的 `pre > code` 结构中提取代码和语言，
 * 使用 shiki codeToHast → JSX 实现语法高亮。
 */
function PreBlock({ children }: PreBlockProps) {
  const [highlighted, setHighlighted] = useState<React.ReactNode>(null)
  const [copied, setCopied] = useState(false)
  const codeRef = useRef('')
  const langRef = useRef('plaintext')

  // 从 children 提取代码文本和语言
  const child = Array.isArray(children) ? children[0] : children
  if (child && typeof child === 'object' && 'props' in child) {
    const codeProps = child.props as { children?: string; className?: string }
    codeRef.current = typeof codeProps.children === 'string' ? codeProps.children.replace(/\n$/, '') : ''
    const match = /language-(\w+)/.exec(codeProps.className || '')
    langRef.current = match ? match[1] : 'plaintext'
  }

  const code = codeRef.current
  const language = langRef.current

  // shiki 高亮
  useLayoutEffect(() => {
    if (!code) return

    let cancelled = false
    const lang = language in bundledLanguages ? language as BundledLanguage : 'md'

    codeToHast(code, { lang, theme: 'github-dark' }).then((hast) => {
      if (cancelled) return
      const jsx_result = toJsxRuntime(hast, {
        Fragment,
        jsx,
        jsxs,
        components: {
          pre: (props) => <pre {...props} className="overflow-x-auto p-4 text-sm leading-relaxed" />,
        },
      })
      setHighlighted(jsx_result)
    })

    return () => { cancelled = true }
  }, [code, language])

  const handleCopy = () => {
    if (copied) return
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative my-3 overflow-hidden rounded-lg border border-gray-700 bg-[#24292e]">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between border-b border-gray-700 bg-[#1f2428] px-4 py-1.5 text-xs text-gray-400">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="rounded px-2 py-0.5 transition-colors hover:bg-gray-700 hover:text-gray-200"
        >
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      {/* 代码区 */}
      {highlighted || (
        <pre className="animate-pulse overflow-x-auto p-4 text-sm leading-relaxed text-gray-400">
          <code>{code}</code>
        </pre>
      )}
    </div>
  )
}

export default memo(PreBlock)
