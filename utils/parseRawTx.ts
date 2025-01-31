import { parse } from "path";
import { calculateCompactSize, getBytesOfHex, hash } from ".";

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
    
    rawTxDataBuild += transaction.version + transaction.marker + transaction.flag + transaction.inputCount;
    totalRawTxDataByteSize += 6 + byteSize;

    let _scriptSigbyteSize = 0;
    for (let i = 0; i < parseInt(inputCountHex as string, 16); i++) {
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

    
    for (let i = 0; i < parseInt(transaction.outputCount, 16); i++) {
        const output = new Output();
        output.amount = getBytesOfHex(rawTxData, (totalRawTxDataByteSize - 1), 8);
        const [scriptPubKeySize, scriptPubKeyByteSize] = calculateCompactSize(rawTxData, 42 + 8);
        output.scriptPubKeySize = scriptPubKeySize;
        output.scriptPubKey.hex = getBytesOfHex(rawTxData, 42 + 8 + scriptPubKeyByteSize, parseInt(scriptPubKeySize, 16));

        console.log("Output: ", i);
        console.log("******************************************************");
        console.log("Amount: ", output.amount);
        console.log("Script Pub Key Size: ", output.scriptPubKeySize);
        console.log("Script Pub Key: ", output.scriptPubKey.hex);

        transaction.outputs.push(output);
        rawTxDataBuild += output.amount + output.scriptPubKeySize + output.scriptPubKey.hex;
        totalRawTxDataByteSize += 8 + scriptPubKeyByteSize + parseInt(scriptPubKeySize, 16);
    }
    transaction.locktime = getBytesOfHex(rawTxData, totalRawTxDataByteSize, 4);
    rawTxDataBuild += transaction.locktime;
    const txDataHash = hash(rawTxDataBuild);

    console.log("******************************************************");
    console.log("Total Raw Tx Data Byte Size: ", totalRawTxDataByteSize);
    console.log("Validate Tx Data");
    console.log("Tx Data Hash: ", txDataHash);
    console.log("******************************************************");
}