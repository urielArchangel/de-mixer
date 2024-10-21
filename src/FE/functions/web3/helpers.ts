import { MIXER_CONTRACT_ADDRESS, TOKEN_INTERFACE } from "@/src/data/libs/constants";
import { ContractRunner, ethers } from "ethers";
import mixerABI from "@/src/BE/contract/artifacts/mixerABI.json";
import Web3 from "web3";
import { Groth16Proof, PublicSignals } from "snarkjs";

import { ERC20Tokens } from "@/src/data/withdrawTokenData/ERC20Tokens";
import {  getCMCPriceInETH } from "@/src/data/libs/quotes";
import { urlresolve } from "../helpers";


const correctChainID = "0xaa36a7" //11155111
export const depositContract = async (
  commitment: string,
  root: string,
  amountInEth: string,signer:ContractRunner
) => {
  try {
    
    const contract = new ethers.Contract(
      MIXER_CONTRACT_ADDRESS,
      mixerABI.output.abi,
      signer
    );
    console.log({a:parseFloat(amountInEth),convert:String(parseFloat(amountInEth)*(10**18))})
    const tx = await contract.depositBase(commitment, root, { value: String(parseFloat(amountInEth)*(10**18)) });
    console.log({ tx });
    return [tx,null]
  } catch (error: any) {
    return [null,error.message]
  }
};

export const withdrawContract = async(_recipient:string,_amount:string,_tokenAddresses:string[],proof:Groth16Proof,publicSignal:PublicSignals)=>{
  try {
   const provider = new ethers.BrowserProvider(window.ethereum)
   const signer = await provider.getSigner()
   const contract = new ethers.Contract(
    MIXER_CONTRACT_ADDRESS,
    mixerABI.output.abi,
    signer
   ) 
  //  
  const {pi_a,pi_b,pi_c}=proof
  const _pA = [pi_a[0],pi_a[1]]
  const _pB = [[pi_b[0][1],pi_b[0][0]],[pi_b[1][1],pi_b[1][0]]]
  const _pC = [pi_c[0],pi_c[1]]

  const token = ERC20Tokens[_tokenAddresses[0]]
  const tokenName = _tokenAddresses[0]
  // console.log({token})
  //  const res = await fetch(urlresolve(`/api/fetchQuote`),{method:"POST",body:JSON.stringify({tokens:[token.symbol]})})
  //  const data = await res.json()
  //  console.log({d:data.data})
    const linkMin = String(BigInt(0.0044 * Number(_amount) * 99/100))
   const tx = await contract.withdrawBase(_recipient,_amount,_pA,_pB,_pC,publicSignal)
   return [tx,null]
  } catch (error:any) {
    console.log("contract error "+error.message)
    return [null,error.message]
  }
}


// https://sepolia.base.org
export const fetchAllCommitments = async () => {
  const web3 = new Web3("https://rpc2.sepolia.org	");
  const contract = new web3.eth.Contract(
    mixerABI.output.abi,
    MIXER_CONTRACT_ADDRESS
  );

  let commitments = await contract.methods.getCommitments().call()as string[];
  commitments = commitments.map(e=>String(e))

  return commitments ? commitments : [];
};


export const fetchAllRoots=async()=>{
  const web3 = new Web3("https://rpc2.sepolia.org");
  const contract = new web3.eth.Contract(
    mixerABI.output.abi,
    MIXER_CONTRACT_ADDRESS
  );

  let roots = await contract.methods.getRoots().call() as string[];
  roots = roots.map(e=>String(e))
  return roots ? roots : [];
}