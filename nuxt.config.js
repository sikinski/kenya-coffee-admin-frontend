// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    css: ['@/assets/styles/index.sass'],

    modules: ['@vueuse/motion/nuxt'],

    runtimeConfig: {
        public: {
            backend_address: process.env.BACKEND_ADDRESS,
        }
    },

    components: [
        { path: '~/components/ui', prefix: 'ui' },
        '~/components',
    ],

    // Hide warnings in build
    vite: {
        css: {
            devSourcemap: false,
        },
        logLevel: 'error',
    }
})
