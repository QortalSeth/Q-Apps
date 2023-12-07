export type AccountInfo = { address: string; publicKey: string };
export type AccountName = { name: string; owner: string };
export type ConfirmationStatus = "CONFIRMED" | "UNCONFIRMED" | "BOTH";

export interface GetRequestData {
  limit?: number;
  offset?: number;
  reverse?: boolean;
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

export interface TransactionSearchParams extends GetRequestData {
  startBlock?: number;
  blockLimit?: number;
  txGroupId?: number;
  txType: TransactionType[];
  address: string;
  confirmationStatus: ConfirmationStatus;
}
