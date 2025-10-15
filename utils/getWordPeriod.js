export const getWordPeriod = (dates) => {
    if (dates.custom === 'week' || dates === 'week') {
        return 'неделю'
    }
    if (dates.custom === 'month' || dates === 'month') {
        return 'месяц'
    }
    if (dates.custom === 'quarter' || dates === 'quarter') {
        return 'квартал'
    }
    if (dates.from || dates.to) {
        return 'период ' + dates.from + '—' + dates.to
    }

    return dates
}