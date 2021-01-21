const bodyParser = require("body-parser");
const express = require("express");
const request = require("request");
const Blockchain = require("./blockchain");
const PubSub = require("./app/pubsub");
const TransactionPool = require("./wallet/transaction-pool");
const Wallet = require("./wallet");

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool });

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`

app.use(bodyParser.json());

app.get("/api/blocks", (req, res) => { //res allows us to specify how the get request responds, in this case we want to return the blocks
    res.json(blockchain.chain); //this will send the chain in json format
}); 

app.post("/api/mine", (req, res) => {
    const { data } = req.body; //destructuring req.body, specified in POSTMAN

    blockchain.addBlock({ data });//this will add new block with the data from the requestor

    pubsub.broadcastChain();

    res.redirect("/api/blocks");
});

app.post("/api/transact", (req, res) => {
    const { amount, recipient } = req.body; //these values are specified in POSTMAN app for instance

    let transaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey }); //we need first to check if there are any transactions in the transaction pool

    try {
        if (transaction) {
            transaction.update({ senderWallet: wallet, recipient: recipient, amount: amount });
        } else {
            transaction = wallet.createTransaction({ recipient, amount });
        }
        
    } catch(error) {
        return res.status(400).json({ type: "error", message: error.message }); //return makes sure that the rest of the method does not execute in case of error
    }

    transactionPool.setTransaction(transaction);

    pubsub.broadcastTransaction(transaction); //we broadcast the transaction updates to the network using the pubsub class form app/pubsub

    res.json({ type: "success", transaction });
})

app.get("/api/transaction-pool-map", (req, res) => {
    res.json(transactionPool.transactionMap);
})

const syncWithRootState = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
        if(!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body); //we get the rootChain from the body of the request

            console.log("replace chain on a sync with", rootChain);
            blockchain.replaceChain(rootChain); //we replace the blockchain with the new body
        }
    });

    request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` }, (error, response, body) => {
        if(!error && response.statusCode === 200) {
            const rootTransactionPoolMap = JSON.parse(body);

            console.log("replace transaction chain on a sync with", rootTransactionPoolMap);
            transactionPool.setMap(rootTransactionPoolMap);
        }
    })
};

let PEER_PORT;

if(process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`listening on port localhost:${PORT}`);

    if(PORT !== DEFAULT_PORT) {
        syncWithRootState();
    }
});