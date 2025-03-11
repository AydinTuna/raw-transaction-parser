import { calculateCompactSize, getBytesOfHex, hash, compactSizeFilter, convertToBigEndian } from "../utils";
import { Input, Output, StackItem, Transaction, Witness } from "../classes";

export function parseRawTx(rawTxData: string) {
    // Check if SegWit (marker = 00, flag >= 01)
    let marker = getBytesOfHex(rawTxData, 4, 1);
    let flag = getBytesOfHex(rawTxData, 5, 1);
    let isSegWit = parseInt(marker, 16) === parseInt("00", 16) && parseInt(flag, 16) >= parseInt("01", 16);
    console.log("Is SegWit: ", isSegWit);

    if (isSegWit) {
        return parseSegWitTx(rawTxData);
    } else {
        return parseLegacyTx(rawTxData);
    }
}

function parseLegacyTx(rawTxData: string) {
    let rawTxDataBuild = "";
    let totalRawTxDataByteSize = 0;

    const transaction = new Transaction();
    transaction.version = getBytesOfHex(rawTxData, 0, 4);
    const [inputCountHex, byteSize] = calculateCompactSize(rawTxData, 4);
    transaction.inputCount = inputCountHex;

    rawTxDataBuild += transaction.version + transaction.inputCount;
    totalRawTxDataByteSize += 4 + byteSize;

    // Input parsing
    for (let i = 0; i < parseInt(compactSizeFilter(byteSize, inputCountHex.split(" ").join("")), 16); i++) {
        const input = new Input();
        input.txid = getBytesOfHex(rawTxData, totalRawTxDataByteSize, 32);
        totalRawTxDataByteSize += 32;
        input.vout = getBytesOfHex(rawTxData, totalRawTxDataByteSize, 4);
        totalRawTxDataByteSize += 4;

        const [scriptSigLength, scriptSigbyteSize] = calculateCompactSize(rawTxData, totalRawTxDataByteSize);
        input.scriptSigSize = scriptSigLength;
        totalRawTxDataByteSize += scriptSigbyteSize;
        input.scriptSig.hex = getBytesOfHex(rawTxData, totalRawTxDataByteSize, parseInt(scriptSigLength, 16));
        totalRawTxDataByteSize += parseInt(scriptSigLength, 16);
        input.sequence = getBytesOfHex(rawTxData, totalRawTxDataByteSize, 4);
        totalRawTxDataByteSize += 4;

        transaction.inputs.push(input);
        rawTxDataBuild += input.txid + input.vout + input.scriptSigSize + input.scriptSig.hex + input.sequence;
    }

    // Parse Outputs using the helper function
    [rawTxDataBuild, totalRawTxDataByteSize] = parseOutputs(rawTxData, totalRawTxDataByteSize, transaction, rawTxDataBuild);

    transaction.locktime = getBytesOfHex(rawTxData, totalRawTxDataByteSize, 4);
    rawTxDataBuild += transaction.locktime;

    totalRawTxDataByteSize += 4;
    const txDataHash = convertToBigEndian(hash(rawTxDataBuild));
    transaction.totalRawTxDataByteSize = totalRawTxDataByteSize;

    console.log("******************************************************");
    console.log("Total Raw Tx Data Byte Size: ", totalRawTxDataByteSize);
    console.log("Validate Tx Data");
    console.log("Tx Data Hash: ", txDataHash);
    console.log("******************************************************");

    console.log("Transaction: ", transaction);

    return transaction;
}

