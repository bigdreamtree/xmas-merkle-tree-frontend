// Encode string to base64
export const encodeBase64 = (str: string): string => {
  return Buffer.from(str).toString("base64");
};

// Decode base64 to string
export const decodeBase64 = (base64: string): string => {
  return Buffer.from(base64, "base64").toString();
};
