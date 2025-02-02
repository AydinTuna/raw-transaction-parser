"use client"
import { Transaction } from "@/classes";
import useSessionStorage from "@/hooks/useSessionStorage";
import { formatHexBytes } from "@/utils";
import { parseRawTx } from "@/utils/parseRawTx";
import { useState } from "react";

export default function Page() {
    const [rawTxData, setRawTxData] = useState("");
    const [txId, setTxId] = useState("");
    const [loading, setLoading] = useState(false);
    const [transaction, setTransaction] = useState<Transaction>();
    const txIdSession = useSessionStorage('txId');
    const rawTxDataSession = useSessionStorage('rawTxData');

    function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const transactionId = formData.get('txId') as string;
        setTxId(transactionId);

        if (txId) {
            console.log(txId);
            // Call the API to get the transaction details
            fetch(`/api/bitcoin/${transactionId}`)
                .then((response) => response.json())
                .then((data) => {
                    setLoading(false);
                    if (data.rawData === "") {
                        setRawTxData("No data found");
                        console.log("No data found");
                        return;
                    }
                    const parsedTransaction = parseRawTx(data.rawData);
                    setTransaction(parsedTransaction);
                    const formattedHexBytes = formatHexBytes(parsedTransaction);
                    setRawTxData(formattedHexBytes);
                    sessionStorage.setItem('rawTxData', formattedHexBytes);
                    sessionStorage.setItem('txId', txId);
                }).catch((error) => {
                    console.error(error);
                    setLoading(false);
                });
        } else setLoading(false);
    }
    return (
        <div className="flex flex-col items-center justify-start w-full p-8 sm:p-20 sm:pt-8">
            <form className="flex flex-col w-full text-center pb-12 gap-4" onSubmit={handleFormSubmit}>
                <h1 className="text-3xl font-bold">Enter Transaction id</h1>
                <input type="text" name="txId" className="w-full p-4 border border-gray-200 rounded-lg" placeholder="Transaction ID" id="txId" defaultValue={txIdSession || ""} />
                <button type="submit" className="w-full p-4 bg-blue-500 text-white rounded-lg">Submit</button>
            </form>
            <p className="font-bold w-full text-start mb-2">Raw tx data:</p>
            {loading && <p className="text-black mt-4 font-bold">Loading...</p>}
            {transaction && !loading ? (
                <pre className="whitespace-pre-wrap break-all p-4 bg-gray-100 rounded-lg shadow-lg">
                    <code>
                        {formatHexBytes(transaction as Transaction)}
                    </code>
                </pre>
            ) : (rawTxDataSession || rawTxData) && !loading ? (
                <pre className="whitespace-pre-wrap break-all p-4 bg-gray-100 rounded-lg shadow-lg">
                    <code>
                        {rawTxDataSession || rawTxData}
                    </code>
                </pre>
            ) : null}
        </div>
    )
}