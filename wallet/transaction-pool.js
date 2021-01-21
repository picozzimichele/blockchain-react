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
}

module.exports = TransactionPool;