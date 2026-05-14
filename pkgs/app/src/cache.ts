import type Taro from '@tarojs/taro'
import type { IRamCache, ILocalCache, ISystemInfo } from '~/types'
import createCache from '~/utils/cache'

const cache = createCache<IRamCache, ILocalCache>({
    ram: {
        launchOptions: {} as Taro.getLaunchOptionsSync.LaunchOptions,
    },
    local: {
        sysInfo: {} as ISystemInfo,
        access_token: '',
        refresh_token: '',
        expires_at: '',
    },
})

export { cache }
