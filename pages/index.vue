<template>
    <div class="auth-page center">
        <div class="auth-container">
            <h1 class="auth-title">Кения</h1>
            <div class="auth-form">
                <div class="input-wrapper">
                    <input type="text" class="input" name="login" v-model="authForm.username" placeholder="Username" />
                    <span class="error-icon icon" v-if="validationError && !authForm.username" v-motion-pop></span>
                </div>

                <div class="input-wrapper">
                    <input type="password" class="input" name="password" v-model="authForm.password"
                        placeholder="Password" />
                    <span class="error-icon icon" v-if="validationError && !authForm.password" v-motion-pop></span>
                </div>

                <span class="error" v-if="errorText">
                    {{ errorText }}
                </span>
                <button class="login-btn" @click.prevent="username">Войти</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
const validationError = ref(false)
const router = useRouter()
const errorText = ref('')
const { $api } = useNuxtApp()

const authForm = ref({
    username: '',
    password: ''
})

const username = async () => {
    const backend_address = useRuntimeConfig().public.backend_address

    validationError.value = false
    errorText.value = ''

    if (!authForm.value.username || !authForm.value.password) {
        validationError.value = true
        return
    }

    await axios.post(`${backend_address}/auth`, authForm.value).then(res => {
        const accessToken = useCookie('access-token', {
            maxAge: 60 * 60 * 24,
            sameSite: 'strict',
            secure: false, // fix in production
        })
        accessToken.value = res.data.access_token

        const refreshToken = useCookie('refresh-token', {
            maxAge: 60 * 60 * 24 * 90,
            sameSite: 'strict',
            secure: false,
        })
        refreshToken.value = res.data.refresh_token

        const user_name = useCookie('user_name')
        user_name.value = res.data.user_name

        $api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;

        if (accessToken.value && refreshToken.value) {
            router.push('/home')
        }
    }).catch((e) => {

        errorText.value = e?.response?.data?.error
    })
}

onMounted(async () => {
    if (useCookie('access-token').value && useCookie('refresh-token').value) {
        router.push('/home')
    }
})

definePageMeta({
    layout: false,
})

useHead({
    title: 'Авторизация — Кения',
})
</script>

<style lang="sass">
@use '@/assets/styles/adaptive' as *
@use '@/assets/styles/forms' as *
.auth-page
    background: linear-gradient(135deg, #f9f4ef 0%, #ffffff 100%)
    height: 100vh
    display: flex
    align-items: center
    justify-content: center
    padding: 20px

    .auth-container
        width: 100%
        max-width: 400px
        background-color: #fff
        border-radius: 20px
        padding: 40px 32px
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1)
        border: 1px solid var(--border-color)

    .auth-title
        font-size: 32px
        font-weight: 700
        color: var(--text-color)
        text-align: center
        margin-bottom: 32px

    .auth-form
        display: flex
        flex-direction: column
        gap: 20px
        .input-wrapper
            position: relative
            background-color: #fff
            width: 100%
            .input
                width: 100%
                padding: 14px 16px
                border: 1px solid var(--border-color)
                border-radius: 12px
                font-size: 15px
                transition: all 0.2s ease
                background-color: #fff
                &:focus
                    outline: none
                    border-color: var(--accent-red)
                    box-shadow: 0 0 0 3px rgba(232, 69, 32, 0.1)
                &::placeholder
                    color: var(--text-light)
            .error-icon
                position: absolute
                right: 12px
                top: 50%
                transform: translateY(-50%)
        .login-btn
            background-color: var(--accent-red)
            color: #fff
            border: none
            padding: 14px 24px
            border-radius: 12px
            font-size: 16px
            font-weight: 600
            cursor: pointer
            transition: all 0.2s ease
            margin-top: 8px
            &:hover
                background-color: var(--accent-orange)
                transform: translateY(-1px)
                box-shadow: 0 4px 12px rgba(232, 69, 32, 0.3)
        .error
            color: var(--accent-red)
            font-size: 13px
            text-align: center
            padding: 8px 12px
            background-color: rgba(232, 69, 32, 0.1)
            border-radius: 8px
            border: 1px solid rgba(232, 69, 32, 0.2)

@media only screen and (min-width: $bp-tablet)
    .auth-page
        .auth-container
            padding: 48px 40px
        .auth-title
            font-size: 36px
            margin-bottom: 40px
        .auth-form
            gap: 24px
            .input-wrapper
                .input
                    padding: 16px 20px
                    font-size: 16px
            .login-btn
                padding: 16px 28px
                font-size: 17px
</style>