import { ConfirmationStatus, TransactionType } from "./API_Types";

export interface GetRequestData {
  limit?: number;
  offset?: number;
  reverse?: boolean;
}

export interface TransactionSearchParams extends GetRequestData {
  startBlock?: number;
  blockLimit?: number;
  txGroupId?: number;
  txType: TransactionType;
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
