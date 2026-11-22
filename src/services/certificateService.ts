import { User, Course, CertificateRecord } from '../types';
import { StorageService } from './storageService';
import { PdfService } from './pdfService';
import { Web3Service } from './web3Service';

export class CertificateService {
  /**
   * Issues or claims a blockchain certificate for a student completing a course
   */
  static async claimCertificate(
    user: User,
    course: Course,
    customRecipient?: string
  ): Promise<{ cert: CertificateRecord; txHash: string; pdfDoc: any }> {
    const web3Service = Web3Service.getInstance();
    
    // Determine wallet address
    let recipientWallet = customRecipient || user.walletAddress;
    if (!recipientWallet) {
      recipientWallet = '0x30035Ca790093E941bf4AD0f60056c7Bd7995A10';
      StorageService.updateStudentWallet(user.id, recipientWallet);
    }

    // Generate unique Certificate ID
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const cleanCourseCode = course.id.replace(/[^A-Za-z0-9]/g, '').slice(-4).toUpperCase();
    const certId = `NC-2026-${cleanCourseCode}${randomSuffix}`;

    const metadata = {
      certId,
      courseId: course.id,
      courseTitle: course.title,
      studentId: user.id,
      studentName: user.name,
      recipientAddress: recipientWallet,
      issueDate: new Date().toISOString().slice(0, 10),
      grade: 'Pass with Distinction',
      issuerName: course.instructor || 'NextChapter Academic Board',
      notes: `Successfully completed all curriculum modules for ${course.title}.`,
    };

    // 1. Generate official branded landscape PDF with embedded QR and logo
    const pdfResult = await PdfService.generateCertificatePdf(metadata, course);

    // 2. Anchor SHA-256 hash onto Ethereum Sepolia
    const txHash = await web3Service.issueCertificate(
      certId,
      course.id,
      recipientWallet,
      pdfResult.sha256Hash
    );

    // 3. Save official certificate record
    const certRecord: CertificateRecord = {
      id: `cert-${Date.now()}`,
      certId,
      courseId: course.id,
      courseTitle: course.title,
      studentId: user.id,
      studentName: user.name,
      recipientAddress: recipientWallet,
      issuerName: metadata.issuerName,
      issueDate: metadata.issueDate,
      grade: metadata.grade,
      notes: metadata.notes,
      generatedPdfHash: pdfResult.sha256Hash,
      txHash: txHash,
      isRevoked: false,
    };

    StorageService.saveCertificate(certRecord);

    return {
      cert: certRecord,
      txHash,
      pdfDoc: pdfResult.doc,
    };
  }
}
