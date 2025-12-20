// Возможные значения объемов для напитков
export const VOLUME_OPTIONS = [
    { label: '200 мл', value: '200 мл' },
    { label: '250 мл', value: '250 мл' },
    { label: '300 мл', value: '300 мл' },
    { label: '350 мл', value: '350 мл' },
    { label: '400 мл', value: '400 мл' },
    { label: '450 мл', value: '450 мл' },
    { label: '500 мл', value: '500 мл' },
    { label: '600 мл', value: '600 мл' },
    { label: '750 мл', value: '750 мл' },
    { label: '1 л', value: '1 л' },
]

// Возможные значения веса для еды (в граммах)
export const WEIGHT_OPTIONS = [
    { label: '50 г', value: '50 г' },
    { label: '100 г', value: '100 г' },
    { label: '150 г', value: '150 г' },
    { label: '200 г', value: '200 г' },
    { label: '250 г', value: '250 г' },
    { label: '300 г', value: '300 г' },
    { label: '350 г', value: '350 г' },
    { label: '400 г', value: '400 г' },
    { label: '500 г', value: '500 г' },
]

// Объединенный список всех опций (для универсального использования)
export const ALL_VOLUME_WEIGHT_OPTIONS = [
    ...VOLUME_OPTIONS,
    ...WEIGHT_OPTIONS
]

