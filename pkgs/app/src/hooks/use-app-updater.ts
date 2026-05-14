import { canIUse, getUpdateManager, nextTick, showModal, showToast, useDidShow } from '@tarojs/taro';

/**
 * 自动更新 weapp 版本
 * @param updateSuccessfullyCallback
 */
export function useAppUpdater(updateSuccessfullyCallback?: () => void) {
    return useDidShow(() => {
        nextTick(() => {
            if (!canIUse('getUpdateManager')) {
                return;
            }

            const updateManager = getUpdateManager();

            updateManager.onCheckForUpdate(res => {
                res.hasUpdate &&
                    showToast({
                        title: '发现新版本',
                        icon: 'none',
                        duration: 2000,
                    });
            });

            updateManager.onUpdateReady(() => {
                showModal({
                    title: '更新提示',
                    content: '新版本已经准备好，是否重启应用？',
                    confirmText: '立即重启',
                    cancelText: '稍后再说',
                    success(res) {
                        /**
                         * 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                         * @description
                         *    可以做重置APP的操作，比如缓存等
                         */
                        if (res.confirm) {
                            updateManager.applyUpdate();

                            updateSuccessfullyCallback?.();
                        }
                    },
                });
            });

            updateManager.onUpdateFailed(() => {
                // 新的版本下载失败
                showModal({
                    title: '更新未成功',
                    content: '很抱歉，更新遇到了问题。请尝试重新打开小程序，如果问题持续，可以尝试删除后重新安装。',
                    confirmText: '我明白了',
                    showCancel: false,
                });
            });
        });
    });
}
