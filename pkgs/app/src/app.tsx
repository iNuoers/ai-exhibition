import { PropsWithChildren } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from '@taroify/core'
import '@taroify/core/config-provider/style'
import { View } from '@tarojs/components'
import { useLaunch } from '@tarojs/taro'

import { useTheme } from '~/hooks/use-theme'
import { queryClient } from './lib/react-query'
import './app.css'

function App({ children }: PropsWithChildren) {
    const { getThemeVars } = useTheme()

    useLaunch(() => {
        console.log('App launched.')
    })

    return (
        <QueryClientProvider client={queryClient}>
            <ConfigProvider theme={getThemeVars()}>
                <View className='font-sans antialiased'>{children}</View>
            </ConfigProvider>
        </QueryClientProvider>
    )
}

export default App
