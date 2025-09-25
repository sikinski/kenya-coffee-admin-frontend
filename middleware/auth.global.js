export default defineNuxtRouteMiddleware(async (to, from) => {
    const { $api } = useNuxtApp()
    if(to.fullPath !== '/') {
        if (!useCookie('access-token').value || !useCookie('refresh-token').value) {
            return navigateTo("/");
        }  else {
            $api.defaults.headers.common['Authorization'] = `Bearer ${useCookie('access-token').value}`;
    }
    }
});