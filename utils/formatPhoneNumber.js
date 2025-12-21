/**
 * Форматирует номер телефона в формат +7 (000) 000-00-00
 * @param {string} value - Входное значение (может содержать любые символы)
 * @returns {string} - Отформатированный номер телефона
 */
export function formatPhoneNumber(value) {
    if (!value) return ''

    // Удаляем все символы кроме цифр
    let digits = value.replace(/\D/g, '')

    // Если номер начинается с 8, заменяем на 7
    if (digits.startsWith('8')) {
        digits = '7' + digits.slice(1)
    }

    // Если номер не начинается с 7, добавляем 7 в начало
    if (digits && !digits.startsWith('7')) {
        digits = '7' + digits
    }

    // Ограничиваем длину до 11 цифр (7 + 10 цифр)
    if (digits.length > 11) {
        digits = digits.slice(0, 11)
    }

    // Форматируем: +7 (000) 000-00-00
    if (digits.length === 0) {
        return ''
    }

    if (digits.length <= 1) {
        return `+${digits}`
    }

    if (digits.length <= 4) {
        return `+7 (${digits.slice(1)}`
    }

    if (digits.length <= 7) {
        return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`
    }

    if (digits.length <= 9) {
        return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    }

    // Полный формат: +7 (000) 000-00-00
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`
}

/**
 * Обработчик события input для форматирования телефонного номера
 * Использование: @input="formatPhoneInput"
 * @param {Event} event - Событие input
 */
export function formatPhoneInput(event) {
    const formatted = formatPhoneNumber(event.target.value)
    event.target.value = formatted
    return formatted
}

