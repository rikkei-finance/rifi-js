// import { BigNumber } from '@ethersproject/bignumber';
const Rifi = require("../../dist/nodejs/index.js");
// const privateKey = '0xb8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329';
const privateKey =
  "0xacbafc9fbca0575b001c3c57d8967fd2d95ae360c3214091e33dbee9a5e3aa2e";

// const providerUrl = "https://data-seed-prebsc-2-s1.binance.org:8545/";
// const providerUrl = "https://rinkeby.infura.io/v3/598f149bca12438caeb720bdd9aadb09";
// const providerUrl = "https://mainnet.infura.io/v3/598f149bca12438caeb720bdd9aadb09";
// const providerUrl = "https://matic-mumbai.chainstacklabs.com";
// const providerUrl = "https://goerli.infura.io/v3/277345d9b43d4041975344c90edb09b9";
// const providerUrl = "https://polygon-rpc.com/";
const providerUrl = "https://divine-magical-aura.quiknode.pro/b3e070e79f4095189500f1e84e5394173390709b/";
// const addr = "0x2727DC45DC776a70BE546347f296CBFfEBfcA5Af";
const rifi = new Rifi(providerUrl, { privateKey });

const trxOptions = { gasLimit: 250000, mantissa: false };

(async function () {
  const callOptions = {
    // network: 'shibuya'
  };
  let metadata = await rifi.rTokenMetadataAll(callOptions);
  const token = 'rETH';
  metadata = await rifi.getUnderlyingPrice(token);

  // const metadata = await rifi.rTokenMetadata("rUSDC", callOptions);
  // const metadata = await rifi.rTokenMetadata("rUSDT", callOptions);
  // metadata = metadata[0].map(t => {
  //   return {
  //     rToken: t.rToken,
  //     underlyingDecimals: t.underlyingDecimals.toString()
  //   }
  // });
//   console.log("price ", token , " = ", metadata);
  console.log("rTokenMetadataAll = ", metadata);


  // console.log(metadata.allocated.toString());
})().catch(console.error);
