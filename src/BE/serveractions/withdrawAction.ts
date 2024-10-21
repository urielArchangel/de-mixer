"use server";

import {
  fetchAllCommitments,
  fetchAllRoots,
  withdrawContract,
} from "@/src/FE/functions/web3/helpers";
import { sha256Hash } from "../functions/helpers";
import { buildPathToRoot } from "../functions/merkletree";
import { groth16 } from "snarkjs";
import path from "path";
import fs from "fs";

export const withdrawActionBase = async (secret: string, totalETH: string) => {
  const salt = process.env.salt;
  const commitment = sha256Hash(secret + totalETH, salt);

  console.log({ commitment });
  const commit = commitment.slice(0, 31);
  let commitments = (await fetchAllCommitments()) as string[];
  console.log({ commitments, commit });
  if (!commitments.includes(commit)) {
    console.log(22)
    return [null,"Could not verify secret!"];
  }
  console.log(24)

  let roots = (await fetchAllRoots()) as string[];
  let index = commitments.indexOf(commit);
  const _root = roots[index];
  const _commitments = commitments.slice(0, index + 1);
  if (_commitments.length % 2 != 0) {
    _commitments.push("0");
  }
  console.log({ _commitments });
  const { root, pathElements, pathIndices } = await buildPathToRoot(
    commit,
    _commitments
  );
  if(root.slice(0,31) != _root){
    return [null,"No withdrawal for this commitment"]
  }

  const inputs = {
    leaf: commit,
    pathElements,
    pathIndices,
    root,
  };

  const wasmPath = path.resolve("src/BE/zk/build/mixer_js/mixer.wasm");

  const zkeyPath = path.resolve("src/BE/zk/build/mixer_0001.zkey");

  const wasmBuffer = fs.readFileSync(wasmPath);

  const zkeyBuffer = fs.readFileSync(zkeyPath);

  try {
    const { proof, publicSignals } = await groth16.fullProve(
      inputs,
      wasmBuffer,
      zkeyBuffer
    );
    if (Number(publicSignals) != 0) {
      return [null, "Proof not valid"];
    }
    // console.log({proof,publicSignals},{depth:4})
  console.log({ _root,root,proof });
  const nulifier = sha256Hash(commit,process.env.salt)

    return [{proof,publicSignals,nulifier}, null];
  } catch (error: any) {
    console.error("Error generating proof:", error);
    return [null, "Error generating proof: " + error.message];
  }

  //  console.log({root,_root,pathElements,pathIndices})
};
