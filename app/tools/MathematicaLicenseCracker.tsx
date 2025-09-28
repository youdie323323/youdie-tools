export function generateRandomString(format: string) {
    return format // Format control
        .replace(/x/g, () => String(Math.floor(Math.random() * 10))) // Fill with numbers
        .replace(/a/g, () => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
        .replace(/b/g, () => { // Fill with numbers or characters
            return Math.random() > 0.722 ?
                String(Math.floor(Math.random() * 10)) :
                String.fromCharCode(65 + Math.floor(Math.random() * 26));
        });
}

export function validateFormat(format: string, real: string) {
    if (format.length !== real.length) return false;

    for (let i = 0; i < format.length; i++) {
        if (format[i] === "X") {
            if (real[i] < "0" || real[i] > "9") return false;
        } else {
            if (format[i] !== real[i]) return false;
        }
    }

    return true;
}

export const CRC_POLYNOMIAL_1: number = 0b1000001011100001 as const;
export const CRC_POLYNOMIAL_2: number = 0b1000001100100101 as const;

export const INITIAL_CRC: number = 59222 as const;

function updateCRC(polynomial: number, crc: number, byte: number) {
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

function findPaddingBytes(polynomial: number, crc: number, target: number) {
    let byte1: number = 0,
        byte2: number = 0;

    for (byte1 = 0; byte1 < 256; byte1++) {
        for (byte2 = 0; byte2 < 256; byte2++) {
            if (
                updateCRC(polynomial, updateCRC(polynomial, crc, byte1), byte2) ===
                target
            ) {
                return byte1 | byte2 << 8;
            }
        }
    }

    return byte1 | byte2 << 8;
}

export function encrypt(polynomial: number, crc: number, charCodes: Array<number>) {
    for (const charCode of charCodes)
        crc = updateCRC(polynomial, crc, charCode);

    return findPaddingBytes(polynomial, crc, 0xA5B6);
}

export function encodeNumberToCRC(polynomial: number, number: number) {
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

function splitToDigits(value: number): Array<number> {
    const digits = new Array<number>();

    for (
        let i = 0, number = Math.floor(value * 99999 / 0xFFFF);
        i < 5;
        i++, number = Math.floor(number / 10)
    )
        digits.push(number % 10);

    return digits;
}

export function generatePassword(encrypted1: number, encrypted2: number) {
    const digits1 = splitToDigits(encrypted1).reverse();
    const digits2 = splitToDigits(encrypted2).reverse();

    return "" + digits2[3] + digits1[3] + digits1[1] + digits1[0] + "-" + digits2[4] +
        digits1[2] + digits2[0] + "-" + digits2[2] + digits1[4] + digits2[1];
}

export function generateActivatableCiphers(machineId: string, expirationDate: Date): [string, string] {
    const expirationDateFinalized = 1e4 * expirationDate.getFullYear() + 1e2 * (expirationDate.getMonth() + 1) + expirationDate.getDate();

    const activationKey = generateRandomString("xxxx-xxxx-aaaaaa");

    const cipherText = `${machineId}@${expirationDateFinalized}$${MACHINE_NUMBER}&${activationKey}`;
    const cipherCharCodesReversed = [...String(cipherText)].reverse().map((c) => c.charCodeAt(0));

    let crc = INITIAL_CRC;

    const encryptedValue1 = encrypt(CRC_POLYNOMIAL_1, crc, cipherCharCodesReversed);
    const finalizedEncryptedValue1 = (encryptedValue1 + 0x72FA) % 65536;

    crc = encodeNumberToCRC(CRC_POLYNOMIAL_2, finalizedEncryptedValue1);

    const encryptedValue2 = encrypt(CRC_POLYNOMIAL_2, crc, cipherCharCodesReversed);

    return [
        activationKey,
        `${generatePassword(finalizedEncryptedValue1, encryptedValue2)}::${MACHINE_NUMBER}:${expirationDateFinalized}`,
    ];
}

export const MACHINE_NUMBER: string = "800001" as const;