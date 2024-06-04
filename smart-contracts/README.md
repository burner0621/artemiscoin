# RocketPulse Smart Contracts

1. Setup Environment

```bash
npm install
```

2. Config .env file
```text
Please copy a MNEMONIC phrases of your deploy wallet.

For example:
MNEMONIC = 'test test test test test test test test test test test junk'
```

3. Compile & Deploy & Verify

```bash
npm run deploy
```

4. Check address and update frontend config
```output
> rocketpulse-smart-contacts@3.0.0 deploy
> hardhat run scripts/deployICO.js --network pulsemainnet

deploying...
hardhat init...
Compiled 289 Solidity files successfully
hardhat init OK
RocketPulseRPLSToken deploying...
RocketPulseRPLSToken deploy submitted
RocketPulseRPLSToken deploy OK
RocketPulseRPLSToken decimals is  18
RocketPulseICO deploying...
RocketPulseICO deploy submitted
RocketPulseICO deploy OK
RocketPulse Addresses
RocketPulseRPLSToken deployed to 0xB6A8571961a0B22a955E2a934AD0e798d6f23596 # This is RPLS_TOKEN_ADDRESS
RocketPulseICO deployed to 0x4850083F98885C7750f89C1F599d3a95b118a7f0 # This is ICO_CONTRACT_ADDRESS
deployed
...
```
