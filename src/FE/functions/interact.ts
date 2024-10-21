import { StaticImageData } from "next/image";
import React from "react";

export const btnclick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.stopPropagation();
  const id = e.currentTarget.id;
  if ((document.querySelector(`#${id} a`) as HTMLSpanElement) != null) {
    let a = document.querySelector(`#${id} a`) as HTMLSpanElement;
    a.style.transform = "rotateZ(180deg)";
    e.currentTarget.style.transform = "rotateZ(-180deg)";
  }else{
    let p = document.querySelector(`#${id} p`) as HTMLParagraphElement;
    p.style.transform = "rotateZ(180deg)";
    e.currentTarget.style.transform = "rotateZ(-180deg)";
  }
};
export const btnunClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.stopPropagation();
  const id = e.currentTarget.id;
  if (document.querySelector(`#${id} a`) as HTMLSpanElement) {
    let a = document.querySelector(`#${id} a`) as HTMLSpanElement;
    a.style.transform = "rotateZ(0deg)";
    e.currentTarget.style.transform = "rotateZ(0deg)";
  } else {
    let p = document.querySelector(`#${id} p`) as HTMLParagraphElement;
    p.style.transform = "rotateZ(0deg)";
    e.currentTarget.style.transform = "rotateZ(0deg)";
  }
};

export const hyperlink = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  let hash = e.currentTarget.href.split("#")[1];
  let location = document.getElementById(hash) as HTMLDivElement;
  location.scrollIntoView({ behavior: "smooth" });
};
let isDropOpen=false
export const droptokens = (state:string,e?:React.MouseEvent<HTMLSpanElement>,id?:string)=>{
  if(state == 'd'){
  if(!isDropOpen){
  let ul = document.getElementById('erc20') as HTMLUListElement
  ul.style.visibility = "visible";
  ul.style.height = "300px"
  isDropOpen=true
  }else{
    let ul = document.getElementById('erc20') as HTMLUListElement
    ul.style.height = "0px"
      ul.style.visibility = "hidden";
      isDropOpen=false
  }
}else{
  if(!isDropOpen){
    let ul = document.querySelector(`#${id} #erc20`) as HTMLUListElement
    ul.style.visibility = "visible";
    ul.style.height = "200px"
    isDropOpen=true
    }else{
      let ul = document.querySelector(`#${id} #erc20`) as HTMLUListElement
      ul.style.height = "0px"
        ul.style.visibility = "hidden";
        isDropOpen=false
    }
}
}

export function generateRandomString() {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charLength = characters.length;
  let randomString = '';

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * charLength);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}
interface Token{
  name:string;
  symbol:string
  logoURI: string | StaticImageData,
  address: string,
  decimals: number | null
}
export const searchTokens = (tokenArray:Token[],text:string)=>{
  let temp = []
for(let i=0;i<tokenArray.length;i++){
  if(((tokenArray[i].name.toLocaleLowerCase())).includes((text.toLocaleLowerCase()))){
    temp.push(tokenArray[i])
  }else{
    continue
  }
}
return temp
}