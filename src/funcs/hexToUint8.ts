export const hexToUint8Array = (hex: string): Uint8Array => {
  // 0x 접두사 제거
  hex = hex.replace("0x", "");

  // 길이가 짝수가 되도록 패딩
  if (hex.length % 2 !== 0) {
    hex = "0" + hex;
  }

  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }

  return bytes;
};

export const splitHexString = (longProof: string): string[] => {
  // 1. 64자리씩 분할 (32바이트)
  const chunks = longProof.match(/.{1,64}/g) || [];

  // 2. 각 청크에 '0x' 접두사 추가
  const formattedProof = chunks.map((chunk) => "0x" + chunk);

  return formattedProof;
};
