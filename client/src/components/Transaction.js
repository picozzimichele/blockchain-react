import React from "react";

const Transaction = ({ transaction }) => { //we destructure the props directly from the Block component
    const { input, outputMap } = transaction;
    const recipients = Object.keys(outputMap);

    return (
        <div className="Transaction">
            <div>From: {`${input.address.substring(0,20)}...`} | Balance: {input.amount}</div>
            {
                recipients.map(recipient => (
                    <div key={recipient}>
                        To: {`${recipient.substring(0,20)}...`} | Sent: {outputMap[recipient]}
                    </div>
                ))
            }
        </div>
    )

}

export default Transaction;