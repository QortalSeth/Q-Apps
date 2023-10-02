export const printVar = (variable: object) => {
  const [key, value] = Object.entries(variable)[0];
  console.log(key, " is: ", value);
};
