import React from "react";
import { useEffect, useState, useMemo } from "react";
import { useAccount, useChainId, useConfig } from "wagmi";
import { estimateGas, writeContract, waitForTransactionReceipt  } from "@wagmi/core"
import { toast } from "react-toastify";
import { encodeFunctionData, parseUnits } from 'viem'
import BigNumber from "bignumber.js";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowCircleDown, faChevronDown, faSpinner } from "@fortawesome/free-solid-svg-icons";

import { useContractStatus } from "../../hooks/useContractStatus";
import { formatNumber } from "../../utils/methods";

import ContractABI from "../../assets/abi/presale.json"
import TokenABI from "../../assets/abi/token.json"

import shape01 from "../../assets/img/banner/banner_shape01.png";
import shape02 from "../../assets/img/banner/banner_shape02.png";
import shape03 from "../../assets/img/banner/banner_shape03.png";
import fireIcon from "../../assets/img/icon/fire.png";

import ethIcon from "../../assets/img/icon/ETH.svg";
import usdtIcon from "../../assets/img/icon/usdt.svg";
import cardIcon from "../../assets/img/icon/card.svg";

import CountDownOne from "../CountDown/CountDownOne";

import Config from "../../config"

const Banner = (props) => {

  const { address } = useAccount()
  const account = useAccount()
  const chainId = useChainId()
  const config = useConfig()

  const [refresh, setRefresh] = useState(false)
  const {
    totalSoldAmount,
    allocatedAmount,
    totalUsd,
    roundNumber,
    ethPrice,
    endStep,
    nextRoundStartTime,
    tokenBuyAmount,
    artcTokenBalance,
    usdtTokenBalance,
    usdtTokenAllowance,
    ethBalance,
  } = useContractStatus(refresh)
  const [selToken, setSelToken] = useState ("eth")
  const [quoteAmount, setQuoteAmount] = useState (0)

  const [pending, setPending] = useState (false)

  const isBuyable = useMemo(() => {
    if (quoteAmount === 0) return "Please enter the amount."
    if(selToken === "eth") {
      if (Number(ethBalance) / 1e18 < quoteAmount) return "You do not have enough ETH to pay for this transaction."
    }
    if (selToken === "usdt") {
      if (Number(usdtTokenAllowance) / 1e18 < quoteAmount) return "You should do an approve action."
      if (Number(usdtTokenBalance) / 1e18 < quoteAmount) return "You do not have enough USDT to pay for this transaction."
    }
    return null
  }, [address, quoteAmount, selToken])

  const buyToken = async () => {
    if (isBuyable && isBuyable.includes("approve") === false) return
    let data = {
      chainId
    }
    try{
      if (selToken === "usdt") {
        if (isBuyable && isBuyable.includes("approve")) {
          setPending (true)
          data = {
            ...data,
            address: Config.USDT_CONTRACT,
            abi: TokenABI,
            functionName: "approve",
            args: [Config.PRESALE_CONTRACT.Main, Config.MAX_UINT256]
          }
        }
        if (!isBuyable) {
          setPending (true)
          data = {
            ...data,
            address: Config.PRESALE_CONTRACT.Main,
            abi: ContractABI,
            functionName: "buyTokenWithUsdt",
            args: [BigNumber(quoteAmount * 1000000)]
          }
        }
      } else if (selToken === "eth") {
        if (!isBuyable) {
          setPending (true)
          data = {
            ...data,
            address: Config.PRESALE_CONTRACT.Main,
            abi: ContractABI,
            functionName: "buyTokenWithEth",
            value: [BigNumber(quoteAmount * 1e18)]
          }
        }
      }
      const encodedData = encodeFunctionData(data)
      await estimateGas(config, {
        ...account,
        data: encodedData,
        to: data.address,
      })
      const txHash = await writeContract(config, {
        ...account,
        ...data,
      })
      const txPendingData = waitForTransactionReceipt(config, {
        hash: txHash
      })
      toast.promise(txPendingData, {
        pending: "Waiting for pending... 👌",
      });
      const txData = await txPendingData;
      console.log (txData, "DDDDDDDDDDDDDDDD")
      if (txData && txData.status === "success") {
        toast.success(`Successfully done! 👌`)
      } else {
        toast.error("Error! Transaction is failed.");
      }
    } catch (err) {
      console.log (err)
      toast.error("Error! Something went wrong.")
    }
    setPending (false)
  }

  return (
    <section className="banner-area banner-bg">
      <div className="banner-shape-wrap">
        <img src={shape01} alt="" className="img-one" />
        <img src={shape02} alt="" className="img-two" />
        <img src={shape03} alt="" className="img-three" />
      </div>

      <div className="container grid grid-cols-12">
        <div className="row justify-content-center col-span-8">
          <div className="col-lg-10">
            <div className="banner-content text-center">
              <img src={fireIcon} alt="" />
              <h2 className="title ">
                Join Future Of Algorithmic <span>Crypto</span> Trading Strategies
              </h2>
            </div>
          </div>
        </div>
        <div className="row justify-content-center col-span-4">
          <div className="col-xl-10 border-2 border-white rounded-xl">
            <div className="my-2 uppercase text-white text-xl text-center">
              {
                roundNumber === 0 ? `The presale starts in:` :
                0 < roundNumber && roundNumber < 26 ? `Now you are in Round ${roundNumber}. This round ends in:`:
                ""
              }
            </div>
            {nextRoundStartTime && <CountDownOne startTime={nextRoundStartTime}/>}
            <div className="uppercase text-lg font-bold my-2 text-white text-center">Over ${formatNumber(Number(totalUsd) / 10000000)} Raised</div>
            <div className="uppercase text-sm text-white font-normal text-center">Your purchased ${Config.token.symbol} = {formatNumber(Number(artcTokenBalance) / 1e18)}</div>
            <div className="flex flex-row items-center justify-between mt-2">
              <div className="w-full h-0 border-t border-white"/>
              <div className="w-full uppercase text-xs text-white font-semibold min-w-[130px] text-center mx-3">1&nbsp;&nbsp;${Config.token.symbol} = ${Config.token.price/Config.token.priceDecimal}</div>
              <div className="w-full h-0 border-t border-white"/>
            </div>
            <div className="my-3 grid grid-cols-3 gap-1 justify-between">
              <div
                className={`col-span-1 flex flex-row items-center px-3 py-2 gap-2 border border-white rounded-lg hover:text-black text-lg font-bold cursor-pointer ${selToken === "eth" ? "bg-white text-gray-900" : "bg-transparent text-white"} hover:bg-white uppercase`}
                onClick={() => setSelToken("eth")}
              >
                <img src={ethIcon} className="w-6 h-6" />
                eth
              </div>
              <div
                className={`col-span-1 flex flex-row items-center px-3 py-2 gap-2 border border-white rounded-lg hover:text-black text-lg font-bold cursor-pointer ${selToken === "usdt" ? "bg-white text-gray-900" : "bg-transparent text-white"} hover:bg-white uppercase`}
                onClick={() => setSelToken("usdt")}
              >
                <img src={usdtIcon} className="w-6 h-6" />
                usdt
              </div>
              <div
                className={`col-span-1 flex flex-row items-center px-3 py-2 gap-2 border border-white rounded-lg hover:text-black text-lg font-bold cursor-pointer ${selToken === "card" ? "bg-white text-gray-900" : "bg-transparent text-white"} hover:bg-white uppercase`}
                onClick={() => setSelToken("card")}
              >
                <img src={cardIcon} className="w-6 h-6" />
                card
              </div>
            </div>
            <div className="flex flex-row items-center justify-between mb-2">
              <div className="w-full h-0 border-t border-white"/>
              <div className="w-full uppercase text-xs text-white font-semibold min-w-[130px] text-center mx-3">
                {selToken !== "card" ? selToken : "eth"} balance = {selToken === "usdt" ? formatNumber(Number(usdtTokenBalance)/1e18) : formatNumber(Number(ethBalance)/1e18)}
              </div>
              <div className="w-full h-0 border-t border-white"/>
            </div>
            <div className="grid grid-cols-2 gap-2 justify-between mt-4">
              <div className="flex flex-col gap-1">
                <div className="flex flex-row justify-between">
                  <span>ETH you pay</span>
                  <span>Max</span>
                </div>
                <div className="flex flex-row justify-between items-center border border-white rounded-md bg-transparent p-2">
                  <input className="w-full text-lg text-white bg-transparent" type="number" value={quoteAmount} onChange={(e)=>setQuoteAmount(e.target.value)}/>
                  <img src={selToken ==="eth" ? ethIcon : usdtIcon} className="w-6 h-6" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex flex-row justify-between">
                  <span>${Config.token.symbol} you receive</span>
                </div>
                <div className="flex flex-row justify-between items-center border border-white rounded-md bg-transparent p-2">
                  <input className="w-full text-lg text-white bg-transparent" />
                  <img src={ethIcon} className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="text-gray-300 text-xs font-normal text-center my-2">{isBuyable}</div>
            <button
              className="bg-[#00c4f4] w-full rounded-[40px] my-4 py-2 px-4 text-center text-white uppercase"
              disabled={!isBuyable ? false : isBuyable.includes("approve") ? false : true}
              onClick={buyToken}
            >
              {isBuyable && isBuyable.includes("approve") ? "approve" : "buy now"}
              {pending ? <FontAwesomeIcon icon={faSpinner} size="sm" className="animate-spin" /> : <></>}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
