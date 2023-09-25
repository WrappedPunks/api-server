import { promises as fs } from 'fs';
import { resolve } from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const chain = process.env.CHAIN; // mainnet
if (!chain) throw new Error('Missing chain');

const apiKey = process.env.ALCHEMY_API_KEY;
if (!apiKey) throw new Error('Missing ALCHEMY_API_KEY');

const url = `https://eth-${chain === 'testnet' ? 'goerli' : 'mainnet'}.g.alchemy.com/nft/v3/${apiKey}`;
const punkContract = chain === 'testnet'
  ? '0x36aca719211384627c22aaba17b6ed013cc144ca' // CryptoPunks contract address on goerli
  : '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb'; // CryptoPunks contract address on mainnet

async function getOwnersForContract(): Promise<any[]> {
  const callUrl = `${url}/getOwnersForContract?contractAddress=${punkContract}`;
  const res = await fetch(callUrl);

  if (!res.ok) throw new Error(`Failed to call Alchemy API: ${(await res.text())}`);

  const json = await res.json();
  return json.owners.map((owner: any) => owner.toLowerCase());
}

async function getNFTsForOwner(owner: string): Promise<any[]> {
  const callUrl = `${url}/getNFTsForOwner?contractAddresses[]=${punkContract}&owner=${owner}`;
  let nextPage = undefined;
  let allNFTs: any[] = [];

  do {
    const res = await fetch(`${callUrl}${nextPage ? `&pageKey=${nextPage}` : ''}`);
    if (!res.ok) throw new Error(`Failed to call Alchemy API: ${(await res.text())}`);

    const json = await res.json();
    const { pageKey, ownedNfts } = json as { pageKey: string | undefined, ownedNfts: any[] };

    nextPage = pageKey;

    allNFTs = allNFTs.concat(ownedNfts.map(nft => nft.tokenId));
  } while(nextPage);

  return allNFTs;
}

async function main() {
  const allPunks: any[] = new Array(10000).fill(new Object());
  const allUniqueOwners = await getOwnersForContract();
  console.log('All unique owners: ', allUniqueOwners.length);

  let i = 0;
  for (const owner of allUniqueOwners) {
    console.log(`Fetching NFTs for owner ${i}/${allUniqueOwners.length}: `, owner);
    const nftIds = await getNFTsForOwner(owner);
    console.log('NFTs for owner: ', nftIds.length);

    for (const nftId of nftIds) {
      const tokenId = Number(nftId);

      allPunks[tokenId] = { owner };
    }

    // await new Promise(resolve => setTimeout(resolve, 10));
    i++;
  }

  console.log('All punks: ', allPunks.length);

  await fs.writeFile(
    resolve(__dirname, chain ?? '', `./crypto-punks-info.json`),
    JSON.stringify(allPunks)
  );

  console.log('Done');
}

main().catch(console.error);
