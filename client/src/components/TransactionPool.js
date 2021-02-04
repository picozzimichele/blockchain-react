import React, { Component } from "react";
import { Button } from "react-bootstrap";
import Transaction from "./Transaction";
import { Link } from "react-router-dom";

const POLL_INTERVAL_MS = 10000; //this is basically 10 seconds

class TransactionPool extends Component {
    state = { transactionPoolMap: {} }

    fetchTransactionPoolMap = () => {
        fetch(`${document.location.origin}/api/transaction-pool-map`)
            .then(response => response.json())
            .then(json => this.setState({ transactionPoolMap: json }))
    }

    fetchMineTransactions = () => {
        fetch(`${document.location.origin}/api/mine-transactions`)
            .then(response => {
                if (response.status === 200) {
                    alert("sucess");
                    this.props.history.push("/blocks")
                } else {
                    alert("the mine-transaction block request did not complete")
                }
            })
    }

    componentDidMount() {
        this.fetchTransactionPoolMap()

        this.fetchPoolMapInterval = setInterval(() => this.fetchTransactionPoolMap(), POLL_INTERVAL_MS) //this refreshes the poolmap of transactions every 10 seconds
    }

    componentWillUnmount() {
        clearInterval(this.fetchPoolMapInterval)
    }

    render() {
        return(
            <div className="TransactionPool">
                <div>
                    <Link to="/">Home</Link>
                    <h3>Transaction Pool</h3>
                    {
                        Object.values(this.state.transactionPoolMap).map(transaction => {
                            return(
                                <div key={transaction.id}>
                                    <hr/>
                                    <Transaction transaction={transaction} />
                                </div>
                            )
                        })
                    }
                    <hr/>
                    <Button 
                        variant="danger" 
                        onClick={this.fetchMineTransactions}
                    >
                        Mine the Transaction
                    </Button>
                </div>    
            </div>
        )
    }
}

export default TransactionPool;