export interface GetLogsResponse {
  result: {
    address: string;
    topics: string[],
  }[];
}

export interface TransferLog {
  to: string;
  from: string;
  topic: string;
  tokenId: string;
  address: string;
  blockNumber: number;
}

export interface WrappedPunk {
  id: string;
  owner: string;
}

export interface CryptoPunkAttribute {
  value: string;
  trait_type: string;
}

export interface CryptoPunk {
  // image: string;
  attributes: CryptoPunkAttribute[];
  owner?: string;
  lastUpdated?: Date;
}
