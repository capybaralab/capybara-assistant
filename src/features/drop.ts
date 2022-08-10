import crypto from 'crypto-js';
import dayjs from 'dayjs';

const serverSeed = crypto.lib.WordArray.random(16).toString(crypto.enc.Hex);
const salt = crypto.lib.WordArray.random(8).toString(crypto.enc.Hex);
const currentDate = dayjs().format('YYYY-MM-DD HH:mm:ss');

const MAX_ROLL = 10000;
const CHARS_ROLL = 15;
const NONCE = 0;

const dropItems = [
    {
        id: 1,
        name: 'Web development',
        percent: 0.018,
    },
    {
        id: 2,
        name: 'Discord bot',
        percent: 0.002,
    },
    {
        id: 3,
        name: 'Gówno kurwa zjebie',
        percent: 0.98,
    },
];

const getPublicHash = (serverSeed: string, salt: string) => crypto.HmacSHA256(salt, serverSeed).toString(crypto.enc.Hex);

const getRangeByOdds = (odds: number, maxRoll: number, lastRangeMax: number) => {
    const range = Math.floor(maxRoll * odds);

    return {
        min: lastRangeMax + 1,
        max: lastRangeMax + range,
    };
};

const getResult = (roll: number, items: typeof dropItems) => {
    for (const [index, item] of items.entries()) {
        //if index is 0, set range to 0 else set range to last range max
        const lastRangeMax = index === 0 ? 0 : max;

        //get range by odds
        var { min, max } = getRangeByOdds(item.percent, MAX_ROLL, lastRangeMax);

        //if roll is in range, return item
        if (roll >= min && roll <= max) {
            return { range: `${min}-${max}`, ...item };
        }
    }
};

const generateRoll = (serverSeed: string, clientSeed: string, nonce: number) => {
    const hashHmac = crypto.HmacSHA512(serverSeed, `${clientSeed}--${nonce}`).toString(crypto.enc.Hex);

    //get first 16 bytes of hash
    const partHash = hashHmac.substring(0, CHARS_ROLL);

    //convert partHash to number
    const roll = parseInt(partHash, 16) % MAX_ROLL;
    return roll + 1;
};

export const getOpeningResult = (clientSeed: string) => {
    const result = getResult(generateRoll(serverSeed, clientSeed, NONCE), dropItems);
    return {
        server_seed: serverSeed,
        secret_salt: salt,
        public_hash: getPublicHash(serverSeed, salt),
        client_seed: clientSeed,
        nonce: NONCE,
        roll: generateRoll(serverSeed, clientSeed, NONCE),
        date: currentDate,
        result: result?.name,
    };
};
