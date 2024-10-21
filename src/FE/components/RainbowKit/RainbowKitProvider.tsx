'use client'
import React from 'react'
import {  WagmiProvider } from "wagmi";
import {
    config,
    myCustomButtonTheme,
  } from "@/src/FE/functions/walletConnection";
  import { CustomAvatar } from "@/src/FE/components/RainbowKit/RainbowkitAvatar";
  import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
  import { QueryClient, QueryClientProvider } from "@tanstack/react-query";



const RainbowKitProviderApp = ({children}:{children:React.ReactNode}) => {
const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider avatar={CustomAvatar} theme={myCustomButtonTheme}>
        {children}
      </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    )
}

export default RainbowKitProviderApp