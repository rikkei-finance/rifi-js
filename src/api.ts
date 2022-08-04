/**
 * @file API
 * @desc These methods facilitate HTTP requests to the Rifi API.
 */

import { request } from './util';
import {
  APIRequest,
  APIResponse,
  AccountServiceRequest,
  RTokenServiceRequest,
  MarketHistoryServiceRequest,
  GovernanceServiceRequest,
} from './types';

import {
  address,
  rTokens,
  decimalNetwork,
  names,
} from './constants';

// import { version } from '../package.json';

// let userPlatform;

// try {
//   if (typeof document !== 'undefined') {
//     userPlatform = 'web';
//   } else if (
//     typeof navigator !== 'undefined' &&
//     navigator.product === 'ReactNative'
//   ) {
//     userPlatform = 'react-native';
//   } else if (
//     typeof navigator !== 'undefined' &&
//     navigator.userAgent.toLowerCase().indexOf('electron') > -1
//   ) {
//     userPlatform = 'electron-js';
//   } else {
//     userPlatform = 'node-js';
//   }
// } catch (e) {
//   userPlatform = 'unknown';
// }

/**
 * Makes a request to the AccountService API. The Account API retrieves
 *     information for various accounts which have interacted with the protocol.
 *     For more details, see the Rifi API documentation.
 *
 * @param {object} options A JavaScript object of API request parameters.
 *
 * @returns {object} Returns the HTTP response body or error.
 *
 * @example
 *
 * ```
 * (async function() {
 *   const account = await Rifi.api.account({
 *     "addresses": "0xB61C5971d9c0472befceFfbE662555B78284c307",
 *     "network": "ropsten"
 *   });
 *
 *   let daiBorrowBalance = 0;
 *   if (Object.isExtensible(account) && account.accounts) {
 *     account.accounts.forEach((acc) => {
 *       acc.tokens.forEach((tok) => {
 *         if (tok.symbol === Rifi.rDAI) {
 *           daiBorrowBalance = +tok.borrow_balance_underlying.value;
 *         }
 *       });
 *     });
 *   }
 *
 *   console.log('daiBorrowBalance', daiBorrowBalance);
 * })().catch(console.error);
 * ```
 */
export function account(options: AccountServiceRequest): Promise<APIResponse> {
  return queryApi(options, 'account', '/api/v2/account');
}

/**
 * Makes a request to the RTokenService API. The rToken API retrieves
 *     information about rToken contract interaction. For more details, see the
 *     Rifi API documentation.
 *
 * @param {object} options A JavaScript object of API request parameters.
 *
 * @returns {object} Returns the HTTP response body or error.
 *
 * @example
 *
 * ```
 * (async function() {
 *   const cDaiData = await Rifi.api.rToken({
 *     "addresses": Rifi.util.getAddress(Rifi.rDAI)
 *   });
 *
 *   console.log('cDaiData', cDaiData); // JavaScript Object
 * })().catch(console.error);
 * ```
 */
export function rToken(options: RTokenServiceRequest): Promise<APIResponse> {
  return queryApi(options, 'rToken', '/api/v2/rtoken');
}

/**
 * Makes a request to the MarketHistoryService API. The market history service
 *     retrieves information about a market. For more details, see the Rifi
 *     API documentation.
 *
 * @param {object} options A JavaScript object of API request parameters.
 *
 * @returns {object} Returns the HTTP response body or error.
 *
 * @example
 *
 * ```
 * (async function() {
 *   const cUsdcMarketData = await Rifi.api.marketHistory({
 *     "asset": Rifi.util.getAddress(Rifi.rUSDC),
 *     "min_block_timestamp": 1559339900,
 *     "max_block_timestamp": 1598320674,
 *     "num_buckets": 10,
 *   });
 *
 *   console.log('cUsdcMarketData', cUsdcMarketData); // JavaScript Object
 * })().catch(console.error);
 * ```
 */
