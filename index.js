const bodyParser = require("body-parser");
const express = require("express");
const request = require("request");
const path = require("path");
const Blockchain = require("./blockchain");
const PubSub = require("./app/pubsub");
const TransactionPool = require("./wallet/transaction-pool");
const Wallet = require("./wallet");
const TransactionMiner = require("./app/transaction-miner");

const isDevelopment = process.env.ENV === 'development';

const REDIS_URL = isDevelopment ? 
    "redis://127.0.0.1:6379" : 
    "redis://:p0d9dd98916111958fc1a3d93c592fa0f060c94a10d19eaad1fb80762394add07@ec2-3-210-15-236.compute-1.amazonaws.com:6989";
    
const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool, redisUrl: REDIS_URL });
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "client/dist"))); //this is used to serve the js files into html format

app.get("/api/blocks", (req, res) => { //res allows us to specify how the get request responds, in this case we want to return the blocks
    res.json(blockchain.chain); //this will send the chain in json format
}); 

app.get("/api/blocks/length", (req, res) => {
    res.json(blockchain.chain.length);
});

app.get("/api/blocks/:id", (req, res) => {
    const { id } = req.params;
    const { length } = blockchain.chain;

    const blocksReversed = blockchain.chain.slice().reverse(); //we do not want to touch the original blockchain so we use slice() to make a copy of it just for display purposes

    let startIndex = (id - 1) * 5;
    let endIndex = id * 5;

    startIndex = startIndex < length ? startIndex : length;
    endIndex = endIndex < length ? endIndex : length;

    res.json(blocksReversed.slice(startIndex, endIndex));
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
            transaction = wallet.createTransaction({ 
                recipient, 
                amount, 
                chain: blockchain.chain 
            });
        }
        
    } catch(error) {
        return res.status(400).json({ type: "error", message: error.message }); //return makes sure that the rest of the method does not execute in case of error
    }

    transactionPool.setTransaction(transaction);

    pubsub.broadcastTransaction(transaction); //we broadcast the transaction updates to the network using the pubsub class form app/pubsub

    res.json({ type: "success", transaction });
});

app.get("/api/transaction-pool-map", (req, res) => {
    res.json(transactionPool.transactionMap);
})

app.get("/api/mine-transactions", (req, res) => {
    transactionMiner.mineTransaction();

    res.redirect("/api/blocks");
})

app.get("/api/wallet-info", (req, res) => {
    const address = wallet.publicKey

    res.json({ 
        address: address, 
        balance: Wallet.calculateBalance({ chain: blockchain.chain, address: address })
    })
})

app.get("/api/known-addresses", (req, res) => {
    const addressMap = {};

    for (let block of blockchain.chain) {
        for (let transaction of block.data) {
            const recipient = Object.keys(transaction.outputMap);

            recipient.forEach(recipient => addressMap[recipient] = recipient);
        }
    }

    res.json(Object.keys(addressMap));
})

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/dist/index.html"));
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



if (isDevelopment) {

    //THIS IS ARBITRARY GENERATED DATA FOR TEST PURPOSES ONLY

    const walletFoo = new Wallet();
    const walletBar = new Wallet();

    const generateWalletTransaction = ({ wallet, recipient, amount }) => {
        const transaction = wallet.createTransaction({ recipient, amount, chain: blockchain.chain});

        transactionPool.setTransaction(transaction);
    };

    const walletAction = () => generateWalletTransaction({
        wallet: wallet, recipient: walletFoo.publicKey, amount: 5
    })

    const walletFooAction = () => generateWalletTransaction({
        wallet: walletFoo, recipient: walletBar.publicKey, amount: 10
    })

    const walletBarAction = () => generateWalletTransaction({
        wallet: walletBar, recipient: wallet.publicKey, amount: 15
    })

    for (let i = 0; i < 20; i++) {
        if (i % 3 === 0) {
            walletAction();
            walletFooAction();
        } else if (i % 3 === 1) {
            walletAction();
            walletBarAction();
        } else {
            walletFooAction();
            walletBarAction();
        }

        transactionMiner.mineTransaction();
    }

    //THIS IS ARBITRARY GENERATED DATA FOR TEST PURPOSES ONLY * END
}

let PEER_PORT;

if(process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`listening on port localhost:${PORT}`);

    if(PORT !== DEFAULT_PORT) {
        syncWithRootState();
    }
});