const numberstr = BigInt((0).toString()).toString(16)
const buffer = Buffer.from(
    numberstr,
    'hex');
console.log(buffer,buffer.length)

