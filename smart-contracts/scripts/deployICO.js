// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const hreconfig = require("@nomicsfoundations/hardhat-config")
const { USDT_ADDRESS, START_TIME, INITIAL_PRICE } = require("../config");
require('dotenv').config();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const verifyContract = async (address, constructorArguments) => {
  try {
    await hre.run('verify:verify', {
      address,
      constructorArguments
    })
  } catch (error) {
    console.log("verify error =======>", error)
  }
}

async function main() {
  try {
    console.log('deploying...')
    console.log('hardhat init...')
    // const retVal = await hreconfig.hreInit(hre)
    // if (!retVal) {
    //   console.log('hardhat init error!');
    //   return false;
    // }
    await hre.run('clean')
    await hre.run('compile')
    console.log('hardhat init OK')

    const networkName = hre.network.name;
    console.log ("networkName: ", networkName)
    const usdtAddress = USDT_ADDRESS[networkName]
    console.log ("USDT Token Address: ", usdtAddress)
    console.log ("The start time: ", START_TIME)
    console.log ("The initial price: ", INITIAL_PRICE)

    console.log('$ARTC Token deploying...')
    const artcTokenFactory = await hre.ethers.getContractFactory("ArtemisCoin");
    const artcTokenContract = await artcTokenFactory.deploy();
    console.log('ARTCToken deploy submitted')

    await artcTokenContract.deployed();
    console.log('ARTCToken deploy OK', artcTokenContract.address)
    const decimals = await artcTokenContract.decimals();
    console.log('ARTCToken decimals is ', decimals.toString())

    await verifyContract(
      artcTokenContract.address,
      []
    )

    console.log('artcTokenContract verify OK')

    console.log('ARTCPresale deploying...')
    const artcPresaleFactory = await hre.ethers.getContractFactory("ARTCPresale");
    const artcPresaleContract = await artcPresaleFactory.deploy(artcTokenContract.address, usdtAddress, START_TIME, INITIAL_PRICE);

    await artcPresaleContract.deployed();

    console.log ("ARTCPresale contract deployed OK!", artcPresaleContract.address)

    await verifyContract(
      artcPresaleContract.address,
      [artcTokenContract.address, usdtAddress, START_TIME, INITIAL_PRICE]
    )

    console.log('artcPresaleContract verify OK')
  } catch (error) {
    console.log('hardhat try catch', error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
