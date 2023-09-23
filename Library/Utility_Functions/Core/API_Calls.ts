import {
  GetRequestData,
  SearchTransactionResponse,
  TransactionSearchParams,
} from "./API_Interfaces";

const assembleURLParams = (params: object) => {
  let finalUrl = "";
  const urls: string[] = [];
  Object.entries(params).map(([key, value]) => {
    urls.push(`${key}=${value.toString()}`);
  });

  for (const i in urls) {
    if (i > 0) finalUrl += "&";
    finalUrl += urls[i];
  }
  return finalUrl;
};

export const searchTransactions = async (params: TransactionSearchParams) => {
  const url = "/transactions/search?" + assembleURLParams(params);
  const response = await fetch(url);
  const donorTransactions: SearchTransactionResponse[] = await response.json();
  return donorTransactions;
};

export const getNamesByAddress = async (
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
// min URL: /names/address/QeJW96BDMFkmVPofkjY87stvMR7VSbj5W9
// max URL: /names/address/QeJW96BDMFkmVPofkjY87stvMR7VSbj5W9?limit=20&offset=10&reverse=true
