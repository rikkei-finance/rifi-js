/**
 * @file Utility
 * @desc These methods are helpers for the Rifi class.
 */

import { address, abi, constants } from "./constants";
import { AbiType } from "./types";
import { BigNumber, ethers } from "ethers";

/* eslint-disable */

let _request: any;
let http: any;
let https: any;
function _nodeJsRequest(options: any) {
  return new Promise<any>((resolve, reject) => {
    let url = options.url || options.hostname;

    // Use 'https' if the protocol is not specified in 'options.hostname'
    if (url.indexOf("http://") !== 0 && url.indexOf("https://") !== 0) {
      url = "https://" + url;
    }

    // Choose the right module based on the protocol in 'options.hostname'
    const httpOrHttps = url.indexOf("http://") === 0 ? http : https;

    // Remove the 'http://' so the native node.js module will understand
    options.hostname = url.split("://")[1];

    let body = "";
    const req = httpOrHttps.request(options, (res: any) => {
      res.on("data", (bodyBuffer: any) => {
        body += bodyBuffer.toString();
      });
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          body,
        });
      });
    });

    req.on("timeout", () => {
      req.abort();
      return reject({
        status: 408,
        statusText: "Client HTTP request timeout limit reached.",
      });
    });

    req.on("error", (err: any) => {
      if (req.aborted) return;

      if (err !== null && err.toString() === "[object Object]") {
        console.error(JSON.stringify(err));
      } else {
        console.error(err);
      }

      return reject();
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

function _webBrowserRequest(options: any) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let contentTypeIsSet = false;
    options = options || {};
    const method = options.method || "GET";
    let url = options.url || options.hostname;
    url += typeof options.path === "string" ? options.path : "";

    if (typeof url !== "string") {
      return reject("HTTP Request: Invalid URL.");
    }

    // Use 'https' if the protocol is not specified in 'options.hostname'
    if (url.indexOf("http://") !== 0 && url.indexOf("https://") !== 0) {
      url = "https://" + url;
    }

    xhr.open(method, url);

    for (const header in options.headers) {
      if ({}.hasOwnProperty.call(options.headers, header)) {
        const lcHeader = header.toLowerCase();
        contentTypeIsSet =
          lcHeader === "content-type" ? true : contentTypeIsSet;
        xhr.setRequestHeader(header, options.headers[header]);
      }
    }

    if (!contentTypeIsSet) {
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    }

    xhr.onload = function () {
      let body;
      if (xhr.status >= 100 && xhr.status < 400) {
        try {
          JSON.parse(xhr.response);
          body = xhr.response;
        } catch (e) {
          body = xhr.statusText;
        }

        return resolve({
          status: xhr.status,
          statusText: xhr.statusText,
          body,
        });
      } else {
        return reject({
          status: xhr.status,
          statusText: xhr.statusText,
        });
      }
    };

    if (method !== "GET") {
      xhr.send(JSON.stringify(options.body));
    } else {
      xhr.send();
    }
  });
}

try {
  window;
  _request = _webBrowserRequest;
} catch (e) {
  http = require("http");
  https = require("https");
  _request = _nodeJsRequest;
}

/**
 * A generic HTTP request method that works in Node.js and the Web Browser.
 *
 * @param {object} options HTTP request options. See Node.js http.request
 *     documentation for details.
 *
 * @hidden
 *
 * @returns {Promise<object>} Returns a promise and eventually an HTTP response
 *     (JavaScript object).
 */
export function request(options: any): Promise<any> {
  return _request.apply(null, [options]);
}

/* eslint-enable */

/**
 * Gets the contract address of the named contract. This method supports
 *     contracts used by the Rifi Protocol.
 *
 * @param {string} contract The name of the contract.
 * @param {string} [network] Optional name of the Ethereum network. Main net and
 *     all the popular public test nets are supported.
 *
 * @returns {string} Returns the address of the contract.
 *
 * @example
 * ```
 * console.log('rETH Address: ', Rifi.util.getAddress(Rifi.rETH));
 * ```
 */
export function getAddress(contract: string, network = "mainnet"): string {
  return address[network][contract];
}

/**
 * Gets a contract ABI as a JavaScript array. This method supports
 *     contracts used by the Rifi Protocol.
 *
 * @param {string} contract The name of the contract.
 *
 * @returns {Array} Returns the ABI of the contract as a JavaScript array.
 *
 * @example
 * ```
 * console.log('rETH ABI: ', Rifi.util.getAbi('rBinance'));
 * ```
 */
export function getAbi(contract: string): AbiType[] {
  return abi[contract];
}

/**
 * Gets the name of an Ethereum network based on its chain ID.
 *
 * @param {string} chainId The chain ID of the network.
 *
 * @returns {string} Returns the name of the Ethereum network.
 *
 * @example
 * ```
 * console.log('Ropsten : ', Rifi.util.getNetNameWithChainId(3));
 * ```
 */
export function getNetNameWithChainId(chainId: number): string {
  const networks = {
    56: 'bsc_mainnet',
    97: 'bsc_testnet',
    1: 'mainnet',
    3: 'ropsten',
    4: 'rinkeby',
    5: 'goerli',
    42: 'kovan',
    592: 'astar_mainnet',
    81: 'shibuya',
    80001: 'mumbai',
    137: 'polygon'
  };
  return networks[chainId] || 'bsc_mainnet';
}

export function parseUnits(value: number, decimals: number): BigNumber {
  const fixedAmout = (+value || 0).toFixed(decimals + 1);
  return ethers.utils.parseUnits(
    fixedAmout.substring(0, fixedAmout.length - 1),
    decimals
  );
}

export function isNativeCoin(rTokenName: string, _this: {_network: { name: string}}): boolean {
  if (
    (rTokenName === constants.rBNB && (_this._network.name === "bsc_mainnet" || _this._network.name === "bsc_testnet"))
    || (rTokenName === constants.rASTR && (_this._network.name === "astar_mainnet" || _this._network.name === "shibuya"))
    || (rTokenName === constants.rMATIC && (_this._network.name === "polygon" || _this._network.name === "mumbai"))
    || (rTokenName === constants.rETH && (_this._network.name === "mainnet" || _this._network.name === "goerli" || _this._network.name === "rinkeby"))
  ) {
    return true;
  }
  return false;
}
