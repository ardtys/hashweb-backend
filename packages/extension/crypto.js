// Crypto utilities for HashWeb Extension
// Using Web Crypto API for AES-GCM encryption

class CryptoUtils {
  // Generate a random encryption key
  static async generateKey() {
    return await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Convert key to hex string for URL
  static async keyToHex(key) {
    const exported = await crypto.subtle.exportKey('raw', key);
    return Array.from(new Uint8Array(exported))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Encode string to Uint8Array
  static encodeText(text) {
    return new TextEncoder().encode(text);
  }

  // Decode Uint8Array to string
  static decodeText(buffer) {
    return new TextDecoder().decode(buffer);
  }

  // Encrypt text with AES-GCM
  static async encryptText(plaintext, key) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedText = this.encodeText(plaintext);

    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encodedText
    );

    // Combine IV and ciphertext
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);

    // Convert to base64
    return this.arrayBufferToBase64(combined);
  }

  // Encrypt file (ArrayBuffer) with AES-GCM
  static async encryptFile(fileBuffer, key) {
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      fileBuffer
    );

    // Combine IV and ciphertext
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);

    return this.arrayBufferToBase64(combined);
  }

  // Encrypt multiple files
  static async encryptFiles(files, key) {
    const encryptedFiles = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const encrypted = await this.encryptFile(arrayBuffer, key);

        return {
          name: file.name,
          size: file.size,
          type: file.type,
          contents: encrypted,
        };
      })
    );

    return JSON.stringify(encryptedFiles);
  }

  // Convert ArrayBuffer to Base64
  static arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Convert Base64 to ArrayBuffer
  static base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

// Export for use in extension
if (typeof window !== 'undefined') {
  window.CryptoUtils = CryptoUtils;
}
