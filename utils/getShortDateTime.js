import moment from 'moment-timezone'

export function getShortDateTime(isoDate) {
    const tz = 'Asia/Yekaterinburg'
    const date = moment.tz(isoDate, tz)
    const now = moment.tz(tz)

    if (date.isSame(now, 'day')) {
        // Сегодня: только время
        return date.format('HH:mm')
    } else if (date.isSame(now.clone().subtract(1, 'day'), 'day')) {
        // Вчера
        return `Вчера, ${date.format('HH:mm')}`
    } else {
        // Любой другой день
        // Формат: 10 сен 14:35 или с годом, если не текущий
        const format = date.year() === now.year() ? 'D MMM HH:mm' : 'D MMM YYYY HH:mm'
        return date.format(format)
    }
}
