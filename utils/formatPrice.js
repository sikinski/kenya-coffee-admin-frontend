export function formatPrice(priceObj) {
    const formatNumber = (num) => {
        return new Intl.NumberFormat('ru-RU').format(num);
    };

    const { from, to } = priceObj;

    if (from && to) {
        return `${formatNumber(from)} — ${formatNumber(to)} ₽`;
    }

    if (from) {
        return `От&nbsp;${formatNumber(from)}&nbsp;₽`;
    }

    if (to) {
        return `До&nbsp;${formatNumber(to)}&nbsp;₽`;
    }

    return '';
}