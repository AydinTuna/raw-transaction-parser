import { Transaction } from "../classes";

export default function RawTransaction({ rawTxDataJson }: { rawTxDataJson: Transaction }) {
    return (
        <div className="p-4 bg-gray-100 rounded-lg border border-red-300 shadow-lg font-mono text-sm">
            <div className="flex space-x-4 mb-4 w-max">
                {rawTxDataJson.isSegWit() && (
                    <div className="py-2 px-4 rounded-full font-bold bg-red-100 shadow-sm shadow-red-300 cursor-pointer">
                        <span className="text-red-500">
                            SegWit
                        </span>
                    </div>
                )}

                {rawTxDataJson.isCoinbase() && (
                    <div className="py-2 px-4 rounded-full font-bold bg-green-100 shadow-sm shadow-green-300 cursor-pointer">
                        <span className="text-green-500 w-full">
                            Coinbase
                        </span>
                    </div>
                )}

                {!rawTxDataJson.isSegWit() && (
                    <div className="py-2 px-4 rounded-full font-bold bg-gray-200 shadow-sm shadow-gray-400 cursor-pointer">
                        <span className="text-gray-700">
                            Legacy Transaction
                        </span>
                    </div>
                )}
            </div>


            <div>
                <span className="text-blue-600 font-bold">Version:</span>{" "}
                <span className="text-gray-800">{rawTxDataJson.version}</span>
            </div>

            <div className="mt-2">
                <span className="text-red-600 font-bold">Marker:</span>{" "}
                <span className="text-gray-800">{rawTxDataJson.marker}</span>
            </div>

            <div className="mt-2">
                <span className="text-purple-600 font-bold">Flag:</span>{" "}
                <span className="text-gray-800">{rawTxDataJson.flag}</span>
            </div>

            <div className="mt-4 text-lg font-bold">Inputs:</div>
            <div>
                <span className="text-blue-400 font-bold">InputCount:</span>{" "}
                <span className="text-gray-800 break-all">{rawTxDataJson.inputCount}</span>
            </div>
            {rawTxDataJson.inputs.map((input, index) => (
                <div key={index} className="ml-4 border-l-4 border-blue-500 pl-2 mt-2">
                    <div>
                        <span className="text-green-600 font-bold">TxID:</span>{" "}
                        <span className="text-gray-800 break-all">{input.txid}</span>
                    </div>
                    <div>
                        <span className="text-orange-600 font-bold">Vout:</span>{" "}
                        <span className="text-gray-800">{input.vout}</span>
                    </div>
                    <div>
                        <span className="text-indigo-600 font-bold">ScriptSigSize:</span>{" "}
                        <span className="text-gray-800 break-all">{input.scriptSigSize}</span>
                    </div>
                    <div>
                        <span className="text-indigo-600 font-bold">ScriptSig:</span>{" "}
                        <span className="text-gray-800 break-all">{input.scriptSig?.hex || "-"}</span>
                    </div>
                    <div>
                        <span className="text-pink-600 font-bold">Sequence:</span>{" "}
                        <span className="text-gray-800">{input.sequence}</span>
                    </div>
                </div>
            ))}

            <div className="mt-4 text-lg font-bold">Outputs:</div>
            <div>
                <span className="text-blue-400 font-bold">OutputCount:</span>{" "}
                <span className="text-gray-800 break-all">{rawTxDataJson.outputCount}</span>
            </div>
            {rawTxDataJson.outputs.map((output, index) => (
                <div key={index} className="ml-4 border-l-4 border-green-500 pl-2 mt-2">

                    <div>
                        <span className="text-yellow-600 font-bold">Amount:</span>{" "}
                        <span className="text-gray-800">{output.amount}</span>
                    </div>
                    <div>
                        <span className="text-blue-600 font-bold">ScriptPubKeySize:</span>{" "}
                        <span className="text-gray-800 break-all">{output.scriptPubKeySize}</span>
                    </div>
                    <div>
                        <span className="text-blue-600 font-bold">ScriptPubKey:</span>{" "}
                        <span className="text-gray-800 break-all">{output.scriptPubKey?.hex || "-"}</span>
                    </div>
                </div>
            ))}

            {rawTxDataJson.witnesses && (
                <div className="mt-4 text-lg font-bold">Witnesses:</div>
            )}


            {rawTxDataJson.witnesses?.map((witness, index) => (
                <div key={index} className="ml-4 border-l-4 border-purple-500 pl-2 mt-2">
                    <div>
                        <span className="text-blue-400 font-bold">StackItemCount:</span>{" "}
                        <span className="text-gray-800 break-all">{witness.stackItemCount}</span>
                    </div>
                    {witness.stackItems.map((stack, i) => (
                        <div key={i}>
                            <span className="text-gray-800 break-all">{stack.item}</span>{" "}
                            <span className="text-red-500">(Size: {stack.size})</span>
                        </div>
                    ))}
                </div>
            ))}

            <div className="mt-4">
                <span className="text-gray-600 font-bold">Locktime:</span>{" "}
                <span className="text-gray-800">{rawTxDataJson.locktime}</span>
            </div>
            <div className="mt-4 px-4 py-2 bg-white rounded-lg shadow-inner">
                <span className="text-gray-600 font-bold">Total Byte Size:</span>{" "}
                <span className="text-red-500">{rawTxDataJson.totalRawTxDataByteSize}</span>
            </div>
        </div>
    );
}
