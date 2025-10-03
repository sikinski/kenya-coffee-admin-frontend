export function getShortDateTime(isoDate) {

    const date = new Date(isoDate);
    const now = new Date();

    // Челябинск UTC+5
    const tz = 'Asia/Yekaterinburg';

    // Преобразуем к Челябинскому времени
    const localDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
    const localNow = new Date(now.toLocaleString('en-US', { timeZone: tz }));

    const isSameDay =
        localDate.getDate() === localNow.getDate() &&
        localDate.getMonth() === localNow.getMonth() &&
        localDate.getFullYear() === localNow.getFullYear();

    const yesterday = new Date(localNow);
    yesterday.setDate(localNow.getDate() - 1);
    const isYesterday =
        localDate.getDate() === yesterday.getDate() &&
        localDate.getMonth() === yesterday.getMonth() &&
        localDate.getFullYear() === yesterday.getFullYear();

    const options = {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    };

    // Добавляем год, если он не текущий
    if (localDate.getFullYear() !== localNow.getFullYear()) {
        options.year = 'numeric';
    }

    if (isSameDay) {
        return localDate.toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz });
    } else if (isYesterday) {
        return `Вчера, ${localDate.toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz })}`;
    } else {
        return localDate.toLocaleString('ru-RU', options).replace(',', '');
    }
}