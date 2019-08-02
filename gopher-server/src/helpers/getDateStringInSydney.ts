/**
 * Returns a string with the current datetime in Sydney.
 */
export const getDateStringInSydney = () => {
  return new Date().toLocaleString("en-au", { timeZone: "Australia/Sydney" });
};