export function marketHistory(options: MarketHistoryServiceRequest): Promise<APIResponse> {
  return queryApi(options, 'Market History', '/api/v2/market_history/graph');
}

/**
 * Makes a request to the GovernanceService API. The Governance Service includes
 *     three endpoints to retrieve information about RIFI accounts. For more
 *     details, see the Rifi API documentation.
 *
 * @param {object} options A JavaScript object of API request parameters.
 * @param {string} endpoint A string of the name of the corresponding governance
 *     service endpoint. Valid values are `proposals`, `voteReceipts`, or
 *     `accounts`.
 *
 * @returns {object} Returns the HTTP response body or error.
 *
 * @example
 *
 * ```
 * (async function() {
 *   const proposal = await Rifi.api.governance(
 *     { "proposal_ids": [ 20 ] }, 'proposals'
 *   );
 *
 *   console.log('proposal', proposal); // JavaScript Object
 * })().catch(console.error);
 * ```
 */
export function governance(options: GovernanceServiceRequest, endpoint: string): Promise<APIResponse> {
  if (endpoint === 'proposals') {
    endpoint = '/api/v2/governance/proposals';
  } else if (endpoint === 'voteReceipts') {
    endpoint = '/api/v2/governance/proposal_vote_receipts';
  } else {
    endpoint = '/api/v2/governance/accounts';
  }

  return queryApi(options, 'GovernanceService', endpoint);
}

function queryApi(options: APIRequest, name: string, path: string): Promise<APIResponse> {
  return new Promise((resolve, reject) => {
    const errorPrefix = `Rifi [api] [${name}] | `;
    let responseCode, responseMessage;

    request({
      hostname: 'https://api.rifi.finance',
      path,
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        // 'rifi-js': `[${version}]_[${userPlatform}]`,
      },
      body: options
    }).then((response) => {
      responseCode = response.status;
      responseMessage = response.statusText;

      const responseBody = JSON.parse(response.body);

      if (responseCode >= 200 && responseCode <= 299) {
        resolve(responseBody);
      } else {
        throw 'Invalid request made to the Rifi API.';
      }
    }).catch((error) => {
      let errorMessage = '';

      if (error.name === 'SyntaxError') {
        errorMessage = errorPrefix + `Unable to parse response body.`;
      } else {
        errorMessage = errorPrefix + error.toString();
      }

      reject({ error: errorMessage, responseCode, responseMessage });
    });
  });
}

interface SupportedTokens {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rToken: any[];
}

export async function getSupportTokens(network: string): Promise<SupportedTokens> {
  const tokens = {
    rToken: [],
  };

  if (!rTokens[network]) return tokens;

  rTokens[network].forEach(symbol => {
    const uSymbol = symbol.substring(1);

    const token = {
      borrow_cap: { value: '0' },
      borrow_rate: { value: '0' },
      cash: { value: '0' },
      collateral_factor: { value: '0' },
      comp_borrow_apy: null,
      comp_supply_apy: null,
      exchange_rate: { value: '0' },
      interest_rate_model_address: '0x',
      name: names[symbol],
      number_of_borrowers: 0,
      number_of_suppliers: 0,
      reserve_factor: { value: '0', },
      reserves: { value: '0', },
      supply_rate: { value: '0', },
      symbol,
      token_address: address[network][symbol],
      total_borrows: { value: '0' },
      total_supply: { value: '0' },
      decimals: decimalNetwork[network] ? (decimalNetwork[network][symbol]) || 8 : 8,
      underlying_address: address[network][uSymbol] ? address[network][uSymbol] : null,
      underlying_name: names[uSymbol],
      underlying_decimals: decimalNetwork[network] ? (decimalNetwork[network][uSymbol] || 18) : 18,
      underlying_price: { value: '1' },
      underlying_symbol: uSymbol,
    };
    tokens.rToken.push(token);
  });

  return tokens;
}
