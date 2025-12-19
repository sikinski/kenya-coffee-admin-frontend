export function getImageUrl(path) {
    if (!path) return ''

    // Если путь уже полный URL, возвращаем как есть
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path
    }

    // Получаем конфигурацию runtime
    const config = useRuntimeConfig()
    const backendAddress = config.public.backend_address || ''

    // Убираем лишние слэши и формируем полный URL
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    const cleanBackend = backendAddress.endsWith('/') ? backendAddress.slice(0, -1) : backendAddress

    return `${cleanBackend}${cleanPath}`
}
