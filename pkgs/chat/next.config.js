/** @type {import('next').NextConfig} */
const nextConfig = {
  // 开发时代理 API 请求，避免 CORS
  // 注意：/api/public/*/chat/stream 由 Route Handler 处理（透传 SSE 流），不走 rewrite
  async rewrites() {
    const dest = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'
    return {
      // beforeFiles 优先级最高，但 Route Handler 会先匹配 app/api 路由
      // 所以只要 Route Handler 存在就不会走 rewrite
      // 为保险起见，用 has 排除 stream 路径
      fallback: [
        {
          source: '/api/:path*',
          destination: `${dest}/:path*`,
        },
      ],
    }
  },
}

module.exports = nextConfig
