/**
 * @file rToken
 * @desc These methods facilitate interactions with the rToken smart
 *     contracts.
 */

import { ethers } from 'ethers';
import * as eth from './eth';
import { netId } from './helpers';
import {
  constants, address, abi, decimals, underlyings, rTokens
} from './constants';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { CallOptions, TrxResponse } from './types';

/**
 * Supplies the user's Ethereum asset to the Rifi Protocol.
 *
 * @param {string} asset A string of the asset to supply.
 * @param {number | string | BigNumber} amount A string, number, or BigNumber
 *     object of the amount of an asset to supply. Use the `mantissa` boolean in
 *     the `options` parameter to indicate if this value is scaled up (so there
 *     are no decimals) or in its natural scale.
 * @param {boolean} noApprove Explicitly prevent this method from attempting an
 *     ERC-20 `approve` transaction prior to sending the `mint` transaction.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if
 *     not supressed) and `mint` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the supply
 *     transaction.
 *
 * @example
 *
 * ```
 * const rifi = new Rifi(window.ethereum);
 *
 * // Ethers.js overrides are an optional 3rd parameter for `supply`
 * // const trxOptions = { gasLimit: 250000, mantissa: false };
 *
 * (async function() {
 *
 *   console.log('Supplying ETH to the Rifi Protocol...');
 *   const trx = await rifi.supply(Rifi.ETH, 1);
 *   console.log('Ethers.js transaction object', trx);
 *
 * })().catch(console.error);
 * ```
 */
export async function supply(
  asset: string,
  amount: string | number | BigNumber,
  noApprove = false,
  options: CallOptions = {}
): Promise<TrxResponse> {
  await netId(this);
  const errorPrefix = 'Rifi [supply] | ';

  const rTokenName = 'r' + asset;
  const rTokenAddress = address[this._network.name][rTokenName];

  if (!rTokenAddress || !underlyings.includes(asset)) {
    throw Error(errorPrefix + 'Argument `asset` cannot be supplied.');
  }

  if (
    typeof amount !== 'number' &&
    typeof amount !== 'string' &&
    !ethers.BigNumber.isBigNumber(amount)
  ) {
    throw Error(errorPrefix + 'Argument `amount` must be a string, number, or BigNumber.');
  }

  if (!options.mantissa) {
    amount = +amount;
    // amount = amount * Math.pow(10, decimals[asset]);
    amount = ethers.utils.parseUnits(amount.toString(), decimals[asset]);
  }

  amount = ethers.BigNumber.from(amount.toString());

  if (rTokenName === constants.rBNB) {
    options.abi = abi.rBinance;
  } else {
    options.abi = abi.rBep20;
  }

  options._rifiProvider = this._provider;

  if (rTokenName !== constants.rBNB && noApprove !== true) {
    const underlyingAddress = address[this._network.name][asset];
    let userAddress = this._provider.address;

    if (!userAddress && this._provider.getAddress) {
      userAddress = await this._provider.getAddress();
    }

    // Check allowance
    const allowance = await eth.read(
      underlyingAddress,
      'allowance',
      [userAddress, rTokenAddress],
      options
    );

    const notEnough = allowance.lt(amount);

    if (notEnough) {
      // ERC-20 approve transaction
      await eth.trx(
        underlyingAddress,
        'approve',
        [rTokenAddress, amount],
        options
      );
    }
  }

  const parameters = [];
  if (rTokenName === constants.rBNB) {
    options.value = amount;
  } else {
    parameters.push(amount);
  }

  return eth.trx(rTokenAddress, 'mint', parameters, options);
}

/**
 * Redeems the user's Ethereum asset from the Rifi Protocol.
 *
 * @param {string} asset A string of the asset to redeem, or its rToken name.
 * @param {number | string | BigNumber} amount A string, number, or BigNumber
 *     object of the amount of an asset to redeem. Use the `mantissa` boolean in
 *     the `options` parameter to indicate if this value is scaled up (so there
 *     are no decimals) or in its natural scale. This can be an amount of
 *     rTokens or underlying asset (use the `asset` parameter to specify).
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction.
 *
 * @returns {object} Returns an Ethers.js transaction object of the redeem
 *     transaction.
 *
 * @example
 *
 * ```
 * const rifi = new Rifi(window.ethereum);
 *
 * (async function() {
 *
 *   console.log('Redeeming ETH...');
 *   const trx = await rifi.redeem(Rifi.ETH, 1); // also accepts rToken args
 *   console.log('Ethers.js transaction object', trx);
 *
 * })().catch(console.error);
 * ```
 */
