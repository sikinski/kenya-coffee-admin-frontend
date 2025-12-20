export function findById(id, array) {
    if (!id || !array || !Array.isArray(array)) {
        return null
    }
    // Приводим оба значения к строкам для сравнения, чтобы избежать проблем с разными типами
    const idStr = String(id)
    return array.find(item => String(item.id) === idStr) || null
}
