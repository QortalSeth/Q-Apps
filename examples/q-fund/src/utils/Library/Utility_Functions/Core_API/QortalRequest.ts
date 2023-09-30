import {
  GetRequestData,
  SearchTransactionResponse,
  TransactionSearchParams,
} from "./Interfaces";
import { stringIsEmpty } from "../Numbers/StringNumbers";

export const searchTransactions = async (params: TransactionSearchParams) => {
  return (await qortalRequest({
    action: "SEARCH_TRANSACTIONS",
    ...params,
  })) as SearchTransactionResponse[];
};
type AccountName = { name: string; owner: string };
export const getAccountNames = async (
  address: string,
  params?: GetRequestData
) => {
  const names = (await qortalRequest({
    action: "GET_ACCOUNT_NAMES",
    address,
    ...params,
  })) as AccountName[];

  const namelessAddress = { name: "", owner: address };
  const emptyNamesFilled = names.map(({ name, owner }) => {
    return stringIsEmpty(name) ? namelessAddress : { name, owner };
  });

  const emptyArrayFilled =
    emptyNamesFilled.length > 0 ? emptyNamesFilled : [namelessAddress];
  return emptyArrayFilled;
};
