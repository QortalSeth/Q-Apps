export function uint8ArrayToBase64(byteArray: Uint8Array): string {
  const chars: string[] = Array.from(byteArray).map(byte =>
    String.fromCharCode(byte)
  );
  return btoa(chars.join(""));
}

export function base64ToUint8Array(base64) {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }

  return bytes;
}
