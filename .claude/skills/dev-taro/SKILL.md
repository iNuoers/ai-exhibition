---
name: dev-taro
description: 微信小程序 (pkgs/app) 开发规范。强调使用 Taro 跨端标签，Hooks 生命周期管理，Tailwind 限制以及组件性能优化。
---

# Taro 小程序开发规范

> `pkgs/app` 子包的高质量微信小程序与多端开发指南。

## 何时使用此技能

- 开发或修改小程序页面和组件
- 处理微信特定的 API (如登录、支付、分享)
- 修改小程序的 Tailwind 样式或处理 UI 自适应问题
- 审查 `pkgs/app` 相关代码

## 核心原则

### 🔴 必须遵守的规则

1. **跨端标签**：严禁使用 `<div/>`, `<span/>`, `<a/>` 等 HTML 标签。所有组件必须基于 `@tarojs/components` 提供的 `<View/>`, `<Text/>`, `<Image/>`, `<Button/>` 等标签构建。
2. **样式隔离**：避免小程序不支持的复杂 CSS 嵌套和伪类（如 `:hover`）。在小程序中优先处理不同屏幕尺寸的适配，使用基于 rpx 或 Tailwind 的跨端适配机制。
3. **API 调用**：涉及微信原生能力时，必须使用 `Taro.xxx` 而不是 `wx.xxx`，确保代码依然保持跨端潜力。
4. **包体积限制**：小程序主包大小限制极严。不得在前端随意引入大型第三方库（如 `lodash` 全量包），禁止将大尺寸图片等静态资源直接打包进代码，应使用 CDN。

## 开发流程

### 步骤 1: 页面与组件结构定义

**文件位置**: `pkgs/app/src/pages/` 或 `pkgs/app/src/components/`

```tsx
import React, { useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { useLoad, useDidShow } from '@tarojs/taro'
import './index.css'

export default function ExhibitionList() {
  const [data, setData] = useState([])

  // 替代 React 的 useEffect 进行初始化
  useLoad(() => {
    console.log('Page loaded.')
    fetchData()
  })

  // 每次页面展示时触发
  useDidShow(() => {
    // 处理页面恢复状态
  })

  const fetchData = async () => {
    // 获取数据的逻辑
  }

  return (
    <View className="flex flex-col items-center p-4 bg-gray-50 min-h-screen">
      <Text className="text-xl font-bold text-gray-800 mb-4">展会列表</Text>
      {/* 列表渲染 */}
    </View>
  )
}
```

### 步骤 2: 网络请求与状态管理

统一通过封装好的 request 工具调用 `pkgs/server` 的后端接口。

```typescript
import Taro from '@tarojs/taro'

export const getExhibitions = async () => {
  const res = await Taro.request({
    url: 'https://api.yourdomain.com/exhibitions',
    method: 'GET'
  })
  return res.data
}
```

## 开发示例：长列表优化

在小程序中，列表数据过长会导致页面卡顿甚至崩溃。如果遇到超过 100 条数据的列表，必须使用**虚拟列表 (VirtualList)**。

```tsx
import VirtualList from '@tarojs/components/virtual-list'

function buildData (offset = 0) {
  return Array(100).fill(0).map((_, i) => i + offset)
}

const Row = React.memo(({ id, index, style, data }) => {
  return (
    <View id={id} className={`p-4 border-b ${index % 2 ? 'bg-gray-100' : 'bg-white'}`} style={style}>
      <Text>Row {index} : {data[index]}</Text>
    </View>
  )
})

export default function App () {
  const [data] = useState(buildData(0))

  return (
    <VirtualList
      height={800}
      width='100%'
      itemData={data}
      itemCount={data.length}
      itemSize={50}
    >
      {Row}
    </VirtualList>
  )
}
```