export async function redeem(
  asset: string,
  amount: string | number | BigNumber,
  options: CallOptions = {}
): Promise<TrxResponse> {
  await netId(this);
  const errorPrefix = 'Rifi [redeem] | ';

  if (typeof asset !== 'string' || asset.length < 1) {
    throw Error(errorPrefix + 'Argument `asset` must be a non-empty string.');
  }

  const assetIsRToken = asset[0] === 'r';

  const rTokenName = assetIsRToken ? asset : 'r' + asset;
  const rTokenAddress = address[this._network.name][rTokenName];

  const underlyingName = assetIsRToken ? asset.slice(1, asset.length) : asset;

  if (!rTokens.includes(rTokenName) || !underlyings.includes(underlyingName)) {
    throw Error(errorPrefix + 'Argument `asset` is not supported.');
  }

  if (
    typeof amount !== 'number' &&
    typeof amount !== 'string' &&
    !ethers.BigNumber.isBigNumber(amount)
  ) {
    throw Error(errorPrefix + 'Argument `amount` must be a string, number, or BigNumber.');
  }

  if (!options.mantissa) {
    amount = +amount;
    // amount = amount * Math.pow(10, decimals[asset]);
    amount = ethers.utils.parseUnits(amount.toString(), decimals[asset]);
  }

  amount = ethers.BigNumber.from(amount.toString());

  const trxOptions: CallOptions = {
    ...options,
    _rifiProvider: this._provider,
    abi: rTokenName === constants.rBNB ? abi.rBinance : abi.rBep20,
  };
  const parameters = [amount];
  const method = assetIsRToken ? 'redeem' : 'redeemUnderlying';

  return eth.trx(rTokenAddress, method, parameters, trxOptions);
}

/**
 * Borrows an Ethereum asset from the Rifi Protocol for the user. The user's
 *     address must first have supplied collateral and entered a corresponding
 *     market.
 *
 * @param {string} asset A string of the asset to borrow (must be a supported
 *     underlying asset).
 * @param {number | string | BigNumber} amount A string, number, or BigNumber
 *     object of the amount of an asset to borrow. Use the `mantissa` boolean in
 *     the `options` parameter to indicate if this value is scaled up (so there
 *     are no decimals) or in its natural scale.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction.
 *
 * @returns {object} Returns an Ethers.js transaction object of the borrow
 *     transaction.
 *
 * @example
 *
 * ```
 * const rifi = new Rifi(window.ethereum);
 *
 * (async function() {
 *
 *   const daiScaledUp = '32000000000000000000';
 *   const trxOptions = { mantissa: true };
 *
 *   console.log('Borrowing 32 Dai...');
 *   const trx = await rifi.borrow(Rifi.DAI, daiScaledUp, trxOptions);
 *
 *   console.log('Ethers.js transaction object', trx);
 *
 * })().catch(console.error);
 * ```
 */
export async function borrow(
  asset: string,
  amount: string | number | BigNumber,
  options: CallOptions = {}
): Promise<TrxResponse> {
  await netId(this);
  const errorPrefix = 'Rifi [borrow] | ';

  const rTokenName = 'r' + asset;
  const rTokenAddress = address[this._network.name][rTokenName];

  if (!rTokenAddress || !underlyings.includes(asset)) {
    throw Error(errorPrefix + 'Argument `asset` cannot be borrowed.');
  }

  if (
    typeof amount !== 'number' &&
    typeof amount !== 'string' &&
    !ethers.BigNumber.isBigNumber(amount)
  ) {
    throw Error(errorPrefix + 'Argument `amount` must be a string, number, or BigNumber.');
  }

  if (!options.mantissa) {
    amount = +amount;
    // amount = amount * Math.pow(10, decimals[asset]);
    amount = ethers.utils.parseUnits(amount.toString(), decimals[asset]);
  }

  amount = ethers.BigNumber.from(amount.toString());

  const trxOptions: CallOptions = {
    ...options,
    _rifiProvider: this._provider,
  };
  const parameters = [amount];
  trxOptions.abi = rTokenName === constants.rBNB ? abi.rBinance : abi.rBep20;

  return eth.trx(rTokenAddress, 'borrow', parameters, trxOptions);
}

