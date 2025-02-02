export class Transaction {
    version: string;
    marker: string;
    flag: string;
    inputCount: string;
    inputs: Input[];
    outputCount: string;
    outputs: Output[];
    locktime: string;
    totalRawTxDataByteSize: number;
    witnesses: Witness[];

    constructor() {
        this.version = '';
        this.marker = '';
        this.flag = '';
        this.inputCount = '00';
        this.inputs = [];
        this.outputCount = '00';
        this.outputs = [];
        this.locktime = '';
        this.totalRawTxDataByteSize = 0;
        this.witnesses = [];
    }
}


export class Output {
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

export class Input {
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

export class StackItem {
    size: string;
    item: string;

    constructor(item: string) {
        this.item = item;
        this.size = "00"
    }
}

export class Witness {
    stackItemCount: string;
    stackItems: StackItem[];

    constructor() {
        this.stackItems = [];
        this.stackItemCount = "00";
    }
}