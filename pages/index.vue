<template>
    <div class="auth-page center">
        <h1 class="h1">Новый день</h1>
        <div class="window form mt">
            <div class="input-wrapper">
                <input type="text" class="input" name="name" v-model="authForm.username" />
                <label for="name" class="label-name">
                    <span class="content-name" :class="{ 'valid-input': authForm.username }">Username *</span>
                </label>
                <span class="error-icon icon" v-if="validationError && !authForm.username" v-motion-pop></span>
            </div>

            <div class="input-wrapper">
                <input type="password" class="input" name="name" v-model="authForm.password" />
                <label for="name" class="label-name">
                    <span class="content-name" :class="{ 'valid-input': authForm.password }">Password *</span>
                </label>
                <span class="error-icon icon" v-if="validationError && !authForm.password" v-motion-pop></span>
            </div>

            <span class="error" v-if="errorText">
                {{ errorText }}
            </span>
            <button class="username-btn" @click.prevent="username">Войти</button>
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
    background-color: var(--main-bg)
    background-color: var(--main-dark)
    height: 100vh
    .form
        display: flex
        flex-direction: column
        gap: 10px
        .input-wrapper
            background-color: #fff
            background-color: var(--main-bg)
            width: 300px
            border-radius: 4px
        .username-btn
            background-color: var(--text-color)
            color: var(--main-bg)
            border: none
            padding: 18px 
            border-radius: 4px
        .error
            color: var(--error-color)
            font-size: 12px
            text-align: center
            max-width: 80vw
            margin: 5px auto
</style>