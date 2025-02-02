import { calculateCompactSize, getBytesOfHex, hash, compactSizeFilter, convertToBigEndian } from ".";
import { Input, Output, StackItem, Transaction, Witness } from "@/classes";

// Reusable function to parse outputs
function parseOutputs(rawTxData: string, totalRawTxDataByteSize: number, transaction: Transaction, rawTxDataBuild: string): [string, number] {
    const [outputCountHex, outputByteSize] = calculateCompactSize(rawTxData, totalRawTxDataByteSize);
    transaction.outputCount = outputCountHex;
    totalRawTxDataByteSize += outputByteSize;

    console.log("Output Count: ", transaction.outputCount);
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

        console.log("Output: ", i);
        console.log("******************************************************");
        console.log("Amount: ", output.amount);
        console.log("Script Pub Key Size: ", output.scriptPubKeySize);
        console.log("Script Pub Key: ", output.scriptPubKey.hex);

        transaction.outputs.push(output);
        rawTxDataBuild += output.amount + output.scriptPubKeySize + output.scriptPubKey.hex;
    }

    return [rawTxDataBuild, totalRawTxDataByteSize];
}

export function parseRawTx(rawTxData: string) {
    // Check if SegWit (marker = 00, flag = 01)
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

    console.log("Version: ", transaction.version);
    console.log("Input Count: ", transaction.inputCount);
    console.log("Input Count Byte Size: ", byteSize);

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

        console.log("Input: ", i);
        console.log("Txid: ", input.txid);
        console.log("Vout: ", input.vout);
        console.log("Script Sig Size: ", input.scriptSigSize);
        console.log("Script Sig: ", input.scriptSig.hex);
        console.log("Sequence: ", input.sequence);

        transaction.inputs.push(input);
        rawTxDataBuild += input.txid + input.vout + input.scriptSigSize + input.scriptSig.hex + input.sequence;
    }

    // Parse Outputs using the helper function
    [rawTxDataBuild, totalRawTxDataByteSize] = parseOutputs(rawTxData, totalRawTxDataByteSize, transaction, rawTxDataBuild);

    transaction.locktime = getBytesOfHex(rawTxData, totalRawTxDataByteSize, 4);
    rawTxDataBuild += transaction.locktime;
    console.log("Locktime: ", transaction.locktime);

    totalRawTxDataByteSize += 4;
    const txDataHash = convertToBigEndian(hash(rawTxDataBuild));

    console.log("******************************************************");
    console.log("Total Raw Tx Data Byte Size: ", totalRawTxDataByteSize);
    console.log("Validate Tx Data");
    console.log("Tx Data Hash: ", txDataHash);
    console.log("******************************************************");
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

    console.log("Version: ", transaction.version);
    console.log("Marker: ", transaction.marker);
    console.log("Flag: ", transaction.flag);
    console.log("Input Count: ", transaction.inputCount);
    console.log("Input Count Byte Size: ", byteSize);

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

        console.log("Input: ", i);
        console.log("Txid: ", input.txid);
        console.log("Vout: ", input.vout);
        console.log("Script Sig Size: ", input.scriptSigSize);
        console.log("Script Sig: ", input.scriptSig.hex);
        console.log("Sequence: ", input.sequence);

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

        console.log("Witness: ", i);
        console.log("******************************************************");
        console.log("Stack Items: ", witness.stackItemCount);
        console.log("Stack Item Byte Size: ", stackItemByteSize);

        for (let j = 0; j < parseInt(compactSizeFilter(stackItemByteSize, stackItemCount.split(" ").join("")), 16); j++) {
            const stackItem = new StackItem(getBytesOfHex(rawTxData, totalRawTxDataByteSize, 1));
            const [stackItemSize, stackItemSizeByteSize] = calculateCompactSize(rawTxData, totalRawTxDataByteSize);
            stackItem.size = stackItemSize;
            totalRawTxDataByteSize += stackItemSizeByteSize;
            stackItem.item = getBytesOfHex(rawTxData, totalRawTxDataByteSize, parseInt(stackItemSize, 16));
            totalRawTxDataByteSize += parseInt(stackItemSize, 16);
            witness.stackItems.push(stackItem);

            console.log("Stack Item: ", j);
            console.log("******************************************************");
            console.log("Stack Item Size: ", stackItem.size);
            console.log("Stack Item: ", stackItem.item);
        }
    }

    transaction.locktime = getBytesOfHex(rawTxData, totalRawTxDataByteSize, 4);
    rawTxDataBuild += transaction.locktime;
    console.log("Locktime: ", transaction.locktime);

    totalRawTxDataByteSize += 4;
    const txDataHash = convertToBigEndian(hash(rawTxDataBuild));

    console.log("******************************************************");
    console.log("Total Raw Tx Data Byte Size: ", totalRawTxDataByteSize);
    console.log("Validate Tx Data");
    console.log("Tx Data Hash: ", txDataHash);
    console.log("******************************************************");
}
