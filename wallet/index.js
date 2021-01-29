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

    createTransaction({ recipient, amount, chain }) {
        if (chain) {
            this.balance = Wallet.calculateBalance({
                chain,
                address: this.publicKey
            })
        }

        if(amount > this.balance) {
            throw new Error("amount exceeds balance")
        }

        return new Transaction({ senderWallet: this, recipient, amount }); //we want to reference as the senderWallet this wallet itself
    }

    static calculateBalance({ chain, address }) {
        let hasConductedTransaction = false; //we need to establish if wallet has ever made any transactions
        let outputsTotal = 0;

        for (let i = chain.length-1; i > 0; i--) { //we iterate through the chain from the end to the beginning as wallet is most likely to have a recent transaction through the end
            const block = chain[i];

            for (let transaction of block.data) {
                if (transaction.input.address === address) {
                    hasConductedTransaction = true;
                }

                const addressOutput = transaction.outputMap[address]; //we loop over the blocks and we check the input adress for any transaction

                if (addressOutput) {
                    outputsTotal = outputsTotal + addressOutput;
                }
            }

            if (hasConductedTransaction) { //once we find the most recent transaction for the wallet we want to stop adding the ammounts, no need to check previous transactions
                break;
            }
        }

        return hasConductedTransaction ? outputsTotal : STARTING_BALANCE + outputsTotal; //if the wallet has conducted any transactions it means the STARTING_BALANCE has changed, so we only care about the outputs
    }
}

module.exports = Wallet;