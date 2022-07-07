/**
 * @file RifiLens
 * @desc These methods facilitate interactions with the RifiLens smart contract.
 */

import * as eth from './eth';
import { netId } from './helpers';
import { address, abi, rTokens } from './constants';
import {
  CallOptions,
} from './types';
import { BigNumber } from 'ethers';

const LENS_FUNCTIONS = [
  'rTokenMetadata',
  'rTokenMetadataAll',
  'rTokenBalances',
  'rTokenBalancesAll',
  'rTokenUnderlyingPrice',
  'rTokenUnderlyingPriceAll',
  'getAccountLimits',
];

/**
 * Get the amount of RIFI tokens accrued but not yet claimed by an address.
 *
 * @param {string} _address The address in which to find the RIFI accrued.
 * @param {Provider | string} [_provider] An Ethers.js provider or valid network
 *     name string.
 *
 * @returns {string} Returns a string of the numeric accruement of RIFI. The
 *     value is scaled up by 18 decimal places.
 *
 * @example
 *
 * ```
 * (async function () {
 *   const acc = await Rifi.comp.getRifiAccrued('0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5');
 *   console.log('Accrued', acc);
 * })().catch(console.error);
 * ```
 */
async function readLens(
  func: string,
  parameters = [],
  options: CallOptions = {}
) {
  await netId(this);

  const errorPrefix = 'Rifi [readLens] | ';

  if (LENS_FUNCTIONS.indexOf(func) === -1) {
    throw Error(`${errorPrefix}Invalid function name.`);
  }

  const lensAddress = address[this._network.name].RifiLens;
  const trxOptions: CallOptions = {
    _rifiProvider: this._provider,
    abi: abi.RifiLens,
    ...options,
  };

  return eth.read(lensAddress, func, parameters, trxOptions);
}

interface TokenMetadata {
  rToken: string,
  exchangeRateCurrent: BigNumber,
  supplyRatePerBlock: BigNumber,
  borrowRatePerBlock: BigNumber,
  reserveFactorMantissa: BigNumber,
  totalBorrows: BigNumber,
  totalReserves: BigNumber,
  totalSupply: BigNumber,
  totalCash: BigNumber,
  isListed: boolean,
  collateralFactorMantissa: BigNumber,
  underlyingAssetAddress: string,
  rTokenDecimals: BigNumber,
  underlyingDecimals: BigNumber,
}

interface TokenMetadataAll {
  rTokens: TokenMetadata[],
  blockNumber: BigNumber,
  blockTimestamp: BigNumber,
}

export async function rTokenMetadataAll(options: CallOptions = {}): Promise<TokenMetadataAll> {
  await netId(this);
  const rTokenAddresses = rTokens[this._network.name].map(token => address[this._network.name][token]);

  return readLens.apply(this, ['rTokenMetadataAll', [rTokenAddresses], options]);
}

export async function rTokenMetadata(rTokenName: string, options: CallOptions = {}): Promise<TokenMetadata> {
  await netId(this);
  const errorPrefix = 'Rifi [supply] | ';
  const rTokenAddress = address[this._network.name][rTokenName];

  if (rTokenName[0] !== 'r' || !rTokenAddress) {
    throw Error(errorPrefix + 'Argument `rTokenName` is not a rToken.');
  }

  return readLens.apply(this, ['rTokenMetadata', [rTokenAddress], options]);
}

export async function rTokenBalancesAll(account: string, options: CallOptions = {}): Promise<TokenMetadataAll> {
  await netId(this);
  const rTokenAddresses = rTokens[this._network.name].map(token => address[this._network.name][token]);

  return readLens.apply(this, ['rTokenBalancesAll', [rTokenAddresses, account], options]);
}