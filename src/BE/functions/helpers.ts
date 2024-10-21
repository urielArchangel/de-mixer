import crypto from "crypto";
import { buildPoseidon } from 'circomlibjs';
import BigNumber from 'bignumber.js';

export const sha256Hash = (a:string,salt?:string)=>{
    const hash = crypto.createHash("md5").update(salt+a+salt).digest("hex");
    const bn = BigInt('0x'+hash);
    return bn.toString()
}

export async function Poseidonhash(a:BigNumber[]) {
    const poseidon = await buildPoseidon()
    return poseidon.F.toString(a) as string;
}


