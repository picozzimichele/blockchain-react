const Wallet = require("./index");
const { verifySignature } = require("../utility");
const Transaction = require("./transaction");

describe("Wallet", () => {
    let wallet;

    beforeEach(() => {
        wallet = new Wallet();
    });

    it("has a `balance`", () => {
        expect(wallet).toHaveProperty("balance");
    });

    it("has a `publicKey`", () => {
        expect(wallet).toHaveProperty("publicKey");
    });

    describe("signing data", () => {
        const data = "foobar";

        it("verifies a signature", () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: wallet.sign(data)
                })
            ).toBe(true);
        });

        it("does not verify an invalid signature", () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: new Wallet().sign(data)
                })
            ).toBe(false);
        });
    });

    describe("createTransaction()", () => {
        describe("and the amount exceeds the balance", () => {
            it("throws and error", () => {
                expect(() => wallet.createTransaction({ amount: 999999, recipient: "foo-recipient"})).toThrow("amount exceeds balance"); //createTransaction has to be referenced from a callbackfunction
            });
        });

        describe("and the amount is valid", () => {
            let transaction, amount, recipient;

            beforeEach(() => {
                amount = 10
                recipient = "foo-recipient"
                transaction = wallet.createTransaction({ amount, recipient })
            })

            it("creates an instance of `Transaction`", () => {
                expect(transaction instanceof Transaction).toBe(true);
            });

            it("matches the transaction input with the wallet", () => {
                expect(transaction.input.address).toEqual(wallet.publicKey);
            });

            it("outputs the amount to the recipient", () => {
                expect(transaction.outputMap[recipient]).toEqual(amount);
            });
        });
    });
});