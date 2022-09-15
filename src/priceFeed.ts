/**
 * @file Price Feed
 * @desc These methods facilitate interactions with the Open Price Feed smart
 *     contracts.
 */

import * as eth from './eth';
import { netId } from './helpers';
import {
  constants, address, abi, rTokens, underlyings, decimals, opfAssets, decimalNetwork
} from './constants';
import { CallOptions } from './types';

function validateAsset(
  asset: string,
  argument: string,
  errorPrefix: string
): (boolean | string | number)[] {
  if (typeof asset !== 'string' || asset.length < 1) {
    throw Error(errorPrefix + 'Argument `' + argument + '` must be a non-empty string.');
  }

  const assetIsRToken = asset[0] === 'r';

  const rTokenName = assetIsRToken ? asset : 'r' + asset;
  const rTokenAddress = address[this._network.name][rTokenName];

  let underlyingName = assetIsRToken ? asset.slice(1, asset.length) : asset;
  const underlyingAddress = address[this._network.name][underlyingName];

  if (
    (!rTokens[this._network.name].includes(rTokenName) || !underlyings.includes(underlyingName)) &&
    !opfAssets.includes(underlyingName)
  ) {
    throw Error(errorPrefix + 'Argument `' + argument + '` is not supported.');
  }

  const underlyingDecimals = decimalNetwork[this._network.name] ? decimalNetwork[this._network.name][underlyingName] : decimals[underlyingName];

  // The open price feed reveals BTC, not WBTC.
  underlyingName = underlyingName === 'WBTC' ? 'BTC' : underlyingName;

  return [assetIsRToken, rTokenName, rTokenAddress, underlyingName, underlyingAddress, underlyingDecimals];
}

async function rTokenExchangeRate(
  rTokenAddress: string,
  rTokenName: string,
  underlyingDecimals: number
): Promise<number> {
  const address = rTokenAddress;
  const method = 'exchangeRateCurrent';
  const options = {
    _rifiProvider: this._provider,
    abi: rTokenName === constants.rBNB || rTokenName === constants.rASTR || rTokenName === constants.rMATIC || rTokenName === constants.rETH ? abi.rBinance : abi.rBep20,
  };
  const exchangeRateCurrent = await eth.read(address, method, [], options);
  const mantissa = 18 + underlyingDecimals - 8; // rToken always 8 decimals
  const oneRTokenInUnderlying = exchangeRateCurrent / Math.pow(10, mantissa);

  return oneRTokenInUnderlying;
}

/**
 * Gets an asset's price from the Rifi Protocol open price feed. The price
 *    of the asset can be returned in any other supported asset value, including
 *    all rTokens and underlyings.
 *
 * @param {string} asset A string of a supported asset in which to find the
 *     current price.
 * @param {string} [inAsset] A string of a supported asset in which to express
 *     the `asset` parameter's price. This defaults to USD.
 *
 * @returns {string} Returns a string of the numeric value of the asset.
 *
 * @example
 * ```
 * const rifi = new Rifi(window.ethereum);
 * let price;
 *
 * (async function () {
 *
 *   price = await rifi.getPrice(Rifi.WBTC);
 *   console.log('WBTC in USD', price); // 6 decimals, see Open Price Feed docs
 *
 *   price = await rifi.getPrice(Rifi.BAT, Rifi.USDC); // supports rTokens too
 *   console.log('BAT in USDC', price);
 *
 * })().catch(console.error);
 * ```
 */
export async function getPrice(
  asset: string,
  inAsset: string = constants.BUSD
): Promise<number> {
  await netId(this);
  const errorPrefix = 'Rifi [getPrice] | ';

  const [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    assetIsRToken, rTokenName, rTokenAddress, underlyingName, underlyingAddress, underlyingDecimals
  ] = validateAsset.bind(this)(asset, 'asset', errorPrefix);

  const [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    inAssetIsRToken, inAssetRTokenName, inAssetRTokenAddress, inAssetUnderlyingName, inAssetUnderlyingAddress, inAssetUnderlyingDecimals
  ] = validateAsset.bind(this)(inAsset, 'inAsset', errorPrefix);

  const priceFeedAddress = address[this._network.name].PriceFeed;
  const trxOptions: CallOptions = {
    _rifiProvider: this._provider,
    abi: abi.PriceFeed,
  };

  const assetUnderlyingPrice = await eth.read(priceFeedAddress, 'price', [underlyingName], trxOptions);
  const inAssetUnderlyingPrice = await eth.read(priceFeedAddress, 'price', [inAssetUnderlyingName], trxOptions);

  let assetRTokensInUnderlying, inAssetRTokensInUnderlying;

  if (assetIsRToken) {
    assetRTokensInUnderlying = await rTokenExchangeRate.bind(this)(rTokenAddress, rTokenName, underlyingDecimals);
  }

  if (inAssetIsRToken) {
    inAssetRTokensInUnderlying = await rTokenExchangeRate.bind(this)(inAssetRTokenAddress, inAssetRTokenName, inAssetUnderlyingDecimals);
  }

  let result;
  if (!assetIsRToken && !inAssetIsRToken) {
    result = assetUnderlyingPrice / inAssetUnderlyingPrice;
  } else if (assetIsRToken && !inAssetIsRToken) {
    const assetInOther = assetUnderlyingPrice / inAssetUnderlyingPrice;
    result = assetInOther * assetRTokensInUnderlying;
  } else if (!assetIsRToken && inAssetIsRToken) {
    const assetInOther = assetUnderlyingPrice / inAssetUnderlyingPrice;
    result = assetInOther / inAssetRTokensInUnderlying;
  } else {
    const assetInOther = assetUnderlyingPrice / inAssetUnderlyingPrice;
    const rTokensInUnderlying = assetInOther / assetRTokensInUnderlying;
    result = inAssetRTokensInUnderlying * rTokensInUnderlying;
  }

  return result;
}

const NETID_PRICE_FORMULA2 = [
  81,
  592,
  5,
  80001
];

export async function getUnderlyingPrice(
  asset: string
): Promise<number> {
  await netId(this);
  const errorPrefix = 'Rifi [getUnderlyingPrice] | ';

  const [
    , , rTokenAddress, , , underlyingDecimals
  ] = validateAsset.bind(this)(asset, 'asset', errorPrefix);

  const priceFeedAddress = address[this._network.name].PriceFeed;
  const trxOptions: CallOptions = {
    _rifiProvider: this._provider,
    abi: abi.PriceFeed,
  };

  const assetUnderlyingPrice = await eth.read(priceFeedAddress, 'getUnderlyingPrice', [rTokenAddress], trxOptions);

  if (NETID_PRICE_FORMULA2.indexOf(this._network.id) > -1) {
    return assetUnderlyingPrice / (10 ** (26 - underlyingDecimals));
  }

  return assetUnderlyingPrice * 10 ** -parseInt(underlyingDecimals);
}
