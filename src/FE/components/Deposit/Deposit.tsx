import React, { useEffect, useRef, useState } from "react";
import utils from "@/app/styles/utils.module.css";
import { AiFillCaretDown } from "react-icons/ai";
import Image from "next/image";
import { ethers } from "ethers";
import { Button, message } from "antd";
import { Modal } from "antd";
import { ERC20Tokens } from "@/src/data/ERC20Tokens";
import { droptokens } from "../../functions/interact";
import DropdownTokens from "./Dropdown";
import axios from "axios";
import { debounce } from "lodash";
import Bottleneck from "bottleneck";
import {
  depositBase,
  generateSecretKeyAction,
} from "@/src/BE/serveractions/depositaction";
import { depositContract } from "../../functions/web3/helpers";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

// Create a limiter with a maximum of 5 requests per second
const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 200, // 1 request per 200ms
});

interface Keys {
  hash: String[];
  secretRefined: String;
}

const Deposit = ({ contractAddr }: any) => {
  const tokenAddress = useRef<HTMLInputElement>(null);
  const [quote, setQuote] = useState<{
    symbol: string | null;
    quote: number | string | null;
  }>({ symbol: null, quote: null });
  const [val, setVal] = useState<number>(1);
  const [token, selectToken] = useState("");
  const [account, setAccount] = useState<string>();
  const secretRef = useRef<HTMLInputElement>(null);
  const unitInputRef = useRef<HTMLInputElement>(null);
  const [modalState, setModal] = useState(false);
  const [secret, setSecet] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(modalState);
  const [keyMethod, setKeyMethod] = useState<"enter" | "generate">("generate");
  const [lastInput, setLastInput] = useState({ token: "", amount: 0 });
  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  // Keys modal visiblity functions
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleDeposit = async () => {
    try {
      setLoading(true);
      if (secretRef && secretRef.current && secretRef.current.value != "") {
        setSecet(secretRef.current.value);
      }
      if (secret == "") {
        message.error("Invalid amount", 4);
        setLoading(false);

        return;
      }
      if (!unitInputRef || !unitInputRef.current) {
        message.destroy();
        message.error("invalid deposit amount", 3);
        setLoading(false);

        return;
      }
      if (!isConnected && openConnectModal) {
        message.destroy();
        openConnectModal();
        setLoading(false);

        return;
      }

      message.loading("Please wait...", 10000);
      const [{ root, commitment }, err] = (await depositBase(
        secret,
        unitInputRef.current.value
      )) as [{ root: string; commitment: string }, error: string];
      console.log({ commitment, root });

      if (err) {
        console.log({ err });
        setLoading(false);

        return;
      }

      const e = new ethers.BrowserProvider(window.ethereum);
      const signer = await e.getSigner();

      const [tx, error] = await depositContract(
        commitment,
        root,
        String(Number(unitInputRef.current.value) * 0.0001),
        signer
      );
      if (error) {
        message.destroy();
        message.error(error);
        setLoading(false);
        return;
      }
      message.destroy();
      message.success("Deposit successful", 2);
      window.localStorage.setItem("SecretKeys", secret)!;
      storeSecretKeys();
      revealSecret();
      setLoading(false);
    } catch (err: any) {
      setLoading(false);

      message.destroy();
      console.log(err.essage);
      console.log(message.error(err.mesage));
    }
  };

  // generates teh private key
  const generatePrivateKey = async (a: string) => {
    const secret = generateSecretKeyAction(a);
    return secret;
  };

  const storeSecretKeys = () => {
    if (secret) {
      window.localStorage.setItem("SecretKeys", secret);
      message.destroy();
      message.success("stored");
    }
  };

  const revealSecret = () => {
    if (window.localStorage.getItem("SecretKeys")) {
      const secret = window.localStorage.getItem("SecretKeys")!;

      setSecet(secret);
      showModal();
      return;
    }
    if (secret) {
      showModal();
      return;
    }
    return;
  };

  // celar keys from browser storage
  const clearSecret = () => {
    if (window.localStorage.getItem("SecretKeys")) {
      window.localStorage.removeItem("SecretKeys");
      message.destroy();
      message.success("cleared", 2);
    }
  };

  const switchSecretMethod = () => {
    keyMethod == "enter" ? setKeyMethod("generate") : setKeyMethod("enter");
  };

  const handleTokenSelect = (selectedToken: string) => {
    selectToken(selectedToken);
    setQuote({ symbol: null, quote: null }); // Reset the quote when a new token is selected
  };

  const init = async () => {
    if (!isConnected && openConnectModal) {
      openConnectModal();
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setAccount(signer.address);
      return signer.address;
    } catch (err: any) {
      return null;
    }
  };

  const fetchEthToTokenPrice = async (tokenSymbol: string) => {
    try {
      const response = await limiter.schedule(() =>
        axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=ethereum,${tokenSymbol}&vs_currencies=eth`
        )
      );
      const ethToTokenPrice = 1 / response.data[tokenSymbol.toLowerCase()].eth;
      return ethToTokenPrice;
    } catch (error) {
      console.error("Error fetching token price:", error);
      return null;
    }
  };

  const calculateTokenEquivalent = async (
    tokenSymbol: string,
    units: number
  ) => {
    const ethAmount = units * 0.0001; // Convert units to ETH
    const ethToTokenPrice = await fetchEthToTokenPrice(tokenSymbol);
    if (ethToTokenPrice) {
      const tokenEquivalent = ethAmount * ethToTokenPrice;
      setQuote({ symbol: tokenSymbol, quote: tokenEquivalent.toFixed(6) });
    }
  };

  const debouncedCalculateTokenEquivalent = useRef(
    debounce((tokenSymbol, amount, calculateTokenEquivalent) => {
      calculateTokenEquivalent(tokenSymbol, amount);
    }, 1000)
  ).current; // Debounce by 1 second

  const MIN_DIFFERENCE = 0.01; // Minimum change in amount to trigger API

  const onChange = () => {
    const selectedToken = ERC20Tokens[token];
    const amount = unitInputRef.current
      ? parseFloat(unitInputRef.current.value)
      : 1;
    if (unitInputRef && unitInputRef.current) {
      setVal(
        Number(unitInputRef.current.value ? unitInputRef.current.value : 1)
      );
    }

    // Only call API if token changes or the amount difference is greater than MIN_DIFFERENCE
    if (
      selectedToken &&
      selectedToken.address != "" &&
      selectedToken.address != "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" &&
      (selectedToken.symbol !== lastInput.token ||
        Math.abs(amount - lastInput.amount) > MIN_DIFFERENCE)
    ) {
      setLastInput({ token: selectedToken.symbol, amount });
      debouncedCalculateTokenEquivalent(
        selectedToken.symbol,
        amount,
        calculateTokenEquivalent
      );
    }
  };
  useEffect(() => {
    if (window.localStorage.getItem("SecretKeys")) {
      setSecet(window.localStorage.getItem("SecretKeys")!);
    }
    document.getElementById("keyReveal")!.style.display = "hidden";
    if (secret || window.localStorage.getItem("SecretKeys")) {
      document.getElementById("keyReveal")!.style.display = "block";
    } else {
      document.getElementById("keyReveal")!.style.display = "hidden";
    }
  }, [val, account, modalState]);

  return (
    <>
      <Modal
        title="Secret key"
        className="text-center"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <em className="text-xl text-red-600 my-2">
          We do not store the secret key on our servers, if you forget it you
          cannot get your funds back from the contract{" "}
        </em>
        <p className=" select-text my-2 text-2xl  font-bold">
          secret key: {secret}
        </p>

        <button className="xp-button-3d text-[20px]" onClick={clearSecret}>
          Clear from browser storage?
        </button>
      </Modal>
      <article
        className={
          utils.depositContainer + " xp-window-3d mx-auto w-full max-w-[700px]"
        }
      >
        <div
          className={utils.depositTitle + " xp-window-titlebar-3d text-center"}
        >
          <h1 className="text-2xl font-extrabold">
            DEPOSIT YOUR CRYPTO TO DE-MIXER
          </h1>
          <em className="text-lg font-bold">note: 1unit = 0.0001ETH</em>
        </div>
        <section className="flex flex-col items-center">
          <div className="flex flex-col space-y-4  w-full">
            <button
              id="keyReveal"
              onClick={() => {
                revealSecret();
              }}
              className="bg-white hidden mt-4 w-fit text-black px-4 py-2 mx-auto xp-button-3d"
            >
              Reveal stored secret
            </button>
            <div>
              <input
                ref={secretRef}
                type="text"
                onChange={() => {
                  if (!secretRef || !secretRef.current) return;
                  setSecet(secretRef.current.value);
                }}
                id="secretInput"
                readOnly={keyMethod == "generate"}
                style={{
                  backgroundColor: `${
                    keyMethod == "generate" ? "#E6E6E6" : "#fff"
                  }`,
                }}
                className=" w-full block my-4 xp-input-3d h-10 border border-black px-2 max-w-[500px] mx-auto"
                placeholder={
                  keyMethod == "enter"
                    ? "Enter a unique secret "
                    : "Unique secret"
                }
              />
            </div>
          </div>
          <section className="flex flex-col items-center space-y-4 md:space-y-0 md:justify-center md:flex-row md:space-x-4 ">
            {keyMethod == "generate" ? (
              <button
                onClick={async () => {
                  let signer = await init();
                  if (signer) {
                    (
                      document.getElementById("secretInput") as HTMLInputElement
                    ).style.color = "#666";
                    (
                      document.getElementById("secretInput") as HTMLInputElement
                    ).value = "Generating..";

                    let key = await generatePrivateKey(signer);

                    if (key) {
                      (
                        document.getElementById(
                          "secretInput"
                        ) as HTMLInputElement
                      ).style.color = "#000";
                      (
                        document.getElementById(
                          "secretInput"
                        ) as HTMLInputElement
                      ).value = key;
                    }
                    window.localStorage.setItem("SecretKeys", key)

                    setSecet(key);
                  } else {
                    message.warning("Please connect your wallet");
                  }
                }}
                className="xp-button-3d bg-red-500 w-fit text-white px-4 py-2 block mx-auto"
              >
                Generate
              </button>
            ) : null}
            <button
              className="xp-button-3d block max-w-[320px] mx-auto"
              onClick={switchSecretMethod}
            >
              {keyMethod == "enter"
                ? "generate a secret"
                : "enter secret manually"}
            </button>
            :
          </section>

          <div>
            <div className="bg-black relative flex items-center h-10 mx-auto w-full max-w-[300px] my-4 mt-10">
              <DropdownTokens select={handleTokenSelect} />

              <input
                ref={tokenAddress}
                type="text"
                readOnly
                placeholder="Select Token"
                className="xp-input-3d h-full w-full"
                value={token}
              />
              {ERC20Tokens[token].logoURI ? (
                <span
                  onClick={() => {
                    droptokens("d");
                  }}
                  className={
                    utils.icons +
                    "  xp-button-3d h-full flex items-center justify-center"
                  }
                >
                  <Image
                    src={ERC20Tokens[token].logoURI}
                    width="120"
                    height="120"
                    alt={token}
                    className="w-6 h-5"
                  />
                </span>
              ) : (
                <span
                  onClick={() => {
                    droptokens("d");
                  }}
                  className={
                    " flex items-center h-full xp-button-3d  justify-center"
                  }
                >
                  <AiFillCaretDown />
                </span>
              )}
            </div>
            <p className="text-center">Enter token units to Deposit</p>
            <div className="w-full h-10 max-w-[300px] mx-auto">
              <input
                type="number"
                className="no-arrows xp-input-3d w-full h-full"
                min={1}
                onChange={onChange}
                ref={unitInputRef}
                id="depositInput"
              />
            </div>
            <p className="mt-5 text-2xl text-center text-red-600 w-full md:min-w-[300px] break-words">
              {isNaN(val) ? "1" : val}units ={" "}
              {isNaN(val) ? "1" : (val * 0.0001).toFixed(4)} ETH of Token
            </p>
            <p className="text-green-600 text-center text-2xl">
              {quote.symbol ? `${quote.quote} ${quote.symbol}` : ""}
            </p>
            <button
              id="deposit"
              onClick={handleDeposit}
              disabled={loading}
              className={
                "diabled:opacity-[0.7] mx-auto block my-8 xp-button-3d"
              }
            >
              <p className="text-xl">DEPOSIT</p>
            </button>
          </div>
        </section>
      </article>
    </>
  );
};

export default Deposit;
