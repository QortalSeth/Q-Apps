import {
  GetRequestData,
  SearchTransactionResponse,
  TransactionSearchParams,
} from "./Interfaces";

const assembleURLParams = (params: object) => {
  let finalUrl = "";
  const urls: string[] = [];

  Object.entries(params).map(([key, value]) => {
    urls.push(`${key}=${value.toString()}`);
  });

  urls.map((url, index) => {
    if (index > 0) finalUrl += "&";
    finalUrl += url;
  });
  return finalUrl;
};

export const searchTransactions = async (params: TransactionSearchParams) => {
  const url = "/transactions/search?" + assembleURLParams(params);
  const response = await fetch(url);
  const donorTransactions: SearchTransactionResponse[] = await response.json();
  return donorTransactions;
};

export const getAccountNames = async (
  address: string,
  params?: GetRequestData
) => {
  const paramsString = params ? `?${assembleURLParams(params)}` : "";
  const url = `/names/address/${address}${paramsString}`;
  const response = await fetch(url);
  const namesOfAddress: { name: string; owner: string }[] =
    await response.json();
  return namesOfAddress;
};
