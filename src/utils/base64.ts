/// <reference lib="ESNext.TypedArrays" />

const encodeBase64Url = (data: Uint8Array) => {
  if (typeof data["toBase64"] === "function") {
    return data.toBase64({ alphabet: "base64url", omitPadding: true });
  }
  let binaryString = "";
  for (let i = 0; i < data.byteLength; i++) {
    binaryString += String.fromCharCode(data[i]);
  }
  const base64 = btoa(binaryString);
  const base64WithoutPadding = base64.endsWith("==")
    ? base64.slice(0, -2)
    : base64.endsWith("=")
      ? base64.slice(0, -1)
      : base64;

  return base64WithoutPadding.replace(/\+/g, "-").replace(/\//g, "_");
};

const decodeBase64Url = (val: string): Uint8Array<ArrayBuffer> => {
  if (typeof Uint8Array["fromBase64"] === "function") {
    return Uint8Array.fromBase64(val, {
      alphabet: "base64url",
      lastChunkHandling: "loose",
    });
  }
  const base64 = val.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (base64.length % 4)) % 4;
  if (padLength === 3) {
    throw new SyntaxError(
      "Invalid base64 string: single trailing character cannot form a valid byte.",
    );
  }
  const base64WithPadding = base64 + "=".repeat(padLength);
  const binaryString = atob(base64WithPadding);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export { encodeBase64Url, decodeBase64Url };
