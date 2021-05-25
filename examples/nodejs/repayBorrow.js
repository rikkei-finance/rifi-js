/**
 * Example of supplying ETH to the Rifi protocol with Rifi.js
 *
 * Run ganache-cli in another command line window before running this script. Be
 *     sure to fork mainnet.

ganache-cli \
  -f https://mainnet.infura.io/v3/_YOUR_INFURA_ID_ \
  -m "clutch captain shoe salt awake harvest setup primary inmate ugly among become" \
  -i 1

 */

const Rifi = require('../../dist/nodejs/index.js');

const myAddress = '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A';
const privateKey = '0xb8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329';

const provider = 'http://localhost:8545';
const rifi = new Rifi(provider, { privateKey });

const getDaiBalance = (address) => {
  const daiAddress = Rifi.util.getAddress(Rifi.DAI);
  return Rifi.eth.read(
    daiAddress,
    'function balanceOf(address) returns (uint256)',
    [ address ],
    { provider }
  );
};

(async function() {

  let myDaiBalance = await getDaiBalance(myAddress);
  console.log(`My Dai Balance: ${ (myDaiBalance / 1e18).toString() }`);

  console.log('Supplying 10 ETH...');
  const trx1 = await rifi.supply(Rifi.ETH, 10);

  console.log('Entering ETH market (use as collateral)...');
  const trx2 = await rifi.enterMarkets(Rifi.ETH);

  console.log('Borrowing Dai against ETH...');
  const trx3 = await rifi.borrow(Rifi.DAI, 32, { gasLimit: 500000 });

  myDaiBalance = await getDaiBalance(myAddress);
  console.log(`My Dai Balance: ${ (myDaiBalance / 1e18).toString() }`);

  console.log('Repaying Dai borrow...');
  const address = null; // set this to any address to repayBorrowBehalf
  const trx4 = await rifi.repayBorrow(Rifi.DAI, 32, address, { gasLimit: 500000 });

  myDaiBalance = await getDaiBalance(myAddress);
  console.log(`My Dai Balance: ${ (myDaiBalance / 1e18).toString() }`);

})().catch(console.error);
