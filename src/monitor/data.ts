import { CryptoPunk, WrappedPunk } from './interface';
import * as S3 from './s3';
import constants from './constants';
import logger from './logger';

const { PERSIST_DATA_INTERVAL, NULL_ADDRESS, IMAGES_DOMAIN } = constants;

export class Data {
  private static instance: Data;
  private _punkImageUrl: string = constants.PUNK_IMAGE_URL;
  private _lastBlock: number = 0;
  private _punks: CryptoPunk[] = [];
  private _punkIdsByAddress: Record<string, number[]> = {};
  public _wPunks: WrappedPunk[] = [];
  private _wPunkIdsByAddress: Record<string, number[]> = {};
  private _lastCommand: string | undefined;

  private formatPunkData(id: number) {
    return {
      ...this._punks[id],
      id,
      imageUrl: `${this._punkImageUrl}/${id}.svg`,
    }
  }

  private formatWPunkData(id: number) {
    const punk = this._punks[id];

    return {
      ...this._punks[id],
      id,
      imageUrl: `${IMAGES_DOMAIN}/images/punks/${id}.png`
    }
  }

  public get punks() {
    return this._punks.map((_, id) => this.formatPunkData(id));
  }

  public get lastBlock(): number {
    return this._lastBlock;
  }

  public set lastBlock(lastBlock: number) {
    this._lastBlock = lastBlock;
  }

  public getPunkById(id: string | number) {
    const wPunk = this._wPunks.find((wPunk) => Number(wPunk.id) === Number(id));

    return {
      ...this.formatPunkData(Number(id)),
      isWrapped: false,
      ...wPunk && wPunk.owner !== NULL_ADDRESS && {
        isWrapped: true,
        wPunkOwner: wPunk.owner,
      }
    }
  }

  public getPunksByAddress(address: string) {
    return this._punkIdsByAddress[address]?.map((id) => this.getPunkById(id));
  }

  public updatePunkOwner(id: string | number, newOwner: string) {
    const oldOwner = this._punks[Number(id)].owner;
    if (oldOwner) {
      this._punkIdsByAddress[oldOwner] = this._punkIdsByAddress[oldOwner].filter((punkId) => punkId !== Number(id));
    }
    this._punkIdsByAddress[newOwner] = this._punkIdsByAddress[newOwner] || [];
    this._punkIdsByAddress[newOwner].push(Number(id));
    this._punks[Number(id)].owner = newOwner;
    this._punks[Number(id)].lastUpdated = new Date();
  }

  public get wPunks() {
    return this._wPunks.map((wPunk) => ({
      ...this.formatWPunkData(Number(wPunk.id)),
      ...wPunk,
    }));
  }

  public getWPunkById(id: string | number): CryptoPunk | undefined {
    const wPunk = this._wPunks.find((wPunk) => Number(wPunk.id) === Number(id));
    if (!wPunk) {
      return undefined;
    }

    return {
      ...this.formatWPunkData(Number(wPunk.id)),
      ...this._wPunks.find((wPunk) => Number(wPunk.id) === Number(id))
    };
  }

  public getWPunksByAddress(address: string) {
    return this._wPunkIdsByAddress[address]?.map((id) => ({
      ...this.formatWPunkData(Number(id)),
      ...this._wPunks.find((wPunk) => Number(wPunk.id) === Number(id))
    }));
  };

  public updateWPunkOwner(id: string | number, newOwner: string) {
    const oldOwner = this._wPunks.find((wPunk) => Number(wPunk.id) === Number(id))?.owner;
    if (oldOwner) {
      this._wPunkIdsByAddress[oldOwner] = this._wPunkIdsByAddress[oldOwner].filter((wPunkId) => wPunkId !== Number(id));
    }
    this._wPunkIdsByAddress[newOwner] = this._wPunkIdsByAddress[newOwner] || [];
    this._wPunkIdsByAddress[newOwner].push(Number(id));

    const wPunks = this._wPunks.find((wPunk) => Number(wPunk.id) === Number(id));
    if (!wPunks) {
      this._wPunks.push({
        id: String(id),
        owner: newOwner,
      });

      this._wPunks = this._wPunks.sort((a, b) => Number(a.id) - Number(b.id));
    } else {
      const index = this._wPunks.findIndex((wPunk) => Number(wPunk.id) === Number(id));
      this._wPunks[index].owner = newOwner;
    }
  }

  private async persistDataToS3() {
    const commands = await S3.getCommands();
    logger.info(`Command from S3: ${commands}`);
    const command = commands[0];

    if (command === 'stop') {
      logger.info('Stop persisting data to S3');
      this._lastCommand = command;
      return;
    }

    if (!command && this._lastCommand === 'stop') {
      logger.info('Reload data from S3');
      await this.loadData();
      return;
    }

    if (this._lastBlock) {
      logger.info(`Persisting data to S3 at block ${this._lastBlock}`);

      const infoData = this._punks.map((punk) => ({
        ...punk.owner && { owner: punk.owner },
        ...punk.lastUpdated && { lastUpdated: punk.lastUpdated },
      }));

      await Promise.all([
        S3.saveWrappedPunks(this._wPunks),
        S3.saveLastBlock(this._lastBlock),
        S3.saveCryptoPunkOwners(infoData),
      ]);
    }
  }

  private periodicallyPersistDataToS3() {
    setTimeout(async () => {
      await this.persistDataToS3();

      this.periodicallyPersistDataToS3();
    }, PERSIST_DATA_INTERVAL);
  }

  private async loadData() {
    const [punks, wPunks] = await Promise.all([
      S3.getCryptoPunks(),
      S3.getWrappedPunks(),
    ]);

    this._punks = punks;
    this._punkIdsByAddress = punks.reduce(
      (acc, punk, index) => {
        if (!punk.owner) {
          return acc;
        }

        acc[punk.owner] = acc[punk.owner] || [];
        acc[punk.owner].push(index);

        return acc;
      },
      {} as Record<string, number[]>,
    );

    this._wPunks = wPunks;
    this._wPunkIdsByAddress = wPunks.reduce(
      (acc, wPunk) => {
        acc[wPunk.owner] = acc[wPunk.owner] || [];
        acc[wPunk.owner].push(Number(wPunk.id));

        return acc;
      },
      {} as Record<string, number[]>,
    );

    this._lastBlock = await S3.getLastBlock();
    if (!this._lastBlock) {
      throw new Error('Cannot load last block from S3 or env. Please check');
    }
  }

  public static async getInstance(): Promise<Data> {
    if (!Data.instance) {
      Data.instance = new Data();
      await Data.instance.loadData();
      Data.instance.periodicallyPersistDataToS3();
    }

    return Data.instance;
  }
}
