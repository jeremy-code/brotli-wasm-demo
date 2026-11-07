const textDecoder = new TextDecoder("utf-8", { fatal: true });

const decodeUtf8 = (val: ArrayBufferLike | ArrayBufferView) => {
  try {
    return textDecoder.decode(val);
  } catch {
    return undefined;
  }
};

const textEncoder = new TextEncoder();

const encodeUtf8 = (val: string) => textEncoder.encode(val);

export { decodeUtf8, encodeUtf8 };
