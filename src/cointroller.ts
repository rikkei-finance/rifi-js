/**
 * @file Cointroller
 * @desc These methods facilitate interactions with the Cointroller smart
 *     contract.
 */

import * as eth from './eth';
import { netId } from './helpers';
import { address, abi, rTokens } from './constants';
import { CallOptions, TrxResponse } from './types';
import { BigNumber } from 'ethers';

/**
 * Enters the user's address into Rifi Protocol markets.
 *
 * @param {any[]} markets An array of strings of markets to enter, meaning use
 *     those supplied assets as collateral.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if
 *     not supressed) and `mint` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the enterMarkets
 *     transaction.
 *
 * @example
 *
 * ```
 * const rifi = new Rifi(window.ethereum);
 *
 * (async function () {
 *   const trx = await rifi.enterMarkets(Rifi.ETH); // Use [] for multiple
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export async function enterMarkets(
  markets: string | string[] = [],
  options: CallOptions = {}
): Promise<TrxResponse> {
  await netId(this);
  const errorPrefix = 'Rifi [enterMarkets] | ';

  if (typeof markets === 'string') {
    markets = [markets];
  }

  if (!Array.isArray(markets)) {
    throw Error(errorPrefix + 'Argument `markets` must be an array or string.');
  }

  const addresses = [];
  for (let i = 0; i < markets.length; i++) {
    if (markets[i][0] !== 'r') {
      markets[i] = 'r' + markets[i];
    }

    if (!rTokens[this._network.name].includes(markets[i])) {
      throw Error(errorPrefix + 'Provided market `' + markets[i] + '` is not a recognized rToken.');
    }

    addresses.push(address[this._network.name][markets[i]]);
  }

  const cointrollerAddress = address[this._network.name].Cointroller;
  const parameters = [addresses];

  const trxOptions: CallOptions = {
    _rifiProvider: this._provider,
    abi: abi.Cointroller,
    ...options
  };

  return eth.trx(cointrollerAddress, 'enterMarkets', parameters, trxOptions);
}

/**
 * Exits the user's address from a Rifi Protocol market.
 *
 * @param {string} market A string of the symbol of the market to exit.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if
 *     not supressed) and `mint` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the exitMarket
 *     transaction.
 *
 * @example
 *
 * ```
 * const rifi = new Rifi(window.ethereum);
 *
 * (async function () {
 *   const trx = await rifi.exitMarket(Rifi.ETH);
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export async function exitMarket(
  market: string,
  options: CallOptions = {}
): Promise<TrxResponse> {
  await netId(this);
  const errorPrefix = 'Rifi [exitMarket] | ';

  if (typeof market !== 'string' || market === '') {
    throw Error(errorPrefix + 'Argument `market` must be a string of a rToken market name.');
  }

  if (market[0] !== 'r') {
    market = 'r' + market;
  }

  if (!rTokens[this._network.name].includes(market)) {
    throw Error(errorPrefix + 'Provided market `' + market + '` is not a recognized rToken.');
  }

  const rTokenAddress = address[this._network.name][market];

  const cointrollerAddress = address[this._network.name].Cointroller;
  const parameters = [rTokenAddress];

  const trxOptions: CallOptions = {
    _rifiProvider: this._provider,
    abi: abi.Cointroller,
    ...options
  };

  return eth.trx(cointrollerAddress, 'exitMarket', parameters, trxOptions);
}


/**
 * Exits the user's address from a Rifi Protocol market.
 *
 * @param {string} market A string of the symbol of the market to exit.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if
 *     not supressed) and `mint` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the exitMarket
 *     transaction.
 *
 * @example
 *
 * ```
 * const rifi = new Rifi(window.ethereum);
 *
 * (async function () {
 *   const trx = await rifi.exitMarket(Rifi.ETH);
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export async function getCollateralFactor(
  market: string,
  options: CallOptions = {}
): Promise<TrxResponse> {
  await netId(this);
  const errorPrefix = 'Rifi [getCollateralFactor] | ';

  if (typeof market !== 'string' || market === '') {
    throw Error(errorPrefix + 'Argument `market` must be a string of a rToken market name.');
  }

  if (market[0] !== 'r') {
    market = 'r' + market;
  }

  if (!rTokens[this._network.name].includes(market)) {
    throw Error(errorPrefix + 'Provided market `' + market + '` is not a recognized rToken.');
  }

  const rTokenAddress = address[this._network.name][market];

  const cointrollerAddress = address[this._network.name].Cointroller;
  const parameters = [rTokenAddress];

  const trxOptions: CallOptions = {
    _rifiProvider: this._provider,
    abi: abi.Cointroller,
    ...options
  };

  return eth.trx(cointrollerAddress, 'markets', parameters, trxOptions);
}

export async function checkMembership(
  accountAddr: string,
  rTokenName: string,
  options: CallOptions = {}
): Promise<TrxResponse> {
  await netId(this);
  const errorPrefix = 'Rifi [checkMembership] | ';

  if (!rTokens[this._network.name].includes(rTokenName)) {
    throw Error(`${errorPrefix}"${rTokenName}" is not a recognized rToken.`);
  }

  const rTokenAddress = address[this._network.name][rTokenName];

  const cointrollerAddress = address[this._network.name].Cointroller;
  const parameters = [accountAddr, rTokenAddress];

  const trxOptions: CallOptions = {
    _rifiProvider: this._provider,
    abi: abi.Cointroller,
    ...options
  };

  return eth.trx(cointrollerAddress, 'checkMembership', parameters, trxOptions);
}

export async function getCloseFactor(options: CallOptions = {}): Promise<any> {
  await netId(this);

  const cointrollerAddress = address[this._network.name].Cointroller;
  const parameters = [];

  const trxOptions: CallOptions = {
    ...options,
    _rifiProvider: this._provider,
    abi: abi.Cointroller,
  };

  const closeFactor: BigNumber = await eth.read(
    cointrollerAddress,
    "closeFactorMantissa",
    parameters,
    trxOptions
  );
  return closeFactor;
}

export async function getLiquidationIncentive(
  options: CallOptions = {}
): Promise<any> {
  await netId(this);

  const cointrollerAddress = address[this._network.name].Cointroller;
  const parameters = [];

  const trxOptions: CallOptions = {
    ...options,
    _rifiProvider: this._provider,
    abi: abi.Cointroller,
  };

  const liquidationIncentive: BigNumber = await eth.read(
    cointrollerAddress,
    "liquidationIncentiveMantissa",
    parameters,
    trxOptions
  );
  return liquidationIncentive;
}
