const guessKeys = array => {
    return array[0] ? Object.keys(array[0]) : [];
}

const guessKeysWithSpecificKeys = (array, ...keys) => {
    return array[0] ? Object.keys(array[0]).filter(item => keys.includes(item)) : [];
}

const guessKeysWithoutSpecificKeys = (array, ...keys) => {
    return array[0] ? Object.keys(array[0]).filter(item => !keys.includes(item)) : [];
}

module.exports = {
    guessKeys,
    guessKeysWithoutSpecificKeys,
    guessKeysWithSpecificKeys
}