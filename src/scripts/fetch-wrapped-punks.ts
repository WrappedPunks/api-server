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
const wrappedPunkContract = chain === 'testnet'
  ? '0x33b8adfdf4ddc3ee3c239d5e0cb511bb5fb647d4' // WrappedPunks contract address on goerli
  : '0xb7f7f6c52f2e2fdb1963eab30438024864c313f6'; // WrappedPunks contract address on mainnet

async function getOwnersForContract(): Promise<any[]> {
  const callUrl = `${url}/getOwnersForContract?contractAddress=${wrappedPunkContract}`;
  const res = await fetch(callUrl);

  if (!res.ok) throw new Error(`Failed to call Alchemy API: ${(await res.text())}`);

  const json = await res.json();
  return json.owners.map((owner: any) => owner.toLowerCase());
}

async function getNFTsForOwner(owner: string): Promise<any[]> {
  const callUrl = `${url}/getNFTsForOwner?contractAddresses[]=${wrappedPunkContract}&owner=${owner}`;
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
  let allPunks = [];
  const allUniqueOwners = await getOwnersForContract();
  let count = 1;

  for (const owner of allUniqueOwners) {
    console.log(`Fetching NFTs for owner ${count}/${allUniqueOwners.length}: ${owner}`);
    const nftIds = await getNFTsForOwner(owner);

    for (const nftId of nftIds) {
      allPunks.push({
        id: nftId,
        owner,
      })
    }
    count++;
  }

  allPunks = allPunks.sort((a, b) => a.id - b.id);

  await fs.writeFile(
    resolve(__dirname, chain ?? '', './wrapped-punks.json'),
    JSON.stringify(allPunks)
  );
}

main().catch(console.error);
