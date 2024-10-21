import React, { useRef, useState } from 'react'
import utils from "@/app/styles/utils.module.css";
import { tokens } from '@/src/data/withdrawTokenData/ERC20TokensData'
import Image, { StaticImageData } from 'next/image';
import { AiOutlineSearch } from 'react-icons/ai';
import { searchTokens } from '../../functions/interact';

interface Props{
    select: (a:string)=>void

}
interface Token{
  name:string;
  symbol:string
  logoURI: string | StaticImageData,
  address: string,
  decimals: number | null
}
const DropdownTokens = ({select}:Props) => {
  const [Tokens,setTokens]=useState<Token[]>(tokens)
  const searchRef = useRef<HTMLInputElement>(null)

  const change=()=>{
    if(searchRef.current){
    let a= searchTokens(tokens,searchRef.current.value)
    setTokens(a)
    }
  
  
  }
  return (
    <ul className={utils.dropDown+'  xp-menu-3d'} id="erc20">
      <div  className='xp-window-content-3d '>
      <li><AiOutlineSearch color='black' className={utils.searchIcon} size={25} /><input ref={searchRef} onChange={change} onClick={(e)=>{e.stopPropagation()}} type="text" placeholder='Search Token'/></li>
    {Tokens.map((token,index)=>(<li className='xp-menu-item-3d cursor-pointer' key={index} onClick={()=>{select(token.name)}} >{token.logoURI?<Image src={token.logoURI} width="100" height="100" alt={token.name} />:<></>}{token.name}</li>))}
    </div>

    </ul>
  )
}

export default DropdownTokens