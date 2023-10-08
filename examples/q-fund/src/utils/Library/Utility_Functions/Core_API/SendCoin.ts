export const sendCoin = async (
  address: string,
  amount: number,
  coin: string
) => {
  return qortalRequest({
    action: "SEND_COIN",
    coin,
    destinationAddress: address,
    amount,
  });
};

export const sendQORT = async (address: string, amount: number) => {
  return await sendCoin(address, amount, "QORT");
};

export const sendBitCoin = async (address: string, amount: number) => {
  return await sendCoin(address, amount, "BTC");
};

export const sendLiteCoin = async (address: string, amount: number) => {
  return await sendCoin(address, amount, "LTC");
};

export const sendDogeCoin = async (address: string, amount: number) => {
  return await sendCoin(address, amount, "DOGE");
};

export const sendDigiByte = async (address: string, amount: number) => {
  return await sendCoin(address, amount, "DGB");
};

export const sendRavenCoin = async (address: string, amount: number) => {
  return await sendCoin(address, amount, "RVN");
};

export const sendPirateChain = async (address: string, amount: number) => {
  return await sendCoin(address, amount, "ARRR");
};
