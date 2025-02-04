"use client"
import { Transaction } from "@/classes";
import RawTransaction from "@/components/RawTransaction";
import useSessionStorage from "@/hooks/useSessionStorage";
import { formatHexBytes } from "@/utils";
import { parseRawTx } from "@/utils/parseRawTx";
import { useState } from "react";

export default function Page() {
    const [rawTxData, setRawTxData] = useState("");
    const [loading, setLoading] = useState(false);
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const txIdSession = useSessionStorage('txId');
    const rawTxDataSession = useSessionStorage('rawTxDataJson');

    // Function to restore the class instance from session storage
    const restoreTransaction = (data: string) => {
        const parsedData = JSON.parse(data);
        return Object.assign(new Transaction(), parsedData);
    }

    function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const transactionId = formData.get('txId') as string;

        if (transactionId) {
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
                    sessionStorage.setItem('rawTxDataJson', JSON.stringify(parsedTransaction));
                    sessionStorage.setItem('txId', transactionId);
                }).catch((error) => {
                    console.error(error);
                    setLoading(false);
                });
        } else setLoading(false);
    }

    const parsedTransaction = rawTxDataSession ? restoreTransaction(rawTxDataSession) : null;

    return (
        <div className="flex flex-col items-center justify-start w-full p-8 sm:p-20 sm:pt-8">
            <form className="flex flex-col w-full bg-white shadow-lg rounded-xl p-6 space-y-6" onSubmit={handleFormSubmit}>
                <h1 className="text-3xl font-bold text-center text-gray-800">Enter Transaction ID</h1>
                <input
                    type="text"
                    name="txId"
                    id="txId"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Transaction ID"
                    defaultValue={txIdSession || ""}
                />
                <button
                    type="submit"
                    className="w-full p-4 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 active:scale-95 transition-all duration-300">
                    Decode Transaction
                </button>
            </form>

            <div className="w-full mt-8">
                <p className="font-bold w-full text-start mb-2 text-gray-700">Transaction Data:</p>
                {loading && <p className="text-black mt-4 font-bold w-full text-center">Loading...</p>}
                {transaction && !loading ? (
                    <RawTransaction rawTxDataJson={transaction} />
                ) : (parsedTransaction || rawTxDataSession || rawTxData) && !loading ? (
                    <RawTransaction rawTxDataJson={parsedTransaction || JSON.parse(rawTxDataSession)} />
                ) : null}
            </div>
        </div>
    );
}