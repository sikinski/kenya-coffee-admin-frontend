export function numberInput(event) {
    let rawValue = event.target.value

    let numeric = rawValue.replace(/[^0-9.]/g, '')

    // Dots
    const parts = numeric.split('.')
    if (parts.length > 2) {
        numeric = parts[0] + '.' + parts.slice(1).join('')
    }

    return numeric
}