export const useEncryption = () => {
  const encryptData = async (plainText: string, publicKeyPem: string) => {
    const binaryDer = Uint8Array.from(atob(publicKeyPem), c => c.charCodeAt(0));

    // 產生公鑰
    const publicKey = await window.crypto.subtle.importKey(
      "spki",
      binaryDer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["encrypt"]
    );

    // 執行加密
    const encoded = new TextEncoder().encode(plainText);
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      encoded
    );

    // return Base64字串
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  };

  return { encryptData };
};