import { resolve } from 'node:path'
import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'

import devConfig from './dev'
import prodConfig from './prod'
import { logEnv, setupEnv } from './env'

// 设置环境变量
setupEnv();

// 打印环境变量和版本号
logEnv();

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<'vite'>(async (merge) => {
    const baseConfig: UserConfigExport<'vite'> = {
        projectName: 'exhibition-app',
        date: '2026-5-10',
        designWidth: 750,
        deviceRatio: {
            375: 2,
            640: 2.34 / 2,
            750: 1,
            828: 1.81 / 2
        },
        alias: {
            "~": resolve(process.cwd(), "src"),
        },
        sourceRoot: 'src',
        // 开启多端同步调试
        outputRoot: `dist/${process.env.TARO_ENV}`,
        plugins: [
            // 通过命令行工具快速、规范地创建页面和组件
            "@tarojs/plugin-generator",
            // 让Taro项目支持使用标准的HTML标签
            "@tarojs/plugin-html",
            // 为Taro增强Hooks能力的库，能更好地与React等框架集成
            "@taro-hooks/plugin-react"
        ],
        defineConstants: {
        },
        copy: {
            patterns: [
            ],
            options: {
            }
        },
        framework: 'react',
        compiler: {
            type: 'vite',
            vitePlugins: [
                ...(UnifiedViteWeappTailwindcssPlugin({ appType: 'taro' }) ?? []),
            ],
        },
        mini: {
            postcss: {
                tailwindcss: {
                    enable: true,
                    config: {}
                },
                autoprefixer: {
                    enable: true,
                    config: {}
                },
                pxtransform: {
                    enable: true,
                    config: {

                    }
                },
                cssModules: {
                    enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
                    config: {
                        namingPattern: 'module', // 转换模式，取值为 global/module
                        generateScopedName: '[name]__[local]___[hash:base64:5]'
                    }
                }
            },
            // https://github.com/NervJS/taro/issues/7160
            miniCssExtractPluginOption: {
                ignoreOrder: true,
            },
            optimizeMainPackage: {
                enable: true,
            },
        },
        h5: {
            publicPath: '/',
            staticDirectory: 'static',

            miniCssExtractPluginOption: {
                ignoreOrder: true,
                filename: 'css/[name].[hash].css',
                chunkFilename: 'css/[name].[chunkhash].css'
            },
            postcss: {
                autoprefixer: {
                    enable: true,
                    config: {}
                },
                cssModules: {
                    enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
                    config: {
                        namingPattern: 'module', // 转换模式，取值为 global/module
                        generateScopedName: '[name]__[local]___[hash:base64:5]'
                    }
                }
            },
        },
        rn: {
            appName: 'taroDemo',
            postcss: {
                cssModules: {
                    enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
                }
            }
        }
    }


    if (process.env.NODE_ENV === 'development') {
        // 本地开发构建配置（不混淆压缩）
        return merge({}, baseConfig, devConfig)
    }
    // 生产构建配置（默认开启压缩混淆等）
    return merge({}, baseConfig, prodConfig)
})
