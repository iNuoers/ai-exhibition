/** @type {import('tailwindcss').Config} */
module.exports = {
    // 告诉 Tailwind 去哪里扫描你的 React 类名
    content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
    corePlugins: {
        // 小程序不需要浏览器的默认样式重置
        preflight: false,
    },
}
