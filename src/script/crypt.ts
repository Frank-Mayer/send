const algo: AlgorithmIdentifier = "AES-GCM";
const alg = "A256GCM";
const tagLength = 128;
const iv: BufferSource = new Uint8Array([
  167, 147, 142, 62, 67, 228, 83, 179, 19, 217, 87, 78, 107, 243, 163, 47,
]);

let key: CryptoKey | undefined = undefined;

export const encrypt = async (data: BufferSource): Promise<ArrayBuffer> =>
  crypto.subtle.encrypt(
    {
      name: algo,
      iv,
      tagLength,
    },
    key ?? (await generateKey()),
    data
  );

export const decrypt = async (data: BufferSource) => {
  try {
    return crypto.subtle
      .decrypt(
        {
          name: algo,
          iv,
          tagLength,
        },
        key ?? (await generateKey()),
        data
      )
      .catch((err) => {
        console.error(err);
        alert("Decryption failed");
        throw err;
      });
  } catch (err) {
    alert("Decryption failed");
    throw err;
  }
};

export const generateKey = async () => {
  key = await window.crypto.subtle.generateKey(
    {
      name: algo,
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
  return key;
};

export const exportKey = async (): Promise<string> => {
  return (
    await window.crypto.subtle.exportKey("jwk", key ?? (await generateKey()))
  ).k;
};

export const importKey = async (k: string) => {
  try {
    const keyData: JsonWebKey = {
      alg,
      ext: true,
      k,
      key_ops: ["encrypt", "decrypt"],
      kty: "oct",
    };

    key = await window.crypto.subtle.importKey(
      "jwk",
      keyData,
      {
        name: algo,
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );

    return true;
  } catch (e) {
    alert("Could not import decryption key");
    console.error(e);
    return false;
  }
};
