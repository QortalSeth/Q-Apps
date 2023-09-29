import { ConfirmationStatus, TransactionType } from "./Types";

export interface GetRequestData {
  limit?: number;
  offset?: number;
  reverse?: boolean;
}

export interface TransactionSearchParams extends GetRequestData {
  startBlock?: number;
  blockLimit?: number;
  txGroupId?: number;
  txType: TransactionType[];
  address: string;
  confirmationStatus: ConfirmationStatus;
}

export interface SearchTransactionResponse {
  type: string;
  timestamp: number;
  reference: string;
  fee: string;
  signature: string;
  txGroupId: number;
  blockHeight: number;
  approvalStatus: string;
  creatorAddress: string;
  senderPublicKey: string;
  recipient: string;
  amount: string;
}

export interface QortalRequestOptions {
  action: string;
  name?: string;
  service?: string;
  data64?: string;
  title?: string;
  description?: string;
  category?: string;
  tags?: string[] | string;
  identifier?: string;
  address?: string;
  metaData?: string;
  encoding?: string;
  includeMetadata?: boolean;
  limit?: number;
  offset?: number;
  reverse?: boolean;
  resources?: any[];
  filename?: string;
  list_name?: string;
  item?: string;
  items?: string[];
  tag1?: string;
  tag2?: string;
  tag3?: string;
  tag4?: string;
  tag5?: string;
  coin?: string;
  destinationAddress?: string;
  amount?: number;
  blob?: Blob;
  mimeType?: string;
  file?: File;
  encryptedData?: string;
  mode?: string;
  query?: string;
  excludeBlocked?: boolean;
  exactMatchNames?: boolean;
  creationBytes?: string;
  type?: string;
  assetId?: number;
  txType?: TransactionType[];
  confirmationStatus?: string;
  startBlock?: number;
  blockLimit?: number;
  txGroupId?: number;
}
