import { mainnet, sepolia } from "wagmi/chains"

const MODE = 0
const chain = MODE ? mainnet : sepolia

const contracts_mainnet = { 
  Main: "0x4850083F98885C7750f89C1F599d3a95b118a7f0",
};

const contracts_testnet = { 
  Main: '0x928E6b8f7e896fA7004B01ED862659770269eF5A'
};

const Config = {
  siteTitle: "ArtemisCoin",
  social: {
    twitter: "https://twitter.com/BepeOnBASE",
    telegram: "https://telegram.com/BepeOnBASE",
  },
  description: "",
  REFETCH_INTERVAL: 10000,
  PUBLIC_URL: 'https://artemisecoin.io/',
  API_URL: '',
  PROJECT: 'artc',
  ACTION: true,
  CHAIN: chain,
  ETH_PRICE_API: "https://api.etherscan.io/api?module=stats&action=ethprice&apikey=3TEWVV2EK19S1Y6SV8EECZAGQ7W3362RCN",
  DEFAULT_GAS: 0.001,
  MAX_UINT256: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
  token: {
    name: "ArtemisCoin",
    address: '0x2a3654FDCc17a176985DEAA41adeeB912d35bB3F',
    symbol: "ARTC",
    decimal: 18,
    price: 1000000,
    priceDecimal: 100000000
  },
  PRESALE_CONTRACT: MODE ? contracts_mainnet : contracts_testnet,
  USDT_CONTRACT: "0xc5202476Ce8Eb084080B68db639241DfA29946c4",
  TOTAL_STEPS: 25
};

export default Config