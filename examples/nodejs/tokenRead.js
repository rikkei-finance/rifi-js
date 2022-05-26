// import { BigNumber } from '@ethersproject/bignumber';
const Rifi = require("../../dist/nodejs/index.js");
// const privateKey = '0xb8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329';
const privateKey =
  "0xacbafc9fbca0575b001c3c57d8967fd2d95ae360c3214091e33dbee9a5e3aa2e";

// const providerUrl = "https://data-seed-prebsc-2-s1.binance.org:8545/";
// const providerUrl = "https://rinkeby.infura.io/v3/598f149bca12438caeb720bdd9aadb09";
// const providerUrl = "https://mainnet.infura.io/v3/598f149bca12438caeb720bdd9aadb09";
const providerUrl = "https://evm.shibuya.astar.network";
const addr = "0x9AAD6f9eA2D7910CCAF17c9D1A6f7863251f194a";
const rifi = new Rifi(providerUrl);

const trxOptions = { gasLimit: 250000, mantissa: false };

(async function () {
  const callOptions = {
    network: 'shibuya'
  };
  // const metadata = await rifi.rTokenMetadataAll(callOptions);
  const metadata = await rifi.getUnderlyingPrice('rASTR');

  // const metadata = await rifi.rTokenMetadata("rUSDC", callOptions);
  // const metadata = await rifi.rTokenMetadata("rUSDT", callOptions);
  console.log("Ethers.js transaction object", metadata);

  // console.log(metadata.allocated.toString());
})().catch(console.error);
