export const generateRandomString = (length = 6) => {
    return Math.random().toString(20).slice(2, length)
}
    