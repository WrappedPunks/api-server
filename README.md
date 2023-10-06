This work is licensed under a [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/legalcode.en)

# WrappedPunks Api [![CI](https://github.com/WrappedPunks/api-server/actions/workflows/ci.yaml/badge.svg?branch=develop)](https://github.com/WrappedPunks/api-server/actions/workflows/ci.yaml)

- [Requirements](#requirements)
- [Setup](#setup)
- [Setup monitor](#setup-monitor)
- [Start server in dev mode (live reload)](#start-server-in-dev-mode-live-reload)

## Requirements

- Node.js 16.17 LTS (For Node.js version management use [n](https://github.com/tj/n) or [nvm](https://github.com/nvm-sh/nvm))
- NPM 8+
- An Alchemy account

## Setup
- `git clone git@github.com:WrappedPunks/api-server.git`
- `cd api-server`
- `nvm use 16.17` or `n` (and select 16.17)
- `npm install`

## Setup monitor
- Define the environment variables `CHAIN` and `ALCHEMY_API_KEY`
- Execute the following command to fetch the latest owners of CryptoPunks:

  ```bash
  npx ts-node ./src/scripts/fetch-punks-owner.ts
  ```
- Execute the following command to fetch the latest owners of WrappedPunks:

  ```bash
  npx ts-node ./src/scripts/fetch-wrapped-punks.ts
  ```
- Upload the contents of either the `src/scripts/mainnet` or `src/scripts/testnet` folder to an S3 bucket
- Update the S3 bucket name and directory name in the environment variables

## Start server in dev mode (live reload)
- `npm start`

## TODO
- Add tests
  - API tests
  - Monitor tests
