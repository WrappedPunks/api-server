import { cleanEnv, str, email, json } from 'envalid'

const env = cleanEnv(process.env, {
  IMAGES_DOMAIN: str(),
  S3_BUCKET_NAME: str(),
  S3_BUCKET_FOLDER: str(),
  ALCHEMY_API_KEY: str(),
  LAST_BLOCK_NUM: str(), // This is only use when last block is not found in S3
  CHAIN: str({ choices: ['mainnet', 'testnet']}),
  PERSIST_DATA_INTERVAL: str({ default: '100000' }),
  FETCH_BLOCK_INTERVAL: str({ default: '1000' }),
  PUNK_IMAGE_URL: str(),
});

export default env;
