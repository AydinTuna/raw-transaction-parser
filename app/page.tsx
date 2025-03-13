"use client"
import { Transaction } from "../classes";
import RawTransaction from "../components/RawTransaction";
import useSessionStorage from "../hooks/useSessionStorage";
import { parseRawTx } from "../utils/parseRawTx";
import { useState, useEffect } from "react";

// Example transactions that users can try
import { EXAMPLE_TRANSACTIONS } from "../utils/exampleTxs";

export default function Home() {
  const [rawTxData, setRawTxData] = useState("");
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const txIdSession = useSessionStorage('txId');
  const rawTxDataSession = useSessionStorage('rawTxDataJson');
  const [recentTransactions, setRecentTransactions] = useState<{ id: string, timestamp: number }[]>([]);

  // Function to restore the class instance from session storage
  const restoreTransaction = (data: string) => {
    const parsedData = JSON.parse(data);
    return Object.assign(new Transaction(), parsedData);
  }

  // Load recent transactions from local storage
  useEffect(() => {
    const storedTransactions = localStorage.getItem('recentTransactions');
    if (storedTransactions) {
      setRecentTransactions(JSON.parse(storedTransactions));
    }
  }, []);

  // Save recent transactions to local storage
  const saveToRecentTransactions = (txId: string) => {
    const updatedTransactions = [
      { id: txId, timestamp: Date.now() },
      ...recentTransactions.filter(tx => tx.id !== txId)
    ].slice(0, 5); // Keep only the 5 most recent transactions

    setRecentTransactions(updatedTransactions);
    localStorage.setItem('recentTransactions', JSON.stringify(updatedTransactions));
  };

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

          sessionStorage.setItem('rawTxDataJson', JSON.stringify(parsedTransaction));
          sessionStorage.setItem('txId', transactionId);
          saveToRecentTransactions(transactionId);
        }).catch((error) => {
          console.error(error);
          setLoading(false);
        });
    } else setLoading(false);
  }

  const parsedTransaction = rawTxDataSession ? restoreTransaction(rawTxDataSession) : null;

  const handleExampleClick = (txId: string) => {
    const form = document.getElementById('txForm') as HTMLFormElement;
    const input = form.querySelector('input[name="txId"]') as HTMLInputElement;
    input.value = txId;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
  };

  const handleRecentClick = (txId: string) => {
    const form = document.getElementById('txForm') as HTMLFormElement;
    const input = form.querySelector('input[name="txId"]') as HTMLInputElement;
    input.value = txId;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
  };

  return (
    <div className="flex flex-col items-center justify-start w-full p-8 sm:p-20 sm:pt-8 min-h-screen">
      <div className="w-full mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Raw Bitcoin Transaction Parser
          </h1>
          <p className="text-blue-100 mt-2">Decode and analyze Bitcoin transactions with ease</p>
        </div>
      </div>

      {/* Educational Section */}
      <div className="w-full mb-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">What is a Bitcoin Transaction?</h2>
        <p className="text-gray-700 mb-4">
          Bitcoin transactions are the building blocks of the Bitcoin network. Each transaction contains
          inputs (where the bitcoins are coming from), outputs (where they're going to), and other metadata
          like version, locktime, and witness data for SegWit transactions.
        </p>
        <p className="text-gray-700">
          This tool helps you decode raw transaction data to understand what's happening under the hood.
          Simply enter a transaction ID to get started!
        </p>
      </div>

      <form id="txForm" className="flex flex-col w-full bg-white shadow-lg rounded-xl p-6 space-y-6" onSubmit={handleFormSubmit}>
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

      {/* Example Transactions */}
      <div className="w-full mt-6 bg-white shadow-md rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Try These Examples:</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {EXAMPLE_TRANSACTIONS.map((tx) => (
            <div
              key={tx.id}
              onClick={() => handleExampleClick(tx.id)}
              className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <p className="font-medium text-blue-600 truncate">{tx.id}</p>
              <p className="text-sm text-gray-600">{tx.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div className="w-full mt-6 bg-white shadow-md rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Your Recent Transactions:</h2>
          <div className="space-y-2">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => handleRecentClick(tx.id)}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors flex justify-between items-center"
              >
                <p className="font-medium text-gray-700 truncate flex-1">{tx.id}</p>
                <p className="text-xs text-gray-500 ml-2">{new Date(tx.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="w-full mt-8">
        <p className="font-bold w-full text-start mb-2 text-gray-700">Transaction Data:</p>
        {loading && (
          <div className="w-full flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        )}
        {transaction && !loading ? (
          <RawTransaction rawTxDataJson={transaction} />
        ) : (parsedTransaction || rawTxDataSession) && rawTxDataSession !== null && !loading ? (
          <RawTransaction rawTxDataJson={parsedTransaction || JSON.parse(rawTxDataSession)} />
        ) : !loading && <p className="text-black mt-4 font-bold w-full text-center">{rawTxData}</p>}
      </div>
    </div>
  );
}