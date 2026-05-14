'use client'

import { memo, useMemo } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import PreBlock from './pre-block'

/**
 * Markdown 渲染组件 — 参考 better-chatbot 的实现
 *
 * 支持: GFM 表格/任务列表、数学公式 (KaTeX)、代码高亮 (shiki)
 */
function Markdown({ children }: { children: string }) {
  const components = useMemo<Components>(
    () => ({
      pre: PreBlock as Components['pre'],
      code: ({ children, className, ...props }) => {
        // 行内代码（非代码块）
        const isInline = !className
        if (isInline) {
          return (
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm text-pink-600" {...props}>
              {children}
            </code>
          )
        }
        return <code className={className} {...props}>{children}</code>
      },
      table: ({ children }) => (
        <div className="my-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            {children}
          </table>
        </div>
      ),
      th: ({ children }) => (
        <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-medium">
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td className="border border-gray-200 px-3 py-2">{children}</td>
      ),
      blockquote: ({ children }) => (
        <blockquote className="my-3 rounded-lg border-l-4 border-blue-300 bg-blue-50/50 py-2 pl-4 pr-3 text-gray-700">
          {children}
        </blockquote>
      ),
      a: ({ href, children }) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline decoration-blue-300 underline-offset-2 hover:text-blue-600"
        >
          {children}
        </a>
      ),
      ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-6">{children}</ul>,
      ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-6">{children}</ol>,
      p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
      h1: ({ children }) => <h1 className="mb-3 mt-5 text-2xl font-bold">{children}</h1>,
      h2: ({ children }) => <h2 className="mb-2 mt-4 text-xl font-bold">{children}</h2>,
      h3: ({ children }) => <h3 className="mb-2 mt-3 text-lg font-semibold">{children}</h3>,
    }),
    [],
  )

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={components}
    >
      {children}
    </ReactMarkdown>
  )
}

export default memo(Markdown, (prev, next) => prev.children === next.children)
