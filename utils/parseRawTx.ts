import { parse } from "path";
import { calculateCompactSize, getBytesOfHex, hash, compactSizeFilter, convertToBigEndian } from ".";

class Transaction {
    version: string;
    marker: string;
    flag: string;
    inputCount: string;
    inputs: Input[];
    outputCount: string;
    outputs: Output[];
    locktime: string;

    constructor() {
        this.version = '';
        this.marker = '';
        this.flag = '';
        this.inputCount = '01';
        this.inputs = [new Input()];
        this.outputCount = '01';
        this.outputs = [new Output()];
        this.locktime = '';
    }
}

class Output {
    amount: string;
    scriptPubKey: {
        asm: string;
        hex: string;
    };
    scriptPubKeySize: string;
    constructor() {
        this.amount = '';
        this.scriptPubKey = {
            asm: '',
            hex: '',
        };
        this.scriptPubKeySize = ''
    }
}

class Input  {
    txid: string;
    vout: string;
    scriptSigSize: string
    scriptSig: {
        asm: string;
        hex: string;
    };
    sequence: string;
    constructor() {
        this.txid = '';
        this.vout = '';
        this.scriptSig = {
            asm: '',
            hex: '',
        };
        this.scriptSigSize = ''
        this.sequence = '';
    }
}

class StackItem {
    size: string;
    item: string;

    constructor(item: string) {
        this.item = item;
        this.size = "00"
    }
}

class Witness {
    stackItemCount: string;
    stackItems: StackItem[];

    constructor() {
        this.stackItems = [];
        this.stackItemCount = "00";
    }
}


// Parse Raw Transaction Data
export function parseRawTx(rawTxData: string) {
    let rawTxDataBuild = "";
    let totalRawTxDataByteSize = 0;

    const transaction = new Transaction();
    transaction.version = getBytesOfHex(rawTxData, 0, 4);
    transaction.marker = getBytesOfHex(rawTxData, 4, 1)
    transaction.flag = getBytesOfHex(rawTxData, 5, 1)
    const [inputCountHex, byteSize] = calculateCompactSize(rawTxData, 6);
    transaction.inputCount = inputCountHex;

    console.log("Version: ", transaction.version);
    console.log("Marker: ", transaction.marker);
    console.log("Flag: ", transaction.flag);
    console.log("Input Count: ", transaction.inputCount);
    console.log("Input Count Byte Size: ", byteSize);
    
    // rawTxDataBuild += transaction.version + transaction.marker + transaction.flag + transaction.inputCount;
    // for segwit transactions
    rawTxDataBuild += transaction.version + transaction.inputCount;
    totalRawTxDataByteSize += 6 + byteSize;
    console.log("compactSizeFilter: ", compactSizeFilter(byteSize, inputCountHex.split(" ").join("")));
    
    let _scriptSigbyteSize = 0;
    for (let i = 0; i < parseInt(compactSizeFilter(byteSize, inputCountHex.split(" ").join("")), 16); i++) {
        const input = new Input();
        input.txid = getBytesOfHex(rawTxData, totalRawTxDataByteSize, 32);
        totalRawTxDataByteSize += 32;
        input.vout = getBytesOfHex(rawTxData, totalRawTxDataByteSize, 4);
        totalRawTxDataByteSize += 4;

        const [scriptSigLength, scriptSigbyteSize] = calculateCompactSize(rawTxData,  totalRawTxDataByteSize);
        _scriptSigbyteSize = scriptSigbyteSize;

        input.scriptSigSize = scriptSigLength;
        totalRawTxDataByteSize += scriptSigbyteSize;
        input.scriptSig.hex = getBytesOfHex(rawTxData, totalRawTxDataByteSize, parseInt(scriptSigLength, 16));
        totalRawTxDataByteSize += parseInt(scriptSigLength, 16);
        input.sequence = getBytesOfHex(rawTxData, totalRawTxDataByteSize, 4);
        totalRawTxDataByteSize += 4;
       
        console.log("Input: ", i);
        console.log("******************************************************");
        console.log("Txid: ", input.txid);
        console.log("Vout: ", input.vout);
        console.log("Script Sig Size: ", input.scriptSigSize);
        console.log("Script Sig Byte Size: ", _scriptSigbyteSize);
        console.log("Script Sig: ", input.scriptSig.hex);
        console.log("Sequence: ", input.sequence); 

        transaction.inputs.push(input);
        rawTxDataBuild += input.txid + input.vout + input.scriptSigSize + input.scriptSig.hex + input.sequence;
    }

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

        console.log("Output: ", i);
        console.log("******************************************************");
        console.log("Amount: ", output.amount);
        console.log("Script Pub Key Size: ", output.scriptPubKeySize);
        console.log("Script Pub Key: ", output.scriptPubKey.hex);

        transaction.outputs.push(output);
        rawTxDataBuild += output.amount + output.scriptPubKeySize + output.scriptPubKey.hex;
    }

    // For segwit transactions
    for (let i = 0; i < parseInt(compactSizeFilter(byteSize, inputCountHex.split(" ").join("")), 16); i++) {
        const witness = new Witness();
        const [stackItemCount, stackItemByteSize] = calculateCompactSize(rawTxData, totalRawTxDataByteSize);
        witness.stackItemCount = stackItemCount;
        totalRawTxDataByteSize += stackItemByteSize;
        // rawTxDataBuild += stackItemCount

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
            
            // rawTxDataBuild += stackItem.size + stackItem.item;

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