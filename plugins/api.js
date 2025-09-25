import axios from 'axios';

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig();

    const adminAPI = axios.create({
        baseURL: config.public.backend_address,
    });

    adminAPI.interceptors.request.use((request) => {
        const token = useCookie('access-token').value; 
        if (token) {
            request.headers['Authorization'] = `Bearer ${token}`;
        }
        return request;
    });

    adminAPI.interceptors.response.use(
        (response) => response,
            async (error) => {
                const originalRequest = error.config;
                const logout = useLogout()

                if (error.response && error.response.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    if (!isRefreshing) {
                        isRefreshing = true;

                        const refresh = useCookie('refresh-token').value;
                        const config = useRuntimeConfig()

                        // ⚠️ ВАЖНО: используем отдельный, "чистый" axios без интерцепторов
                        const plainAxios = axios.create({
                            baseURL: config.public.backend_address,
                        })

                        try {
                            const res = await plainAxios.post('/refresh', { refresh_token: refresh })
                            const newAccessToken = res.data.access_token;
                            useCookie('access-token').value = newAccessToken;
                            useCookie('refresh-token').value = res.data.refresh_token;

                            isRefreshing = false;
                            onRefreshed(newAccessToken);

                            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                            return adminAPI(originalRequest);
                        } catch (err) {
                            isRefreshing = false;
                            logout()
                            return Promise.reject(err);
                        }
                    } else {
                        return new Promise((resolve, reject) => {
                            subscribeTokenRefresh((token) => {
                                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                                resolve(adminAPI(originalRequest));
                            });
                        });
                    }
                }

                return Promise.reject(error);
            }
    );

    nuxtApp.provide('api', adminAPI);
})