/**
 * Repays a borrowed Ethereum asset for the user or on behalf of another
 *     Ethereum address.
 *
 * @param {string} asset A string of the asset that was borrowed (must be a
 *     supported underlying asset).
 * @param {number | string | BigNumber} amount A string, number, or BigNumber
 *     object of the amount of an asset to borrow. Use the `mantissa` boolean in
 *     the `options` parameter to indicate if this value is scaled up (so there
 *     are no decimals) or in its natural scale.
 * @param {string | null} [borrower] The Ethereum address of the borrower to
 *     repay an open borrow for. Set this to `null` if the user is repaying
 *     their own borrow.
 * @param {boolean} noApprove Explicitly prevent this method from attempting an
 *     ERC-20 `approve` transaction prior to sending the subsequent repayment
 *     transaction.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if
 *     not supressed) and `repayBorrow` or `repayBorrowBehalf` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the repayBorrow
 *     or repayBorrowBehalf transaction.
 *
 * @example
 *
 * ```
 * const rifi = new Rifi(window.ethereum);
 *
 * (async function() {
 *
 *   console.log('Repaying Dai borrow...');
 *   const address = null; // set this to any address to repayBorrowBehalf
 *   const trx = await rifi.repayBorrow(Rifi.DAI, 32, address);
 *
 *   console.log('Ethers.js transaction object', trx);
 *
 * })().catch(console.error);
 * ```
 */