function parseSegWitTx(rawTxData: string) {
    let rawTxDataBuild = "";
    let totalRawTxDataByteSize = 0;

    const transaction = new Transaction();
    transaction.version = getBytesOfHex(rawTxData, 0, 4);
    transaction.marker = getBytesOfHex(rawTxData, 4, 1);
    transaction.flag = getBytesOfHex(rawTxData, 5, 1);
    const [inputCountHex, byteSize] = calculateCompactSize(rawTxData, 6);
    transaction.inputCount = inputCountHex;

    rawTxDataBuild += transaction.version + transaction.inputCount;
    totalRawTxDataByteSize += 6 + byteSize;

    // Input parsing
    for (let i = 0; i < parseInt(compactSizeFilter(byteSize, inputCountHex.split(" ").join("")), 16); i++) {
        const input = new Input();
        input.txid = getBytesOfHex(rawTxData, totalRawTxDataByteSize, 32);
        totalRawTxDataByteSize += 32;
        input.vout = getBytesOfHex(rawTxData, totalRawTxDataByteSize, 4);
        totalRawTxDataByteSize += 4;

        const [scriptSigLength, scriptSigbyteSize] = calculateCompactSize(rawTxData, totalRawTxDataByteSize);
        input.scriptSigSize = scriptSigLength;
        totalRawTxDataByteSize += scriptSigbyteSize;
        input.scriptSig.hex = getBytesOfHex(rawTxData, totalRawTxDataByteSize, parseInt(scriptSigLength, 16));
        totalRawTxDataByteSize += parseInt(scriptSigLength, 16);
        input.sequence = getBytesOfHex(rawTxData, totalRawTxDataByteSize, 4);
        totalRawTxDataByteSize += 4;

        transaction.inputs.push(input);
        rawTxDataBuild += input.txid + input.vout + input.scriptSigSize + input.scriptSig.hex + input.sequence;
    }

    // Parse Outputs using the helper function
    [rawTxDataBuild, totalRawTxDataByteSize] = parseOutputs(rawTxData, totalRawTxDataByteSize, transaction, rawTxDataBuild);

    // Witness parsing for SegWit
    for (let i = 0; i < parseInt(compactSizeFilter(byteSize, inputCountHex.split(" ").join("")), 16); i++) {
        const witness = new Witness();
        const [stackItemCount, stackItemByteSize] = calculateCompactSize(rawTxData, totalRawTxDataByteSize);
        witness.stackItemCount = stackItemCount;
        totalRawTxDataByteSize += stackItemByteSize;

        for (let j = 0; j < parseInt(compactSizeFilter(stackItemByteSize, stackItemCount.split(" ").join("")), 16); j++) {
            const stackItem = new StackItem(getBytesOfHex(rawTxData, totalRawTxDataByteSize, 1));
            const [stackItemSize, stackItemSizeByteSize] = calculateCompactSize(rawTxData, totalRawTxDataByteSize);
            stackItem.size = stackItemSize;
            totalRawTxDataByteSize += stackItemSizeByteSize;
            stackItem.item = getBytesOfHex(rawTxData, totalRawTxDataByteSize, parseInt(stackItemSize, 16));
            totalRawTxDataByteSize += parseInt(stackItemSize, 16);
            witness.stackItems.push(stackItem);
        }
        transaction.witnesses.push(witness);
    }

    transaction.locktime = getBytesOfHex(rawTxData, totalRawTxDataByteSize, 4);
    rawTxDataBuild += transaction.locktime;

    totalRawTxDataByteSize += 4;
    transaction.totalRawTxDataByteSize = totalRawTxDataByteSize;
    const txDataHash = convertToBigEndian(hash(rawTxDataBuild));

    console.log("******************************************************");
    console.log("Total Raw Tx Data Byte Size: ", totalRawTxDataByteSize);
    console.log("Validate Tx Data");
    console.log("Tx Data Hash: ", txDataHash);
    console.log("******************************************************");

    return transaction;
}

// Reusable function to parse outputs
function parseOutputs(rawTxData: string, totalRawTxDataByteSize: number, transaction: Transaction, rawTxDataBuild: string): [string, number] {
    const [outputCountHex, outputByteSize] = calculateCompactSize(rawTxData, totalRawTxDataByteSize);
    transaction.outputCount = outputCountHex;
    totalRawTxDataByteSize += outputByteSize;

    rawTxDataBuild += transaction.outputCount;

    for (let i = 0; i < parseInt(compactSizeFilter(outputByteSize, outputCountHex.split(" ").join("")), 16); i++) {
        const output = new Output();
        output.amount = getBytesOfHex(rawTxData, totalRawTxDataByteSize, 8);
        totalRawTxDataByteSize += 8;
        const [scriptPubKeySize, scriptPubKeyByteSize] = calculateCompactSize(rawTxData, totalRawTxDataByteSize);
        output.scriptPubKeySize = scriptPubKeySize;
        totalRawTxDataByteSize += scriptPubKeyByteSize;
        output.scriptPubKey.hex = getBytesOfHex(rawTxData, totalRawTxDataByteSize, parseInt(scriptPubKeySize, 16));
        totalRawTxDataByteSize += parseInt(scriptPubKeySize, 16);

        transaction.outputs.push(output);
        rawTxDataBuild += output.amount + output.scriptPubKeySize + output.scriptPubKey.hex;
    }

    return [rawTxDataBuild, totalRawTxDataByteSize];
}
