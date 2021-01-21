const TransactionPool = require("./transaction-pool");
const Transaction = require("./transaction");
const Wallet = require("./index");

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
});
