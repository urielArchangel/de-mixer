import { getCMCPriceInETH } from "@/src/data/libs/quotes";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    try {
        const {tokens} = await req.json()
   const data =  await getCMCPriceInETH(tokens)
        return  NextResponse.json({data})
        
    } catch (error:any) {
        return new NextResponse()
        
    }
}