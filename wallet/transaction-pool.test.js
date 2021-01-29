const TransactionPool = require("./transaction-pool");
const Transaction = require("./transaction");
const Wallet = require("./index");
const Blockchain = require("../blockchain");

describe("TransactionPool", () => {
    let transaction, transactionPool, senderWallet;

    beforeEach(() => {
        transactionPool = new TransactionPool();
        senderWallet = new Wallet(),
        transaction = new Transaction({
            senderWallet,
            recipient: "fake-recipient",
            amount: 10
        });
    });

    describe("setTransaction()", () => {
        it("adds a transaction", () => {
            transactionPool.setTransaction(transaction);

            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction)
        });
    });

    describe("existingTransaction()", () => {
        it("returns an existing transaction given an input adress", () => {
            transactionPool.setTransaction(transaction);

            expect(
                transactionPool.existingTransaction({ inputAddress: senderWallet.publicKey })
            ).toBe(transaction)
        })
    });

    describe("validTransactions()", () => {
        let validTransaction, errorMock;

        beforeEach(() => {
            validTransaction = [];
            errorMock = jest.fn();
            global.console.error = errorMock; //this is to remove the errors from test console

            for (let i = 0; i < 10; i++) {
                transaction = new Transaction({
                    senderWallet,
                    recipient: "any-recipient",
                    amount: 30
                });

                if (i % 3 === 0) {
                    transaction.input.amount = 999999 //we make the amount invalid
                } else if (i % 3 === 1) {
                    transaction.input.signature = new Wallet().sign("foo"); //we make the signature invalid
                } else {
                    validTransaction.push(transaction); //we push the valid transactions into the array
                }

                transactionPool.setTransaction(transaction); //we need to set the transaction within the Pool each time
            }
        });

        it("returns valid transactions", () => {
            expect(transactionPool.validTransactions()).toEqual(validTransaction);
        });

        it("logs errors for the invalid transaction", () => {
            transactionPool.validTransactions();
            expect(errorMock).toHaveBeenCalled();
        })


    })

    describe("clear()", () => {
        it("clears the transaction", () => {
            transactionPool.clear();

            expect(transactionPool.transactionMap).toEqual({});
        })
    });

    describe("clearBlockchainTransactions()", () => {
        it("clears the Pool of any existing blockchain transaction", () => {
            const blockchain = new Blockchain();
            const expectedTransactionMap = {};

            for (let i = 0; i < 6; i++) {
                const transaction = new Wallet().createTransaction({
                    recipient: "foo",
                    amount: 20
                });

                transactionPool.setTransaction(transaction);

                if (i % 2 === 0) {
                    blockchain.addBlock({ data: [transaction] })
                } else {
                    expectedTransactionMap[transaction.id] = transaction;
                }
            }

            transactionPool.clearBlockchainTransactions({ chain: blockchain.chain });

            expect(transactionPool.transactionMap).toEqual(expectedTransactionMap)
        });
    });
});
