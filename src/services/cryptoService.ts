/**
 * Cryptographic hashing service using native Web Crypto API.
 * Ensures zero PII leaks while generating deterministic SHA-256 hashes for Ethereum storage.
 */

export class CryptoService {
  /**
   * Computes SHA-256 hash of an ArrayBuffer (e.g. PDF file buffer)
   * Returns a 0x-prefixed hex string of 32 bytes (64 hex characters).
   */
  static async hashBuffer(buffer: ArrayBuffer): Promise<string> {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
    return this.bufferToHex(hashBuffer);
  }

  /**
   * Computes SHA-256 hash of a string payload (e.g. canonical certificate metadata)
   */
  static async hashString(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return this.bufferToHex(hashBuffer);
  }

  /**
   * Computes SHA-256 hash of a File object (uploaded via drag-and-drop or file input)
   */
  static async hashFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    return this.hashBuffer(arrayBuffer);
  }

  /**
   * Helper to convert ArrayBuffer to '0x'-prefixed lowercase hex string
   */
  private static bufferToHex(buffer: ArrayBuffer): string {
    const byteArray = new Uint8Array(buffer);
    const hexParts: string[] = [];
    for (let i = 0; i < byteArray.length; i++) {
      const hex = byteArray[i].toString(16).padStart(2, '0');
      hexParts.push(hex);
    }
    return '0x' + hexParts.join('');
  }

  /**
   * Canonical string representation for certificate metadata
   */
  static createCanonicalPayload(metadata: {
    certId: string;
    courseId: string;
    recipientAddress: string;
    studentName: string;
    issueDate: string;
  }): string {
    return [
      'SKILTRUST_CERTIFICATE_V1',
      `ID:${metadata.certId.trim().toUpperCase()}`,
      `COURSE:${metadata.courseId.trim()}`,
      `RECIPIENT:${metadata.recipientAddress.trim().toLowerCase()}`,
      `NAME:${metadata.studentName.trim()}`,
      `DATE:${metadata.issueDate.trim()}`,
    ].join('|');
  }
}
