/// <reference lib="ESNext.TypedArrays" />

const encodeHex = (data: Uint8Array) => {
  if (typeof data["toHex"] === "function") {
    return data.toHex();
  }
  return Array.from(data)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export { encodeHex };
