import { Transaction } from "@/classes";
import { createHash } from "crypto";

export function formatHexBytes(transaction: Transaction): string {
    let rawTxData = "";

    if (!transaction) return rawTxData;

    if (transaction.witnesses.length > 0) {
        rawTxData += transaction.version + " " +
            transaction.marker + " " +
            transaction.flag + " " +
            transaction.inputCount + " ";

        rawTxData += transaction.inputs.map(input => {
            return input.txid + " " + input.vout + " " + input.scriptSigSize + " " + input.scriptSig.hex + " " + input.sequence;
        }).join(" ") + " ";

        rawTxData += transaction.outputCount + " ";
        rawTxData += transaction.outputs.map(output => {
            return output.amount + " " + output.scriptPubKeySize + " " + output.scriptPubKey.hex;
        }).join(" ") + " ";

        rawTxData += transaction.witnesses.map(witness => {
            return witness.stackItemCount + " " + witness.stackItems.map(stack => {
                return stack.size + " " + stack.item;
            }).join(" ");
        }).join(" ") + " ";

        rawTxData += transaction.locktime;
    } else {
        rawTxData += transaction.version + " " + transaction.inputCount + " ";

        rawTxData += transaction.inputs.map(input => {
            return input.txid + " " + input.vout + " " + input.scriptSigSize + " " + input.scriptSig.hex + " " + input.sequence;
        }).join(" ") + " ";

        rawTxData += transaction.outputCount + " ";
        rawTxData += transaction.outputs.map(output => {
            return output.amount + " " + output.scriptPubKeySize + " " + output.scriptPubKey.hex;
        }).join(" ") + " ";

        rawTxData += transaction.locktime;
    }
    return rawTxData.trim(); // Remove any trailing spaces
}


// Get the x bytes of the raw data from index point
export function getBytesOfHex(hex: string, index: number, length: number): string {
    const byteLength = length * 2;
    const indexByte = index * 2;
    return hex
        .split("")
        .map((_, i) => (i % 2 === 0 ? hex.slice(i, i + 2) : ""))
        .filter((x, i) => i >= indexByte && i < indexByte + byteLength)
        .join("");
}

export function calculateCompactSize(rawTxData: string, index: number): [string, number] {
    const leadingByte = getBytesOfHex(rawTxData, index, 1);
    const leadingByteInt = parseInt(leadingByte, 16);
    let byteSize = 0;

    if (leadingByteInt < parseInt("FC", 16)) {
        byteSize = 1;
        return [leadingByte, byteSize];
    } if (leadingByteInt === parseInt("FD", 16)) {
        byteSize = 3;
        return [getBytesOfHex(rawTxData, index, 3), byteSize];
    } if (leadingByteInt === parseInt("FE", 16)) {
        byteSize = 5;
        return [getBytesOfHex(rawTxData, index, 5), byteSize];
    } if (leadingByteInt === parseInt("FF", 16)) {
        byteSize = 9;
        return [getBytesOfHex(rawTxData, index, 9), byteSize];
    } else {
        return ["01", 1];
    }
}

export function hash(txData: string): string {
    const bytes = Buffer.from(txData.split(" ").join(""), 'hex');
    const sha256Hash = createHash('sha256').update(bytes).digest();
    const hash256 = createHash('sha256').update(sha256Hash).digest();

    return hash256.toString('hex');
}

export function convertToBigEndian(hex: string): string {
    return hex
        .split("")
        .map((_, i) => (i % 2 === 0 ? hex.slice(i, i + 2) : ""))
        .filter((x) => x)
        .reverse()
        .join("");
}

export function compactSizeFilter(byteSize: number, countHex: string) {
    let bigEndianCount = '';
    if (byteSize === 1) {
        bigEndianCount = convertToBigEndian(getBytesOfHex(countHex, 0, 1));
    } else if (byteSize === 3) {
        bigEndianCount = convertToBigEndian(getBytesOfHex(countHex, 1, 2));
    } else if (byteSize === 5) {
        bigEndianCount = convertToBigEndian(getBytesOfHex(countHex, 1, 4));
    } else if (byteSize === 9) {
        bigEndianCount = convertToBigEndian(getBytesOfHex(countHex, 1, 8));
    }

    return bigEndianCount.split(" ").join("");
}