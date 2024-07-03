const numberstr = BigInt(("0x55").toString()).toString(16)
const buffer = Buffer.from(
    "00",
    'hex');



function numberToTrimmedBytes(num: number): Uint8Array {
    const buffer = new ArrayBuffer(4); // 4 bytes for a 32-bit integer
    const view = new DataView(buffer);
    view.setInt32(0, num, false); // false for big-endian

    // Convert to Uint8Array
    const bytes = new Uint8Array(buffer);

    // Trim trailing zeros
    let trimmedBytes = bytes;
    while (trimmedBytes.length > 0 && trimmedBytes[trimmedBytes.length - 1] === 0) {
        trimmedBytes = trimmedBytes.slice(0, trimmedBytes.length - 1);
    }

    return trimmedBytes;
}

const byte2 = numberToTrimmedBytes(0x5)
console.log(

    numberstr, buffer, buffer.length, 
    buffer.toString('hex'),
    byte2.length,
    Buffer.from(byte2).length,
    Buffer.from(byte2).toString("hex")
    // byte2.toString("hex")

)

