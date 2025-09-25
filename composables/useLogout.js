// composables/useLogout.ts
export function useLogout() {
    console.log('start');

    const router = useRouter()
    const accessToken = useCookie('access-token')
    const refreshToken = useCookie('refresh-token')
    const userName = useCookie('user_name')
    const { $api } = useNuxtApp()

    accessToken.value = ''
    refreshToken.value = ''
    userName.value = ''
    $api.defaults.headers.common['Authorization'] = ''
    router.push('/')
    window.location.reload()
}