export function getShortDate(dateString) {
    const date = new Date(dateString);

    // массив коротких месяцев на русском
    const months = ["янв.", "фев.", "мар.", "апр.", "май", "июн.", "июл.", "авг.", "сен.", "окт.", "ноя.", "дек."];

    const day = date.getDate();
    const month = months[date.getMonth()];

    const formatted = `${day} ${month}`;

    return formatted

}