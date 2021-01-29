const Transaction = require("./transaction");

class TransactionPool {
    constructor() {
        this.transactionMap = {}; //creates a transactionMap object
    }

    setTransaction(transaction) {
        this.transactionMap[transaction.id] = transaction; //this sets the id of the transaction in the Map accoring to its id
    }

    setMap(transactionMap) {
        this.transactionMap = transactionMap; //the new transactionMap value is coming from the rootValue in syncWithRootState()
    }

    existingTransaction({ inputAddress }) {
        const transactions = Object.values(this.transactionMap); //we get back an array of all the transactions

        return transactions.find(transaction => transaction.input.address === inputAddress); //we look at all the transactions as check if there is one that matches the inputAddress
    }

    validTransactions() { 
        return Object.values(this.transactionMap).filter( //we want to get an array of all the transactions currently in the map, then filter it using the validTransaction() from Transaction class     
            transaction => Transaction.validTransaction(transaction) //iterating over each transaction and checking if it is valid, filter removes the invalids already
        );


    }

    clear() {
        this.transactionMap = {};
    }

    clearBlockchainTransactions({ chain }) {
        for (let i = 1; i < chain.length; i++ ) { // we start from 1 to skip the genesis block
            const block = chain[i];

            for (let transaction of block.data) {
                if (this.transactionMap[transaction.id]) { //if the transactionMap contains a transaction id we delete that data
                    delete this.transactionMap[transaction.id];
                }
            }
        }
    }
}

module.exports = TransactionPool;