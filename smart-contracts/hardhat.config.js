// Support truffle-style test setup
require("@nomicfoundation/hardhat-toolbox");
require('@nomiclabs/hardhat-truffle5');
require('dotenv').config();

// Importing babel to be able to use ES6 imports
require('@babel/register')({
    presets: [
        ['@babel/preset-env', {
            'targets': {
                'node': '16',
            },
        }],
    ],
    only: [/test|scripts/],
    retainLines: true,
});
require('@babel/polyfill');

// Config from environment
const privateKey = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [
            {
                version: '0.7.6',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 15000,
                    },
                },
            },
            {
                version: '0.8.20',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ]
    },
    networks: {
        hardhat: {},
        localhost: {
            host: '127.0.0.1',
            port: 8545,
            network_id: '*',
        },
        ethereum: {
            url: 'https://ethereum-rpc.publicnode.com',
            accounts: [privateKey],
            chainId: 1,
            gasPrice: 25000000000,
        },
        sepolia: {
            url: 'https://eth-sepolia.g.alchemy.com/v2/U4t2cileeDuuwvAKAOJeZHMxVhjF3cMI',
            accounts: [privateKey],
            chainId: 11155111,
            gasPrice: 200000000000,
        }
    },
    paths: {
        sources: './contracts',
        cache: './cache',
        artifacts: './artifacts',
    },
    mocha: {
        timeout: 0,
    },
    etherscan: {
        apiKey: {
            sepolia: "FAQHXR8Q49UY22ZRVPCNQFTMI5IBV8Z5XT",
            ethereum: "FAQHXR8Q49UY22ZRVPCNQFTMI5IBV8Z5XT",
        },
        customChains: [
            {
                network: "sepolia",
                chainId: 11155111,
                urls: {
                  apiURL: "https://eth-sepolia.blockscout.com/api",  // https://eth-sepolia.blockscout.com/api  https://api-sepolia.etherscan.io/api
                  browserURL: "https://sepolia.etherscan.io/"
                }
            },
            {
                network: "ethereum",
                chainId: 1,
                urls: {
                  apiURL: "https://api.etherscan.io/api",
                  browserURL: "https://etherscan.io/"
                }
            }
        ]
    },
};
