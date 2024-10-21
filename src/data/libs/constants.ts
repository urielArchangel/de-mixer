// This file stores web3 related constants such as addresses, token definitions, ETH currency references and ABI's

import { SUPPORTED_CHAINS, Token } from '@uniswap/sdk-core'

// Addresses

export const POOL_FACTORY_CONTRACT_ADDRESS =
  '0x1F98431c8aD98523631AE4a59f267346ea31F984'
export const QUOTER_CONTRACT_ADDRESS =
  '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'

// Currencies and Tokens

export interface TOKEN_INTERFACE{
  in:{
    address:string,
    decimals:number,
    symbol:string,
    name:string
  },
  out:{
    address:string,
    decimals:number,
    symbol:string,
    name:string
  },
  amount:string,
  fee: 500|3000|10000
}


export const TOKENS = (T:TOKEN_INTERFACE)=>{

return {
    FROM_TOKEN : new Token(
  SUPPORTED_CHAINS[0],
  T.in.address,
  T.in.decimals,
  T.in.symbol,
  T.in.name
),

    TO_TOKEN : new Token(
  SUPPORTED_CHAINS[0],
  T.out.address,
  T.out.decimals,
  T.out.symbol,
  T.out.name
)}
  }


  export const CHAINLINK_AGGREGATOR_ABI = [
    {
      "inputs": [],
      "name": "latestAnswer",
      "outputs": [{ "internalType": "int256", "name": "", "type": "int256" }],
      "stateMutability": "view",
      "type": "function",
    },
  ];

  // export const MIXER_CONTRACT_ADDRESS ="0x4cab2913be42C7F381809A72065cF2CCd1FbC08a"
  export const MIXER_CONTRACT_ADDRESS ="0x1dD36e1bF40258Ab661f48bA4B9CAf015f331134"
