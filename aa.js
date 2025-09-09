function parseSemanticVersion(version) {
    const [major, minor, patch] = version.split(".").map(parseInt);

    return [major || 14, minor || 3, patch || 0];
}

function generateRandomString(format) {
    return format // Format control
        .replace(
            /x/g, () => Math.floor(Math.random() * 10)) // Fill with numbers
        .replace(                                       // Fill with characters
            /a/g,
            () => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
        .replace(/b/g, () => { // Fill with numbers or characters
            return Math.random() > 0.722 ?
                Math.floor(Math.random() * 10) :
                String.fromCharCode(65 + Math.floor(Math.random() * 26));
        });
}

function updateCRC(polynomial, crc, byte) {
    for (let i = 0; i < 8; i += 1, byte >>= 1) {
        const bit = byte & 1;

        if (crc % 2 === bit) {
            crc >>= 1;
        } else {
            crc >>= 1;
            crc ^= polynomial;
        }
    }

    return crc;
}

function findPaddingBytes(polynomial, crc, target) {
    let byte1, byte2;

    for (byte1 = 0; byte1 < 256; byte1++) {
        for (byte2 = 0; byte2 < 256; byte2++) {
            if (updateCRC(
                polynomial, updateCRC(polynomial, crc, byte1), byte2) ===
                target) {
                return byte1 | byte2 << 8;
            }
        }
    }

    return byte1 | byte2 << 8;
}

function encrypt(polynomial, crc, charCodes) {
    for (const charCode of charCodes)
        crc = updateCRC(polynomial, crc, charCode);

    return findPaddingBytes(polynomial, crc, 0xA5B6);
}

function encodeNumberToCRC(polynomial, number) {
    number = Math.floor(number * 99999 / 0xFFFF);

    const numberMod100 = number % 100;

    number -= numberMod100;

    const numberMod1000 = number % 1000;

    number -= numberMod1000;

    number += numberMod100 * 10 + numberMod1000 / 100;

    const scaledNumber = Math.ceil(number * 65535 / 99999);

    return updateCRC(
        polynomial,
        updateCRC(polynomial, 0, scaledNumber & 0xFF), scaledNumber >> 8);
}

function splitToDigits(value) {
    let number = Math.floor(value * 99999 / 0xFFFF);

    const digits = [];

    for (let i = 0; i < 5; i++) {
        digits.push(number % 10);

        number = Math.floor(number / 10);
    }

    return digits;
}

function generatePassword(encrypted1, encrypted2) {
    const digits1 = splitToDigits(encrypted1).reverse();
    const digits2 = splitToDigits(encrypted2).reverse();

    return "" + digits2[3] + digits1[3] + digits1[1] + digits1[0] + "-" + digits2[4] +
        digits1[2] + digits2[0] + "-" + digits2[2] + digits1[4] + digits2[1];
}

const CRC_POLYNOMIAL_1 = 0b1000001011100001;
const CRC_POLYNOMIAL_2 = 0b1000001100100101;

const MACHINE_NUMBER = "800001";

const machineId = "6213-37583-70273";

const activationKey = generateRandomString("xxxx-xxxx-aaaaaa");

const expirationDateRaw = new Date(Date.now() + 86400 * 1000 * 365 * 10);
const expirationDate = 1e4 * expirationDateRaw.getFullYear() + 1e2 * (expirationDateRaw.getMonth() + 1) + expirationDateRaw.getDate();

const cipherText = `${machineId}@${expirationDate}$${MACHINE_NUMBER}&${activationKey}`;
const cipherCharCodesReversed = [...String(cipherText)].reverse().map((c) => c.charCodeAt(0));

let crc = 59222;

const encryptedValue1 = encrypt(CRC_POLYNOMIAL_1, crc, cipherCharCodesReversed);
const finalizedEncryptedValue1 = (encryptedValue1 + 0x72FA) % 65536;

crc = encodeNumberToCRC(CRC_POLYNOMIAL_2, finalizedEncryptedValue1);

const encryptedValue2 = encrypt(CRC_POLYNOMIAL_2, crc, cipherCharCodesReversed);

console.log(
    activationKey,
    `${generatePassword(finalizedEncryptedValue1, encryptedValue2)}::${MACHINE_NUMBER}:${expirationDate}`,
);