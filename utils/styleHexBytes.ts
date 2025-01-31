export function formatHexBytes(hex: string) {
    return hex
        .split("")
        .map((_, i) => (i % 2 === 0 ? hex.slice(i, i + 2) : ""))
        .filter((x) => x)
        .join(" ");
}

// Get the x bytes of the raw data from index point
export function getBytesOfHex(hex: string, index: number, length: number) {
    const byteLength = length * 2;
    const indexByte = index * 2;
    return hex
        .split("")
        .map((_, i) => (i % 2 === 0 ? hex.slice(i, i + 2) : ""))
        .filter((x, i) => i >= indexByte && i < indexByte + byteLength)
        .join(" ");
}
