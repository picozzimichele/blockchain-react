const crypto = require("crypto"); //this is the native nodejs module that contains different crypto related function

const cryptoHash = (...inputs) => {
    const hash = crypto.createHash("sha256"); //using the SHA-256 hash

    hash.update(inputs.map(input => JSON.stringify(input)).sort().join(" ")); //creates an hash that we can access based on a string argument, creates an hash. We need to map and stringify the input as to render each cryptohash unique

    return hash.digest("hex"); //digest is used to represent the result of an hash, we convert into hexToBinary only when checking the difficulty
};

module.exports = cryptoHash;