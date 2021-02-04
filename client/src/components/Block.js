import React, { Component } from "react";
import { Button } from "react-bootstrap";
import Transaction from "./Transaction";

class Block extends Component {
    state = { displayTransaction: false };

    toggleTransaction = () => {
        this.setState({ displayTransaction: !this.state.displayTransaction });
    }

    get displayTransaction () { //the jsx remains the same each time compared to logic within render()
        const { data } = this.props.block; //props passed down from Block.js

        const stringifiedData = JSON.stringify(data);

        const dataDisplay = stringifiedData.length > 35 ?`${stringifiedData.substring(0, 35)}...` : stringifiedData;

        if (this.state.displayTransaction) {
            return (
                <div>
                    {
                        data.map(transaction => (
                            <div key={transaction.id}>
                                <hr />
                                <Transaction transaction={transaction}/>
                            </div> 
                        ))
                    }
                    <br />
                    <Button 
                        variant="danger"
                        size="sm"
                        onClick={this.toggleTransaction}
                    >
                        Show Less
                    </Button>

                </div>
            )
        }

        return (
            <div>
                <div>Data: {dataDisplay}</div>
                <Button 
                    variant="danger"
                    size="sm"
                    onClick={this.toggleTransaction}
                >
                    Show More
                </Button>
            </div>
            );
    }

    render() {
        const { timestamp, hash } = this.props.block; //props passed down from Block.js

        const hashDisplay = `${hash.substring(0, 15)}...`;

        return(
            <div className="Block">
                <div>Hash: {hashDisplay}</div>
                <div>Timestamp:{new Date(timestamp).toLocaleDateString()}</div>
                {this.displayTransaction}
            </div>
        );
    }
};

export default Block;
