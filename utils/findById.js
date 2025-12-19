export function findById(id, array) {
    if (!id || !array || !Array.isArray(array)) {
        return null
    }
    return array.find(item => item.id === id) || null
}
