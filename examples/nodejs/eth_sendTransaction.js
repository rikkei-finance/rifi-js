/**
 * Example of calling JSON RPC's eth_sendTransaction with Rifi.js
 *
 * Run ganache-cli in another command line window before running this script. Be
 *     sure to fork mainnet.

ganache-cli \
  -f https://mainnet.infura.io/v3/_YOUR_INFURA_ID_ \
  -m "clutch captain shoe salt awake harvest setup primary inmate ugly among become" \
  -i 1

 */

const Rifi = require('../../dist/nodejs/index.js');

const oneEthInWei = '1000000000000000000';
const cEthAddress = Rifi.util.getAddress(Rifi.rETH);
const provider = 'http://localhost:8545';
const privateKey = '0xb8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329';
// const mnemonic = 'clutch captain shoe salt awake harvest setup primary inmate ugly among become';

(async function() {
  console.log('Supplying ETH to the Rifi Protocol...');

  // Mint some rETH by supplying ETH to the Rifi Protocol
  const trx = await Rifi.eth.trx(
    cEthAddress,
    'function mint() payable',
    [],
    {
      provider,
      gasLimit: 250000,
      value: oneEthInWei,
      privateKey,
      // mnemonic,
    }
  );

  // const result = await trx.wait(1); // JSON object of trx info, once mined

  console.log('Ethers.js transaction object', trx);
})().catch(console.error);
