export function toQueryString(obj, prefix = '') {
    const parts = [];

    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;

        const value = obj[key];

        if (value === null || value === undefined || value === '') continue;

        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (Array.isArray(value)) {
            const filteredArray = value.filter(v => v !== null && v !== undefined && v !== '');
            if (filteredArray.length > 0) {
                parts.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(filteredArray.join(','))}`);
            }
        } else if (typeof value === 'object') {
            const nested = toQueryString(value, fullKey);
            if (nested) {
                parts.push(nested.slice(1)); // удаляем ведущий "?" у вложенных
            }
        } else {
            parts.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(value)}`);
        }
    }

    return parts.length > 0 ? `${parts.join('&')}` : '';
}