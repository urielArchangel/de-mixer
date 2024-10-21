import { message, Tooltip } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
// import { isAddress } from "web3-validator";
import utils from "@/app/styles/utils.module.css";
import WithdrawTopSection from "./WithdrawTopSection";
import { ethers } from "ethers";
import { withdrawActionBase } from "@/src/BE/serveractions/withdrawAction";
import { Groth16Proof, PublicSignals } from "snarkjs";
import { withdrawContract } from "../../functions/web3/helpers";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";




const Withdraw = () => {
  const [count, setCount] = useState(1);
  const secretRef = useRef<HTMLInputElement>(null);
  const [secret, setSecet] = useState("");
  const [account, setAccount] = useState<string>();
  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();
const [loading,setLoading] = useState(false)
  const init = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    setAccount(signer.address);
    return signer.address;
  };

  const handleWithdraw = async () => {
    try {
      if (secretRef && secretRef.current && secretRef.current.value != "") {
        setSecet(secretRef.current.value);
      }
      if (secret == "") {
        message.error("Invalid amount", 4);
        return;
      }
      if (!isConnected && openConnectModal) {
        message.destroy()
        openConnectModal();
        setLoading(false)

        return;
      }

      let totalEth = 0;
      let recipients: string[] = [];
      let tokenAddresses:string[]=[]
      const el = document.querySelectorAll(
        ".tokenamount"
      ) as NodeListOf<HTMLInputElement>;
      el.forEach((e) => [(totalEth += parseFloat(e.value))]);
      const el1 = document.querySelectorAll(
        ".recipients"
      ) as NodeListOf<HTMLInputElement>;
      el1.forEach((e) => [recipients.push(e.value)]);
     const tokenNameElements = document.querySelectorAll(
        ".tokenNames"
      ) as NodeListOf<HTMLInputElement>;
      tokenNameElements.forEach((e) => [tokenAddresses.push((e.value))]);
      if (recipients.length <= 0) {
        return;
      }
      if (totalEth <= 0) {
        return;
      }
      if(tokenAddresses.length <= 0){
        return
      }
      message.loading("Please wait...", 10000);

      const [data, error] =
        (await withdrawActionBase(secret, String(totalEth))) as [
          {
            proof: Groth16Proof;
            publicSignals: PublicSignals;
            nulifier: string;
          }|null,
          error: string|null
        ];
      if (error) {
        message.destroy();
        message.error(error);
        return
      }
      if(!data)return
      console.log({data})

      const {proof,publicSignals} = data
     

      const [tx, err] = (await withdrawContract(
        recipients[0],
       String( Number(totalEth) * 10**18),
        tokenAddresses,
        proof,
        publicSignals
      )) as [tx: any, error: string];

      if (err) {
        message.destroy();
        message.error(err);
        return
      }
      message.destroy();
      message.success("Funds successully withdrawn");
      console.log({ tx });
    } catch (error: any) {}
  };

  const [Section, setSectionCount] = useState<React.JSX.Element[]>([
    <WithdrawTopSection key={count} _key={count} />,
  ]);
  const increase = () => {
    if (count < 5) {
      setSectionCount([
        ...Section,
        <WithdrawTopSection key={count} _key={count} />,
      ]);
      setCount((prev) => prev + 1);
    } else {
      return;
    }
  };
  const decrease = () => {
    if (count > 1) {
      Section.pop();
      setCount((prev) => prev - 1);
    } else {
      return;
    }
  };

  return (
    <article>
      <div className="text-red-500 text-center text-xl">
        Please ensure that your withdrawal total amount matches the deposit
        amount made per key, as any mismatch will prevent the withdrawal.
      </div>
      <div className="xp-window-3d max-w-[600px] mx-auto text-center ">
        <div className="xp-window-titlebar-3d">
          <h1 className="text-2xl font-bold">
            WITHDRAW ANONYMOUSLY TO OTHER ACCOUNT(S)
          </h1>
        </div>
        <div className="flex flex-col space-y-4  w-full">
          <input
            ref={secretRef}
            type="text"
            onChange={() => {
              if (!secretRef || !secretRef.current) return;
              setSecet(secretRef.current.value);
            }}
            id="secretInput"
            className="my-8 w-full block xp-input-3d h-10 border border-black px-2 max-w-[500px] mx-auto"
            placeholder="Enter the secret you used during deposit"
          />
        </div>
        {Section.map((Sect, i) => {
          return React.cloneElement(Sect, { key: i });
        })}
        <div>
          <p>
            Total amount to withdraw: <span id="totalTag">0</span> ETH
          </p>
          <div className="flex">
            {count === 5 ? (
              <Tooltip title={"Max Reached"}>
                <div
                  className="xp-button-3d mx-1 w-fit cursor-pointer"
                  onClick={increase}
                >
                  <AiOutlinePlus style={{ opacity: "0.5" }} size={20} />
                </div>
              </Tooltip>
            ) : (
              <div
                className="xp-button-3d mx-1 w-fit cursor-pointer"
                onClick={increase}
              >
                <AiOutlinePlus size={20} />
              </div>
            )}
            {count === 1 ? (
              <Tooltip title={"Minimum Reached"}>
                <div
                  className="xp-button-3d cursor-pointer mx-1 w-fit"
                  onClick={decrease}
                >
                  <AiOutlineMinus style={{ opacity: "0.5" }} size={20} />
                </div>
              </Tooltip>
            ) : (
              <div
                className="xp-button-3d mx-1 w-fit cursor-pointer"
                onClick={decrease}
              >
                <AiOutlineMinus size={20} />
              </div>
            )}
          </div>
          <h4>Enter your access keys</h4>

          <button
            className={utils.depositButton + " xp-button-3d"}
            onClick={handleWithdraw}
          >
            WITHDRAW
          </button>
        </div>
      </div>
    </article>
  );
};

export default Withdraw;
