const crypto = require("crypto"); //this is the native nodejs module that contains different crypto related function

const cryptoHash = (...inputs) => {
    const hash = crypto.createHash("sha256"); //using the SHA-256 hash

    hash.update(inputs.sort().join(" ")); //creates an hash that we can access based on a string argument, creates an hash

    return hash.digest("hex"); //digest is used to represent the result of an hash
};

module.exports = cryptoHash;