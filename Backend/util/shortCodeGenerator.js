const MAX_CHARACTERS = 7;

const generateShortURL = async () => {
    let shortCode = "";
    const base64 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let i = 0; i < MAX_CHARACTERS; i++) {
        shortCode += base64[Math.floor(Math.random() * base64.length)];
    }

    return shortCode;
}

module.exports = generateShortURL;

