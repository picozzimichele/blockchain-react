const { STARTING_BALANCE } = require("../config");
const { ec, cryptoHash } = require("../utility");
const Transaction = require("./transaction")

class Wallet {
    constructor() {
        this.balance = STARTING_BALANCE; //we start with a balance of coin in the wallet

        this.keyPair = ec.genKeyPair(); //this generates a public and private key

        this.publicKey = this.keyPair.getPublic().encode("hex"); //we get the public key and convert it into hex value
    }

    sign(data) {
        return this.keyPair.sign(cryptoHash(data)); //we hash the data as it is better for optimization
    }

    createTransaction({ recipient, amount }) {
        if(amount > this.balance) {
            throw new Error("amount exceeds balance")
        }

        return new Transaction({ senderWallet: this, recipient, amount }); //we want to reference as the senderWallet this wallet itself
    }
}

module.exports = Wallet;