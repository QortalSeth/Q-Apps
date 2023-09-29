import {
  GetRequestData,
  SearchTransactionResponse,
  TransactionSearchParams,
} from "./Interfaces";

export const searchTransactions = async (params: TransactionSearchParams) => {
  return (await qortalRequest({
    action: "SEARCH_TRANSACTIONS",
    ...params,
  })) as SearchTransactionResponse[];
};

export const getAccountNames = async (
  address: string,
  params?: GetRequestData
) => {
  return (await qortalRequest({
    action: "GET_ACCOUNT_NAMES",
    address,
    ...params,
  })) as { name: string; owner: string }[];
};
