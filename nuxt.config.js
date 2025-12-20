// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    css: ['@/assets/styles/index.sass'],

    modules: ['@vueuse/motion/nuxt', "nuxt-echarts", "nuxt-swiper"],

    ssr: false,

    runtimeConfig: {
        public: {
            backend_address: process.env.BACKEND_ADDRESS,
            ws_address: process.env.WS_ADDRESS
        }
    },

    echarts: {
        // Options
        renderer: ['svg', 'canvas'],
        charts: ['BarChart', 'LineChart', 'PieChart'],
        components: ['DatasetComponent', 'GridComponent', 'TooltipComponent', 'TitleComponent', 'LegendComponent'],
    },

    components: [
        { path: '~/components/ui', prefix: 'ui' },
        { path: '~/components/charts', prefix: 'charts' },
        '~/components',
    ],


    build: {
        loaders: {
            scss: {
                sassOptions: {
                    quietDeps: true
                }
            }
        }
    },

    app: {
        head: {
            meta: [
                { charset: "utf-8" },
                { name: "viewport", content: "width=device-width, initial-scale=1" },
            ],
            link: [
                { rel: "icon", type: "image/image/png", href: "/favicon.png" },
                { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
            ],
        },
    },
})