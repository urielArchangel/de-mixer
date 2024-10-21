import { Token } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'
import { TOKENS, TOKEN_INTERFACE } from './constants'

// Inputs that configure this example to run
export interface ExampleConfig {
  rpc: {
    local: string
    mainnet: string
  }
  tokens: {
    in: Token
    amountIn: number
    out: Token
    poolFee: number
  }
}

// Example Configuration

export const CurrentConfig = (T:TOKEN_INTERFACE):ExampleConfig=>
{
return {  
  rpc: {
    local: '',
    mainnet: 'https://mainnet.infura.io/v3/874d9ca546c443be90882161ff27c213',
  },
  tokens: {  
    in: TOKENS(T).FROM_TOKEN,
    amountIn: T.amount,
    out: TOKENS(T).TO_TOKEN,
    poolFee: T.fee
  }}
}