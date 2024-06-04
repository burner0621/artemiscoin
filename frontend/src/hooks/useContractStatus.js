import { useEffect, useState } from "react";
import ContractABI from "../assets/abi/presale.json"
import TokenABI from "../assets/abi/token.json"
import { useAccount, useConfig } from "wagmi";
import { mainnet, sepolia } from '@wagmi/core/chains'
import { createConfig, multicall, getBalance, http } from '@wagmi/core'
import Config from "../config";
import { formatUnits } from "viem";

export function useContractStatus(refresh) {
    const [data, setData] = useState({
        totalSoldAmount: 0,
        allocatedAmount: 0,
        totalUsd: 0,
        roundNumber: 0,
        ethPrice: 0,
        endStep: 0,
        nextRoundStartTime: 0,
        tokenBuyAmount: 0,
        artcTokenBalance: 0,
        usdtTokenBalance: 0,
        usdtTokenAllowance: 0,
        ethBalance: 0,
    })

    const { address } = useAccount();
    const config = useConfig()

    const [refetch, setRefetch] = useState(false)

    useEffect(() => {
        const timerID = setInterval(() => {
            setRefetch((prevData) => {
                return !prevData;
            })
        }, 10000);

        return () => {
            clearInterval(timerID);
        };
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const contract = Config.PRESALE_CONTRACT.Main;
                const artcTokenContract = Config.token.address;

                const contracts = [
                    {
                        address: contract,
                        abi: ContractABI,
                        functionName: 'totalSoldAmount',
                    },
                    {
                        address: contract,
                        abi: ContractABI,
                        functionName: 'allocatedAmount',
                    },
                    {
                        address: contract,
                        abi: ContractABI,
                        functionName: 'getTotalUsd',
                    },
                    {
                        address: contract,
                        abi: ContractABI,
                        functionName: 'getCurrentStep',
                    },
                    {
                        address: contract,
                        abi: ContractABI,
                        functionName: 'getEthPrice',
                    },
                    {
                        address: contract,
                        abi: ContractABI,
                        functionName: 'getEndStep',
                    }
                ]

                const tRound = Config.TOTAL_STEPS;
                for (let idx = 0; idx < tRound; idx++) {
                    contracts.push({
                        address: contract,
                        abi: ContractABI,
                        functionName: 'getStepParameter',
                        args: [idx],
                    })
                }

                if (address) {
                    contracts.push({
                        address: contract,
                        abi: ContractABI,
                        functionName: 'tokenBuyAmount',
                        args: [address],
                    })
                    contracts.push({
                        address: artcTokenContract,
                        abi: TokenABI,
                        functionName: 'balanceOf',
                        args: [address],
                    })
                    contracts.push({
                        address: Config.USDT_CONTRACT,
                        abi: TokenABI,
                        functionName: 'balanceOf',
                        args: [address],
                    })
                    contracts.push({
                        address: Config.USDT_CONTRACT,
                        abi: TokenABI,
                        functionName: 'allowance',
                        args: [address, contract],
                    })
                }
                const _data = await multicall(config, {
                    contracts
                })
                console.log (data, ">>>>>>>>>>>")
                const ethBalanceObject = address ? (await getBalance(config, { address })): {}
                const ethBalance = ethBalanceObject.value
                const roundNumber = _data[3].status === "success" ? parseInt(_data[3].result) : 0;

                setData({
                    totalSoldAmount: _data[0].status === "success" ? parseFloat(formatUnits(_data[0].result, 18)) : 0,
                    allocatedAmount: _data[1].status === "success" ? parseFloat(formatUnits(_data[1].result, 18)) : 0,
                    totalUsd: _data[2].status === "success" ? parseFloat(formatUnits(_data[2].result, 8)) : 0,
                    roundNumber,
                    ethPrice: _data[4].status === "success" ? parseFloat(formatUnits(_data[4].result, 8)) : 0,
                    endStep: _data[5].status === "success" ? parseInt(_data[5].result) : 0,
                    nextRoundStartTime: _data[6 + roundNumber].status === "success" ? parseInt(_data[6 + roundNumber].result[0]) : 0,
                    tokenBuyAmount: address && _data[6 + tRound].status === "success" ? parseFloat(formatUnits(_data[6 + tRound].result, 18)) : 0,
                    artcTokenBalance: address && _data[7 + tRound].status === "success" ? _data[7 + tRound].result : 0,
                    usdtTokenBalance: address ? parseFloat(formatUnits(_data[8 + tRound].result, 6)) : 0,
                    usdtTokenAllowance: address ? parseFloat(formatUnits(_data[9 + tRound].result, 6)) : 0,
                    ethBalance,
                })
            } catch (error) {
                console.log('useContractStatus err', error)
            }
        };
        fetchData();
        // eslint-disable-next-line
    }, [address, refetch, refresh])

    return data
}
