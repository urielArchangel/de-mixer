"use server";

import { fetchAllCommitments } from "@/src/FE/functions/web3/helpers";
import { sha256Hash } from "../functions/helpers";
import { calculateSpecificRoot } from "../functions/merkletree";

export const depositBase = async (secret: string, units: string) => {
  try {
    
    const amountInEth = Number(units) * 0.0001;
    const salt = process.env.salt;
    let  commitment = sha256Hash(secret+amountInEth,salt)
    commitment = commitment.slice(0,31)
    const commitments = await fetchAllCommitments() as string[]
    commitments.push(commitment)
    if(((commitments.length % 2) != 0) || commitments.length == 0){
      commitments.push("0")
    }
    const root = await calculateSpecificRoot(commitments,commitment)
    return [{root:root.slice(0,31),commitment:commitment.slice(0,31)},null];
  } catch (error: any) {

    return [null,error.message];

  }
};


export const generateSecretKeyAction = (a:string)=>{
  const secret = sha256Hash(a,process.env.salt+Date.now().toString())
  return Number(secret.slice(0,20)).toString(16)}