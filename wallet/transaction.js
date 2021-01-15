const { v1: uuidv1 } = require('uuid');
const { verifySignature } = require("../utility");

class Transaction {
    constructor({ senderWallet, recipient, amount }) {
        this.id = uuidv1();
        this.outputMap = this.createOutputMap({ senderWallet, recipient, amount });
        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
    }

    createOutputMap({ senderWallet, recipient, amount }) { //this is the data that we are signing as part of the transaction
        const outputMap = {};

        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

        return outputMap;
    }

    createInput({ senderWallet, outputMap }) {
        return {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(outputMap)
        };
    }

    update({ senderWallet, recipient, amount }) {
        if(amount > this.outputMap[senderWallet.publicKey]) {
            throw new Error("amount exceeds balance");
        }

        if(!this.outputMap[recipient]) {
            this.outputMap[recipient] = amount;
        }else {
            this.outputMap[recipient] = this.outputMap[recipient] + amount;
        }

        this.outputMap[senderWallet.publicKey] = this.outputMap[senderWallet.publicKey] - amount;

        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
    }

    static validTransaction(transaction) {
        const { input, outputMap } = transaction; //destructuring transaction
        const { address, amount, signature } = input; //destructuring input

        const outputTotal = Object.values(outputMap).reduce((total, outputAmount) => //we reduce the outputMap array values to a single one
            total + outputAmount //the total + each of the outputs
        ) 

        if(amount !== outputTotal) {
            console.error(`Invalid transaction from address: ${address}`);
            return false;
        }

        if(!verifySignature({ publicKey: address, data: outputMap, signature: signature })) {
            console.error(`Invalid signature from address: ${address}`);
            return false;
        }

        return true;
    }
}

module.exports = Transaction;