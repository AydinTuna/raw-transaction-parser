"use client"
import { useState } from "react";

export default function Page() {
    const [rawTxData, setRawTxData] = useState("");
    const [loading, setLoading] = useState(false);

    function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const transactionId = formData.get('txId') as string;

        // Call the API to get the transaction details
        fetch(`/api/bitcoin/${transactionId}`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setLoading(false);
                setRawTxData(data.rawData);
            })
    }
    return (
        <div className="flex flex-col items-center justify-start w-full p-8 sm:p-20 sm:pt-8">
            <form className="flex flex-col w-full text-center pb-12 gap-4" onSubmit={handleFormSubmit}>
                <h1 className="text-3xl font-bold">Enter Transaction id</h1>
                <input type="text" name="txId" className="w-full p-4 border border-gray-200 rounded-lg" placeholder="Transaction ID" id="txId" />
                <button type="submit" className="w-full p-4 bg-blue-500 text-white rounded-lg">Submit</button>
            </form>
            <p className="font-bold w-full text-start mb-2">Raw tx data:</p>
            {loading && <p className="text-black mt-4 font-bold">Loading...</p>}
            {rawTxData && !loading && (
                <pre className="whitespace-pre-wrap break-all p-4 bg-gray-100 rounded-lg shadow-lg">
                    {rawTxData}
                </pre>)}
        </div>
    )
}