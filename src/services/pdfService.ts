import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Course, CertificateMetadata } from '../types';
import { CryptoService } from './cryptoService';
import { NEXTCHAPTER_LOGO_BASE64 } from '../assets/logoBase64';

export interface GeneratedPdfResult {
  doc: jsPDF;
  arrayBuffer: ArrayBuffer;
  pdfBlob: Blob;
  sha256Hash: string;
  qrDataUrl: string;
  verificationUrl: string;
}

export class PdfService {
  /**
   * Generates verification URL for a given certificate ID
   */
  static getVerificationUrl(certId: string): string {
    const origin = window.location.origin;
    const pathname = window.location.pathname.replace(/\/$/, '');
    return `${origin}${pathname}/?certId=${encodeURIComponent(certId.trim().toUpperCase())}`;
  }

  /**
   * Generates a NextChapter branded, high-resolution landscape certificate PDF
   */
  static async generateCertificatePdf(
    metadata: CertificateMetadata,
    course: Course
  ): Promise<GeneratedPdfResult> {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4', // 297mm x 210mm
    });

    const pageWidth = 297;
    const pageHeight = 210;
    const certId = metadata.certId.trim().toUpperCase();
    const verificationUrl = this.getVerificationUrl(certId);

    // 1. Generate QR Code Data URL with NextChapter primary color
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 256,
      color: {
        dark: '#624185',
        light: '#FFFFFF',
      },
    });

    // 2. Draw Background & Ornamental Frame
    doc.setFillColor(248, 248, 255); // NextChapter offWhite
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Outer double border (Primary #624185)
    doc.setDrawColor(98, 65, 133);
    doc.setLineWidth(2.5);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

    // Inner gold/orange border (Secondary #ffa345)
    doc.setDrawColor(255, 163, 69);
    doc.setLineWidth(0.8);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

    // Corner decorative rosettes
    const corners = [
      [12, 12],
      [pageWidth - 12, 12],
      [12, pageHeight - 12],
      [pageWidth - 12, pageHeight - 12],
    ];
    corners.forEach(([x, y]) => {
      doc.setFillColor(98, 65, 133);
      doc.circle(x, y, 2.5, 'F');
      doc.setFillColor(255, 163, 69);
      doc.circle(x, y, 1.2, 'F');
    });

    // 3. Header: NextChapter Academy Official Brand Logo & Blockchain Proof
    try {
      doc.addImage(NEXTCHAPTER_LOGO_BASE64, 'PNG', (pageWidth - 36) / 2, 13, 36, 36);
    } catch {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(98, 65, 133);
      doc.text('NEXTCHAPTER', pageWidth / 2, 28, { align: 'center' });
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(255, 163, 69);
    doc.text('ACADEMY OF CONTINUOUS LEARNING & TECHNOLOGY', pageWidth / 2, 51, { align: 'center' });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Ethereum Sepolia Cryptographic Proof of Completion', pageWidth / 2, 55.5, { align: 'center' });

    // Decorative divider line
    doc.setDrawColor(255, 163, 69);
    doc.setLineWidth(0.5);
    doc.line(70, 58, pageWidth - 70, 58);

    // 4. Main Certificate Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(23);
    doc.setTextColor(22, 22, 24);
    doc.text('CERTIFICATE OF ACHIEVEMENT', pageWidth / 2, 68, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(100, 116, 139);
    doc.text('This is to certify that', pageWidth / 2, 76, { align: 'center' });

    // 5. Recipient Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(23);
    doc.setTextColor(98, 65, 133);
    const recipientName = (metadata.studentName || 'Recipient').toUpperCase();
    doc.text(recipientName, pageWidth / 2, 87, { align: 'center' });

    // Underline for name
    const textWidth = doc.getTextWidth(recipientName);
    doc.setDrawColor(98, 65, 133);
    doc.setLineWidth(0.75);
    doc.line((pageWidth - textWidth) / 2 - 5, 90, (pageWidth + textWidth) / 2 + 5, 90);

    // Student ID if present
    if (metadata.studentId) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Student ID: ${metadata.studentId}`, pageWidth / 2, 95.5, { align: 'center' });
    }

    // 6. Qualification & Course Details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(100, 116, 139);
    doc.text('has successfully completed the advanced training program in', pageWidth / 2, 102, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(22, 22, 24);
    doc.text(course.title, pageWidth / 2, 111, { align: 'center', maxWidth: 210 });

    // Grade / Distinction
    const gradeText = metadata.grade || 'Pass with Distinction';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(255, 163, 69);
    doc.text(`Honors: ${gradeText}`, pageWidth / 2, 119, { align: 'center' });

    // 7. Course Competencies / Skills
    if (course.skills && course.skills.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      const skillsStr = `Key Competencies: ${course.skills.slice(0, 5).join(' • ')}`;
      doc.text(skillsStr, pageWidth / 2, 125, { align: 'center', maxWidth: 220 });
    }

    // 8. Bottom Information Section: Signatures & QR Code
    // Left: Instructor / Issuer Signature Line
    doc.setDrawColor(156, 163, 175);
    doc.setLineWidth(0.5);
    doc.line(30, 158, 95, 158);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(22, 22, 24);
    doc.text(course.instructor || metadata.issuerName, 62.5, 164, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Authorized Instructor / Course Lead', 62.5, 169, { align: 'center' });
    doc.text('NextChapter Academic Board', 62.5, 173, { align: 'center' });

    // Center: Verification QR Code & Seal
    doc.addImage(qrDataUrl, 'PNG', 133.5, 138, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(98, 65, 133);
    doc.text('SCAN TO VERIFY ON ETHEREUM', 148.5, 172, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(certId, 148.5, 176, { align: 'center' });

    // Right: Date & Academic Dean Signature Line
    doc.setDrawColor(156, 163, 175);
    doc.setLineWidth(0.5);
    doc.line(202, 158, 267, 158);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(22, 22, 24);
    doc.text(metadata.issueDate || new Date().toISOString().slice(0, 10), 234.5, 164, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Date of Issuance', 234.5, 169, { align: 'center' });
    doc.text('Office of Academic Verification', 234.5, 173, { align: 'center' });

    // 9. Cryptographic Metadata Footer (Zero-PII On-Chain Audit Trail)
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(16, 183, pageWidth - 16, 183);

    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);

    const recipientShort = metadata.recipientAddress
      ? `${metadata.recipientAddress.slice(0, 10)}...${metadata.recipientAddress.slice(-8)}`
      : '0x000...000';

    doc.text(`Certificate ID: ${certId}`, 18, 189);
    doc.text(`Course Code: ${course.id}`, 95, 189);
    doc.text(`Recipient Wallet: ${recipientShort}`, 170, 189);

    // Initial placeholder for hash
    doc.text('Audit Status: Anchored to Ethereum Sepolia Testnet | Non-Repudiable', 18, 195);
    doc.text(`Public Registry: ${verificationUrl}`, 18, 200, { maxWidth: 260 });

    // 10. Compute deterministic SHA-256 Hash of this document buffer
    const arrayBuffer = doc.output('arraybuffer');
    const sha256Hash = await CryptoService.hashBuffer(arrayBuffer);

    // Update with exact hash on last line for human audit
    doc.setTextColor(98, 65, 133);
    doc.text(`SHA-256 Fingerprint: ${sha256Hash}`, 18, 195);

    // Final regenerate
    const finalBuffer = doc.output('arraybuffer');
    const finalBlob = new Blob([finalBuffer], { type: 'application/pdf' });
    const finalHash = await CryptoService.hashBuffer(finalBuffer);

    return {
      doc,
      arrayBuffer: finalBuffer,
      pdfBlob: finalBlob,
      sha256Hash: finalHash,
      qrDataUrl,
      verificationUrl,
    };
  }

  /**
   * Helper to download jsPDF document
   */
  static downloadPdf(doc: jsPDF, filename: string): void {
    doc.save(filename);
  }
}
