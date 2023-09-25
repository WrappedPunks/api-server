import * as Alchemy from './alchemy';
import * as utils from './utils';
import logger from './logger';
import { Data } from './data';
import constants from './constants';

const {
  PUNK_ADDRESS,
  TRANSFER_TOPIC,
  PUNK_TRANSFER_TOPIC,
  FETCH_BLOCK_INTERVAL,
  WRAPPED_PUNK_ADDRESS,
} = constants;

export class Monitor {
  private data: Data;
  private static instance: Monitor;

  private constructor(data: Data) {
    this.data = data;
    this.monitor();
  }

  public static async getInstance(): Promise<Monitor> {
    if (!Monitor.instance) {
      const data = await Data.getInstance();
      Monitor.instance = new Monitor(data);
    }

    return Monitor.instance;
  }

  private async parseBlock(fromBlock: number, toBlock: number) {
    logger.info(`Getting logs from block ${fromBlock} to ${toBlock}`);
    const transferLogs = await Alchemy.getLogs(
      fromBlock,
      toBlock,
      [PUNK_ADDRESS, WRAPPED_PUNK_ADDRESS],
      [[TRANSFER_TOPIC, PUNK_TRANSFER_TOPIC]],
    );

    for (const log of transferLogs) {
      const { topic, from, to, tokenId, address, blockNumber } = log;

      if (address === PUNK_ADDRESS) {
        logger.info(`[${blockNumber}] Transfer crypto punk #${tokenId} from ${from} to ${to}`);
        this.data.updatePunkOwner(tokenId, to);
      } else if (topic === TRANSFER_TOPIC && address === WRAPPED_PUNK_ADDRESS) {
        logger.info(`[${blockNumber}] Transfer wrapped punk #${tokenId} from ${from} to ${to}`);
        this.data.updateWPunkOwner(tokenId, to);
      }
    }
  }

  private async monitor() {
    const chainId = await Alchemy.getChainId();
    logger.info(`Connected to chainId ${chainId}`);

    for (; ;) {
      const latestBlock = await Alchemy.getLatestBlock();

      if (latestBlock <= this.data.lastBlock) {
        await utils.sleep(FETCH_BLOCK_INTERVAL);
        continue;
      }

      const nextLastBlock = Math.min(this.data.lastBlock + 1000, latestBlock);
      await this.parseBlock(this.data.lastBlock + 1, nextLastBlock);

      this.data.lastBlock = nextLastBlock;
    }
  }
}
