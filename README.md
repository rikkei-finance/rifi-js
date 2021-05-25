# Rifi.js

[![Build Status](https://github.com/rikkei-finance/rifi-js/workflows/Build/badge.svg)](https://github.com/rikkei-finance/rifi-js/actions)
[![codecov](https://codecov.io/gh/rikkei-finance/rifi-js/branch/master/graph/badge.svg?token=85IDEVM3U0)](https://codecov.io/gh/rikkei-finance/rifi-js)

A JavaScript SDK for Ethereum and the Rifi Protocol. Wraps around [Ethers.js](https://github.com/ethers-io/ethers.js/). Works in the **web browser** and **Node.js**.

[Rifi.js Documentation](https://rifi.finance/docs/rifi-js)

This SDK is in **open beta**, and is constantly under development. **USE AT YOUR OWN RISK**.

## Ethereum Read & Write

JSON RPC based Ethereum **read** and **write**.

### Read

```js
const Rifi = require('@rikkei-finance/rifi-js'); // in Node.js
const cUsdtAddress = Rifi.util.getAddress(Rifi.rUSDT);

(async function() {

  let supplyRatePerBlock = await Rifi.eth.read(
    cUsdtAddress,
    'function supplyRatePerBlock() returns (uint)',
    [], // [optional] parameters
    {}  // [optional] call options, provider, network, ethers.js "overrides"
  );

  console.log('USDT supplyRatePerBlock:', supplyRatePerBlock.toString());

})().catch(console.error);
```

### Write

```js
const toAddress = '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A';

(async function() {

  const trx = await Rifi.eth.trx(
    toAddress,
    'function send() external payable',
    [],
    {
      value: Rifi._ethers.utils.parseEther('1.0'), // 1 ETH
      provider: window.ethereum, // in a web browser
    }
  );

  const toAddressEthBalance = await Rifi.eth.getBalance(toAddress);

})().catch(console.error);
```

## Rifi Protocol

Simple methods for using the Rifi protocol.

```js
const rifi = new Rifi(window.ethereum); // in a web browser

// Ethers.js overrides are an optional 3rd parameter for `supply`
// const trxOptions = { gasLimit: 250000, mantissa: false };

(async function() {

  console.log('Supplying ETH to the Rifi protocol...');
  const trx = await rifi.supply(Rifi.ETH, 1);
  console.log('Ethers.js transaction object', trx);

})().catch(console.error);
```

## Install / Import

Web Browser

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@rikkei-finance/rifi-js@latest/dist/browser/rifi.min.js"></script>

<script type="text/javascript">
  window.Rifi; // or `Rifi`
</script>
```

Node.js

```
npm install @rikkei-finance/rifi-js
```

```js
const Rifi = require('@rikkei-finance/rifi-js');

// or, when using ES6

import Rifi from '@rikkei-finance/rifi-js';
```

## More Code Examples

- [Node.js](https://github.com/rikkei-finance/rifi-js/tree/master/examples)
- [Web Browser](https://rikkei-finance.github.io/rifi-js/examples/web/)

[To run, boot Ganache fork of mainnet locally](https://github.com/rikkei-finance/rifi-js/tree/master/examples)

## Instance Creation

The following are valid Ethereum providers for initialization of the SDK.

```js
var rifi = new Rifi(window.ethereum); // web browser

var rifi = new Rifi('http://127.0.0.1:8545'); // HTTP provider

var rifi = new Rifi(); // Uses Ethers.js fallback mainnet (for testing only)

var rifi = new Rifi('ropsten'); // Uses Ethers.js fallback (for testing only)

// Init with private key (server side)
var rifi = new Rifi('https://mainnet.infura.io/v3/_your_project_id_', {
  privateKey: '0x_your_private_key_', // preferably with environment variable
});

// Init with HD mnemonic (server side)
var rifi = new Rifi('mainnet' {
  mnemonic: 'clutch captain shoe...', // preferably with environment variable
});
```

## Constants and Contract Addresses

Names of contracts, their addresses, ABIs, token decimals, and more can be found in `/src/constants.ts`. Addresses, for all networks, can be easily fetched using the `getAddress` function, combined with contract name constants.

```js
console.log(Rifi.DAI, Rifi.ETH, Rifi.rETH);
// DAI, ETH, rETH

const cUsdtAddress = Rifi.util.getAddress(Rifi.rUSDT);
// Mainnet rUSDT address. Second parameter can be a network like 'ropsten'.
```

## Mantissas

Parameters of number values can be plain numbers or their scaled up mantissa values. There is a transaction option boolean to tell the SDK what the developer is passing.

```js
// 1 Dai
await rifi.borrow(Rifi.DAI, '1000000000000000000', { mantissa: true });

// `mantissa` defaults to false if it is not specified or if an options object is not passed
await rifi.borrow(Rifi.DAI, 1, { mantissa: false });
```

## Transaction Options

Each method that interacts with the blockchain accepts a final optional parameter for overrides, much like [Ethers.js overrides](https://docs.ethers.io/ethers.js/v5-beta/api-contract.html#overrides).
```js
// The options object itself and all options are optional
const trxOptions = {
  mantissa,   // Boolean, parameters array arg of 1 ETH would be '1000000000000000000' (true) vs 1 (false)
  abi,        // Definition string or an ABI array from a solc build
  provider,   // JSON RPC string, Web3 object, or Ethers.js fallback network (string)
  network,    // Ethers.js fallback network provider, "provider" has precedence over "network"
  from,       // Address that the Ethereum transaction is send from
  gasPrice,   // Ethers.js override `Rifi._ethers.utils.parseUnits('10.0', 'gwei')`
  gasLimit,   // Ethers.js override - see https://docs.ethers.io/ethers.js/v5-beta/api-contract.html#overrides
  value,      // Number or string
  data,       // Number or string
  chainId,    // Number
  nonce,      // Number
  privateKey, // String, meant to be used with `Rifi.eth.trx` (server side)
  mnemonic,   // String, meant to be used with `Rifi.eth.trx` (server side)
};
```

## API

The [Rifi API](https://rifi.finance/docs/api) is accessible from Rifi.js. The corresponding services are defined in the `api` namespace on the class.

- `Rifi.api.account`
- `Rifi.api.rToken`
- `Rifi.api.marketHistory`
- `Rifi.api.governance`

The governance method requires a second parameter (string) for the corresponding endpoint shown in the [documentation](https://rifi.finance/docs/api#GovernanceService).

- `proposals`
- `voteReceipts`
- `accounts`

Here is an example for using the `account` endpoint. The `network` parameter in the request body is optional and defaults to `mainnet`.

```js
const main = async () => {
  const account = await Rifi.api.account({
    "addresses": "0xB61C5971d9c0472befceFfbE662555B78284c307",
    "network": "ropsten"
  });

  let daiBorrowBalance = 0;
  if (Object.isExtensible(account) && account.accounts) {
    account.accounts.forEach((acc) => {
      acc.tokens.forEach((tok) => {
        if (tok.symbol === Rifi.rDAI) {
          daiBorrowBalance = +tok.borrow_balance_underlying.value;
        }
      });
    });
  }

  console.log('daiBorrowBalance', daiBorrowBalance);
}

main().catch(console.error);
```

## Build for Node.js & Web Browser

```
git clone git@github.com:rikkei-finance/rifi-js.git
cd rifi-js/
npm install
npm run build
```

### Web Browser Build
```html
<!-- Local build (do `npm install` first) -->
<script type="text/javascript" src="./dist/browser/rifi.min.js"></script>

<!-- Public NPM -> jsdeliver build -->
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@rikkei-finance/rifi-js@latest/dist/browser/rifi.min.js"></script>
```

### Node.js Build
```js
// Local build (do `npm install` first)
const Rifi = require('./dist/nodejs/index.js');

// Public NPM build
const Rifi = require('@rikkei-finance/rifi-js');
```
