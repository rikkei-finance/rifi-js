const Rifi = require("../../dist/nodejs/index.js");
// const privateKey = '0xb8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329';
const privateKey =
  "0xacbafc9fbca0575b001c3c57d8967fd2d95ae360c3214091e33dbee9a5e3aa2e";

const providerUrl = "https://data-seed-prebsc-1-s1.binance.org:8545/";
const addr = "0x9AAD6f9eA2D7910CCAF17c9D1A6f7863251f194a";
const rifi = new Rifi(providerUrl, { privateKey });

const trxOptions = { gasLimit: 250000, mantissa: false };

(async function () {
  const callOptions = {
    // gasLimit: 1234567,
  }
  const metadata = await rifi.rTokenMetadataAll(callOptions);
  // const metadata = await rifi.rTokenMetadata("rBNB", callOptions);
  console.log("Ethers.js transaction object", metadata);
})().catch(console.error);
