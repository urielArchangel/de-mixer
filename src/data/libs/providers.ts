import { ethers } from 'ethers'

// Provider Functions

export function getProvider(): ethers.Provider {
  return new ethers.JsonRpcProvider("https://go.getblock.io/6a3181c6a4174f54a97a2a13e7787f9a")

  // return new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/874d9ca546c443be90882161ff27c213")
}