const cryptoHash = require("./crypto-hash");

describe("cryptoHash()", () => {

    it("generates a SHA-256 hashed output", () => {
        expect(cryptoHash("foo"))
        .toEqual("b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b"); //SHA-256 always returns same hash if all inputs are the same
    });

    it("produces same hash with the same input regardless of the order", () => {
        expect(cryptoHash("one", "two", "three"))
        .toEqual(cryptoHash("three", "one", "two"))
    });

    it("produces a unique hash when the properties have changed on an input", () => {
        const foo = {};
        const originalHash = cryptoHash(foo);
        foo["a"] = "a"; //we set-up a new property for the foo object

        expect(cryptoHash(foo)).not.toEqual(originalHash);
    });
});