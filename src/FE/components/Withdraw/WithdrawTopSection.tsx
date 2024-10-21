import Image from "next/image";
import React, { useRef, useState } from "react";
import { AiFillCaretDown } from "react-icons/ai";
import DropdownTokens from "./DropdownW";
import { ERC20Tokens } from "@/src/data/ERC20Tokens";
import { droptokens, generateRandomString } from "../../functions/interact";

interface obj {
  [key: string]: number;
}

const WithdrawTopSection = ({_key}:{_key:any}) => {
  const [tokenName, setTokenName] = useState<string>("Ethereum");
  const input_tokenRef = useRef<HTMLInputElement>(null);
  const [val, setVal] = useState<number | undefined>();
  const id = generateRandomString()
  let total = 0;
  const selectToken=(selectedToken:string)=>{
    setTokenName(selectedToken)

  }
  const change = () => {
    const len = document.querySelectorAll(
      ".tokenamount"
    ) as NodeListOf<HTMLInputElement>;
    let a: obj = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
    };
    for (let i = 0; i < len.length; i++) {
      if (!isNaN(parseFloat(len[i].value))) {
        a[`${i + 1}`] = parseFloat(len[i].value);
      }
    }
    total = a["1"] + a["2"] + a["3"] + a["4"] + a["5"];
    (
      document.getElementById("totalTag") as HTMLSpanElement
    ).innerHTML = `${total}`;
    return;
  };

  return (
    <>
      {" "}
      <div className="xp-menu-3d mb-2">
        <div className="py-4 px-6 max-w-[500px] mx-auto w-full">
          <input
            type="text"
            className="xp-input-3d block px-2 w-full h-10 my-2 recipients"
            placeholder="Enter Recipient Address"
            id="addresesRec"
          />
          <div
          id={id}
            className={" flex items-center relative h-10 my-2"}
          >
            <DropdownTokens select={selectToken} />

            <input
              type="text"
              className="xp-input-3d block w-full px-2 h-full tokenNames"
              placeholder="Enter token name or address"
              defaultValue={tokenName}
              id="tokenAddressesRec"
              value={tokenName}
            />
            {ERC20Tokens[tokenName].logoURI ? (
              <span
                onClick={(e) => {
                  droptokens("w", e,id);
                }}
                
                className="w-10  items-center flex justify-center xp-button-3d h-full"
              >
                <Image
                  src={ERC20Tokens[tokenName].logoURI}
                  width="120"
                  height="120"
                  alt={tokenName}
                />
              </span>
            ) : (
              <span
                onClick={(e) => {
                  droptokens("w", e,id);
                }}
                className="w-10 items-center flex justify-center xp-button-3d h-full"
              >
                <AiFillCaretDown />
              </span>
            )}
          </div>
          <div>
            <input
              id={"tokenamount_"+_key}
              ref={input_tokenRef}
              accept="number"
              value={val}
              defaultValue={val}
              min={1}
              onChange={(e) => {
                change();
              }}
              type="number"
              className="no-arrows xp-input-3d w-full h-10 tokenamount"
              placeholder="Enter token amount in eth"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default WithdrawTopSection;
