import env from './env';

export default {
  ...env,
  NULL_ADDRESS: '0x0000000000000000000000000000000000000000',
  TRANSFER_TOPIC: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  PUNK_TRANSFER_TOPIC: '0x05af636b70da6819000c49f85b21fa82081c632069bb626f30932034099107d8',
  LAST_BLOCK_KEY: `${env.S3_BUCKET_FOLDER}/last_block.txt`,
  PUNK_ADDRESS: env.CHAIN === 'mainnet'
    ? '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb' // CryptoPunks contract address on mainnet
    : '0x36aca719211384627c22aaba17b6ed013cc144ca', // CryptoPunks contract address on goerli
  WRAPPED_PUNK_ADDRESS: env.CHAIN === 'mainnet'
    ? '0xb7f7f6c52f2e2fdb1963eab30438024864c313f6' // WrappedPunks contract address on mainnet
    : '0x33b8adfdf4ddc3ee3c239d5e0cb511bb5fb647d4', // WrappedPunks contract address on goerli
  PUNK_DATA_KEY: `${env.S3_BUCKET_FOLDER}/crypto-punks.json`,
  PUNK_OWNER_DATA_KEY: `${env.S3_BUCKET_FOLDER}/crypto-punks-info.json`,
  WRAPPED_PUNK_DATA_KEY: `${env.S3_BUCKET_FOLDER}/wrapped-punks.json`,
  COMMAND_KEY: `${env.S3_BUCKET_FOLDER}/command.txt`,
  FETCH_BLOCK_INTERVAL: Number(env.FETCH_BLOCK_INTERVAL),
  PERSIST_DATA_INTERVAL: Number(env.PERSIST_DATA_INTERVAL),
  LAST_BLOCK_NUM: Number(env.LAST_BLOCK_NUM),
};
