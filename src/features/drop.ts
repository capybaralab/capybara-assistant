// const crypto = require("crypto");
// const dayjs = require("dayjs");
//
// const CHARS_ROLL = 15;
// const MAX_ROLL = 1000;
//
// const serverSeed = crypto.randomBytes(16).toString("hex");
// const clientSeed = "alamakota";
// const salt = crypto.randomBytes(8).toString("hex");
// const data = dayjs().format("YYYY-MM-DD HH:mm:ss");
// const nonce = 0;
//
// const magicCaseItems = [
//     {
//         id: 1,
//         color: "red",
//         icon: "💎",
//         name: "Magic Item 1",
//         description: "This is a magic item",
//         percent: 0.03,
//     },
//     {
//         id: 2,
//         name: "Magic Item 2",
//         description: "This is a magic item",
//         percent: 0.32,
//     },
//     {
//         id: 3,
//         name: "Magic Item 3",
//         description: "This is a magic item",
//         percent: 0.05,
//     },
//     {
//         id: 4,
//         name: "Magic Item 4",
//         description: "This is a magic item",
//         percent: 0.3,
//     },
//     {
//         id: 5,
//         name: "Magic Item 4",
//         description: "This is a magic item",
//         percent: 0.3,
//     },
// ];
//
// function generateRoll(serverSeed, clientSeed, nonce) {
//     //generate hash
//     const hash_hmac = crypto
//         .createHmac("sha512", serverSeed)
//         .update(`${clientSeed}--${nonce}`)
//         .digest("hex");
//
//     //get first 16 bytes of hash
//     const partHash = hash_hmac.substring(0, CHARSROLL);
//
//     //convert partHash to number
//     const roll = parseInt(partHash, 16) % MAX_ROLL;
//     return roll + 1;
// }
//
// function returnPublicHash(secret, salt) {
//     //generate public hash
//     return crypto.createHmac("sha256", secret).update(salt).digest("hex");
// }
//
// function getRangeByOdds(odds, maxRoll, lastRangeMax) {
//     const range = Math.floor(maxRoll * odds);
//
//     return {
//         min: lastRangeMax + 1,
//         max: lastRangeMax + range,
//     };
// }
//
// function getResult(roll, items) {
//     for (const [index, item] of items.entries()) {
//         //if index is 0, set range to 0 else set range to last range max
//         const lastRangeMax = index === 0 ? 0 : max;
//
//         //get range by odds
//         ({ min, max } = getRangeByOdds(item.percent, MAX_ROLL, lastRangeMax));
//
//         //if roll is in range, return item
//         if (roll >= min && roll <= max) {
//             return { range: `${min}-${max}`, ...item };
//         }
//     }
// }
//
// const roll = {
//     server_seed: serverSeed,
//     secret_salt: salt,
//     public_hash: returnPublicHash(serverSeed, salt),
//     client_seed: clientSeed,
//     nonce: nonce,
//     roll: generateRoll(serverSeed, clientSeed, nonce),
//     data: data,
// };
//
// const result = getResult(
//     generateRoll(serverSeed, clientSeed, nonce),
//     magicCaseItems
// );
