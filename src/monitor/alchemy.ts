import Decimal from 'decimal.js';
import { TransferLog, WrappedPunk } from './interface';
import fetch from 'node-fetch';
import constants from './constants';


const { ALCHEMY_API_KEY, WRAPPED_PUNK_ADDRESS, TRANSFER_TOPIC } = constants;
const API_KEY = ALCHEMY_API_KEY;
const CHAIN = constants.CHAIN === 'mainnet' ? 'mainnet' : 'goerli';

async function callRpc(params: Record<string, any>) {
  const url = `https://eth-${CHAIN}.g.alchemy.com/v2/${API_KEY}`

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      ...params,
    }),
  });

  if (!resp.ok) {
    const error = await resp.text();
    throw new Error(`Request failed: ${error}`);
  }

  return resp.json();
}

export async function getChainId() {
  const resp = await callRpc({
    method: 'eth_chainId',
  });

  const { result } = resp;

  return new Decimal(result).toNumber();
}

async function getNft(additionalUrl: string) {
  const url = `https://eth-${CHAIN}.g.alchemy.com/nft/v3/${API_KEY}/getNFTMetadata?${additionalUrl}`;

  const resp = await fetch(url);

  if (!resp.ok) {
    const error = await resp.text();
    throw new Error(`Request failed: ${error}`);
  }

  return resp.json();
}

export async function getWrappedPunkMetadata(
  tokenId: string
): Promise<WrappedPunk | undefined> {
  const resp = await getNft(`contractAddress=${WRAPPED_PUNK_ADDRESS}&tokenId=${tokenId}`);

  if (!resp.tokenUri) return undefined;

  return {
    id: resp.tokenId,
    owner: '',
  }
}

export async function getLatestBlock(): Promise<number> {
  const resp = await callRpc({
    method: 'eth_blockNumber',
  });

  const { result } = resp;

  return new Decimal(result).toNumber();
}

export async function getTransactionReceipt(txHash: string) {
  const resp = await callRpc({
    method: 'eth_getTransactionReceipt',
    params: [txHash],
  });

  const { result } = resp;

  return result;
}

export async function getLogs(
  fromBlock: number,
  toBlock: number,
  address?: string[],
  topics?: string[][] | string[],
): Promise<TransferLog[]> {
  const resp = await callRpc({
    method: 'eth_getLogs',
    params: [{
      fromBlock: new Decimal(fromBlock).toHex(),
      toBlock: new Decimal(toBlock).toHex(),
      address,
      topics,
    }]
  });

  const { result } = resp;

  return result.reduce((acc: TransferLog[], log: any) => {
    const { data, topics, address, blockNumber: blockNumberHex } = log;

    const blockNumber = new Decimal(blockNumberHex).toNumber();

    if (topics && topics.length === 4) {
      const [topic, from, to, tokenId] = topics;

      return [
        ...acc,
        {
          topic,
          blockNumber,
          to: `0x${to.slice(-40)}`,
          from: `0x${from.slice(-40)}`,
          address,
          tokenId: new Decimal(tokenId).toFixed(),
        }
      ]
    } else {
      const [topic, from, to] = topics;

      if (topic === TRANSFER_TOPIC) {
        return acc;
      }

      return [
        ...acc,
        {
          topic,
          blockNumber,
          to: `0x${to.slice(-40)}`,
          from: `0x${from.slice(-40)}`,
          address: address,
          tokenId: new Decimal(data).toFixed(),
        }
      ]
    }
  }, []);
}
