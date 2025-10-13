import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
import 'dayjs/locale/ru.js'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)
dayjs.locale('ru')

const TZ = 'Asia/Yekaterinburg'

export function getShortDateTime(isoDate) {
    const date = dayjs(isoDate).tz(TZ)
    const now = dayjs().tz(TZ)

    if (date.isSame(now, 'day')) {
        // Сегодня
        return date.format('HH:mm')
    } else if (date.isSame(now.subtract(1, 'day'), 'day')) {
        // Вчера
        return `Вчера, ${date.format('HH:mm')}`
    } else {
        // Другие дни
        const formatStr = date.year() === now.year() ? 'D MMM HH:mm' : 'D MMM YYYY HH:mm'
        return date.format(formatStr)
    }
}
