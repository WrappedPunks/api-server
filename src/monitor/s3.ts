import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import Decimal from 'decimal.js';
import { CryptoPunk, CryptoPunkAttribute, WrappedPunk } from './interface';
import logger from './logger';
import constants from './constants';

const {
  AWS_REGION,
  AWS_ENDPOINT,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
} = process.env;


const {
  COMMAND_KEY,
  LAST_BLOCK_KEY,
  LAST_BLOCK_NUM,
  PUNK_OWNER_DATA_KEY,
  WRAPPED_PUNK_DATA_KEY,
  S3_BUCKET_NAME,
} = constants;

const client = new S3Client({
  ...AWS_REGION && { region: AWS_REGION },
  ...AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && {
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  },
  ...AWS_ENDPOINT && { endpoint: AWS_ENDPOINT },
  forcePathStyle: true,
});

export async function getLastBlock(): Promise<number> {
  try {
    const numStr = await getS3Object(LAST_BLOCK_KEY);
    const lastBlockFromS3 = new Decimal(numStr).toNumber();
    logger.info(`Last block from S3: ${lastBlockFromS3}`);

    if (LAST_BLOCK_NUM) {
      const lastBlockFromEnv = new Decimal(LAST_BLOCK_NUM).toNumber();
      logger.info(`Last block from env: ${lastBlockFromEnv}`);

      if (lastBlockFromS3 > lastBlockFromEnv) {
        logger.info(`Using last block from S3: ${lastBlockFromS3}`);
        return lastBlockFromS3;
      }

      logger.info(`Using last block from env: ${lastBlockFromEnv}`);
      return lastBlockFromEnv;
    }

    return lastBlockFromS3;
  } catch (err) {
    if (LAST_BLOCK_NUM) {
      return new Decimal(LAST_BLOCK_NUM).toNumber();
    }

    throw new Error('Either LAST_BLOCK_KEY or LAST_BLOCK_NUM must be set');
  }
}

export async function getCryptoPunks(): Promise<CryptoPunk[]> {
  try {
    logger.info(`Fetching punks from S3`);
    const jsonStr = await getS3Object('data/compact-crypto-punks.json');
    const infoDataStr = await getS3Object(PUNK_OWNER_DATA_KEY);

    const allPunkAttributes = JSON.parse(jsonStr) as CryptoPunkAttribute[][];
    const infoData = JSON.parse(infoDataStr) as { owner: string, lastUpdated: string }[];

    return allPunkAttributes.map((attributes, index) => {
      const info = infoData[index];
      if (info) {
        return {
          attributes,
          ...info.owner && { owner: info.owner.toLowerCase() },
          ...info.lastUpdated && { lastUpdated: new Date(info.lastUpdated) },
        };
      }

      return {
        attributes,
      };
    });
  } catch (err) {
    logger.error(err);

    return [];
  }
}

export async function getWrappedPunks(): Promise<WrappedPunk[]> {
  try {
    const jsonStr = await getS3Object(WRAPPED_PUNK_DATA_KEY);
    return JSON.parse(jsonStr);
  } catch (err) {
    return [];
  }
}

export async function saveLastBlock(lastBlock: number) {
  logger.info(`Saving last block: ${lastBlock}`);

  await putS3Object(LAST_BLOCK_KEY, lastBlock.toString());
}

export async function saveWrappedPunks(punks: WrappedPunk[]): Promise<void> {
  logger.info(`Saving ${punks.length} wrapped punks`);

  await putS3Object(
    WRAPPED_PUNK_DATA_KEY,
    JSON.stringify(punks),
  );
}

export async function saveCryptoPunkOwners(
  punkOwner: Record<number, object>,
): Promise<void> {
  await putS3Object(
    PUNK_OWNER_DATA_KEY,
    JSON.stringify(punkOwner),
  );
}

export async function getCommands(): Promise<string[]> {
  const str = await getS3Object(COMMAND_KEY);

  const commands = str.split('\n').filter((s) => s);
  return commands;
}

async function getS3Object(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
  });

  const response = await client.send(command);
  return response.Body!.transformToString();
};

async function putS3Object(
  key: string,
  body: string,
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: body,
  });

  await client.send(command);
}