export async function repayBorrow(
  asset: string,
  amount: string | number | BigNumber,
  borrower: string,
  noApprove = false,
  options: CallOptions = {}
): Promise<TrxResponse> {
  await netId(this);
  const errorPrefix = 'Rifi [repayBorrow] | ';

  const rTokenName = 'r' + asset;
  const rTokenAddress = address[this._network.name][rTokenName];

  if (!rTokenAddress || !underlyings.includes(asset)) {
    throw Error(errorPrefix + 'Argument `asset` is not supported.');
  }

  let contractAddress = rTokenAddress;

  if (
    typeof amount !== 'number' &&
    typeof amount !== 'string' &&
    !ethers.BigNumber.isBigNumber(amount)
  ) {
    throw Error(errorPrefix + 'Argument `amount` must be a string, number, or BigNumber.');
  }

  let method = ethers.utils.isAddress(borrower) ? 'repayBorrowBehalf' : 'repayBorrow';
  if (borrower && method === 'repayBorrow') {
    throw Error(errorPrefix + 'Invalid `borrower` address.');
  }

  if (!options.mantissa) {
    amount = +amount;
    // amount = amount * Math.pow(10, decimals[asset]);
    amount = ethers.utils.parseUnits(amount.toString(), decimals[asset]);
  }

  if (options.maxRepay === true) {
    if (rTokenName === constants.rBNB) {
      amount = +amount * 1.01;
      amount = ethers.utils.parseUnits(amount.toString(), decimals[asset]);
      contractAddress = address[this._network.name]['Maximillion'];
      method = 'repayBehalf';
    } else {
      amount = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    }
  }

  amount = ethers.BigNumber.from(amount.toString());
  const trxOptions: CallOptions = {
    ...options,
    _rifiProvider: this._provider,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parameters: any[] = method.indexOf('Behalf') !== -1 ? [borrower] : [];
  if (rTokenName === constants.rBNB) {
    trxOptions.value = amount;
    trxOptions.abi = options.maxRepay ? abi.Maximillion : abi.rBinance;
  } else {
    parameters.push(amount);
    trxOptions.abi = abi.rBep20;
  }

  if (rTokenName !== constants.rBNB && noApprove !== true) {
    const underlyingAddress = address[this._network.name][asset];
    const userAddress = this._provider.address;

    // Check allowance
    const allowance = await eth.read(
      underlyingAddress,
      'allowance',
      [userAddress, rTokenAddress],
      trxOptions
    );

    const notEnough = allowance.lt(amount);

    if (notEnough) {
      // ERC-20 approve transaction
      await eth.trx(
        underlyingAddress,
        'approve',
        [rTokenAddress, amount],
        trxOptions
      );
    }
  }

  return eth.trx(contractAddress, method, parameters, trxOptions);
}

const READ_FUNCTIONS = [
  'borrowRatePerBlock',
  'exchangeRateStored',
  'getCash',
  'supplyRatePerBlock',
  'totalBorrows',
  'totalReserves',
  'totalSupply',
];

/**
 * Supplies the user's Ethereum asset to the Rifi Protocol.
 *
 * @param {string} asset A string of the asset to supply.
 * @param {number | string | BigNumber} amount A string, number, or BigNumber
 *     object of the amount of an asset to supply. Use the `mantissa` boolean in
 *     the `options` parameter to indicate if this value is scaled up (so there
 *     are no decimals) or in its natural scale.
 * @param {boolean} noApprove Explicitly prevent this method from attempting an
 *     ERC-20 `approve` transaction prior to sending the `mint` transaction.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if
 *     not supressed) and `mint` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the supply
 *     transaction.
 *
 * @example
 *
 * ```
 * const rifi = new Rifi(window.ethereum);
 *
 * // Ethers.js overrides are an optional 3rd parameter for `supply`
 * // const trxOptions = { gasLimit: 250000, mantissa: false };
 *
 * (async function() {
 *
 *   console.log('Supplying ETH to the Rifi Protocol...');
 *   const trx = await rifi.supply(Rifi.ETH, 1);
 *   console.log('Ethers.js transaction object', trx);
 *
 * })().catch(console.error);
 * ```
 */

export async function tokenRead(
  func: string,
  rTokenName: string,
  parameters = [],
  options: CallOptions = {}
): Promise<TrxResponse> {
  const errorPrefix = 'Rifi [tokenRead] | ';

  if (READ_FUNCTIONS.indexOf(func) === -1) {
    throw Error(`${errorPrefix}Invalid function name.`);
  }

  await netId(this);

  const rTokenAddress = address[this._network.name][rTokenName];

  if (!rTokenAddress || rTokenName[0] !== 'r') {
    throw Error(`${errorPrefix}Cannot call ${func} on "${rTokenName}".`);
  }

  if (rTokenName === constants.rBNB) {
    options.abi = abi.rBinance;
  } else {
    options.abi = abi.rBep20;
  }

  options._rifiProvider = this._provider;

  return eth.trx(rTokenAddress, func, parameters, options);
}

export async function getBalanceOf(
  rTokenName: string,
  accountAddr: string,
  options: CallOptions = {}
): Promise<TrxResponse> {
  await netId(this);
  const errorPrefix = 'Rifi [getBalanceOf] | ';

  const rTokenAddress = address[this._network.name][rTokenName];

  if (!rTokenAddress || rTokenName[0] !== 'r') {
    throw Error(`${errorPrefix}Cannot get balance on "${rTokenName}".`);
  }

  if (rTokenName === constants.rBNB) {
    options.abi = abi.rBinance;
  } else {
    options.abi = abi.rBep20;
  }

  options._rifiProvider = this._provider;

  return eth.trx(rTokenAddress, 'balanceOf', [accountAddr], options);
}

export async function getBorrowBalanceOf(
  rTokenName: string,
  accountAddr: string,
  options: CallOptions = {}
): Promise<TrxResponse> {
  await netId(this);
  const errorPrefix = 'Rifi [getBalanceOf] | ';

  const rTokenAddress = address[this._network.name][rTokenName];

  if (!rTokenAddress || rTokenName[0] !== 'r') {
    throw Error(`${errorPrefix}Cannot get balance on "${rTokenName}".`);
  }

  if (rTokenName === constants.rBNB) {
    options.abi = abi.rBinance;
  } else {
    options.abi = abi.rBep20;
  }

  options._rifiProvider = this._provider;

  return eth.trx(rTokenAddress, 'borrowBalanceStored', [accountAddr], options);
}