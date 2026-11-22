export type UserRole = 'Student' | 'Teacher' | 'Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  walletAddress?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  youtubeUrl: string;
  instruction?: string;
  orderNumber: number;
}

export interface Course {
  id: string; // e.g., 'CS-AI-01'
  title: string;
  category: 'AI' | 'Cybersecurity' | 'Cloud Computing' | 'Data Analytics' | 'Web Development' | 'Other';
  description: string;
  price?: number;
  thumbnailUrl?: string;
  skills: string[];
  durationHours: number;
  instructor: string;
  instructorWallet?: string;
  createdAt: string;
  lessons?: Lesson[];
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  purchasePrice: number;
  enrolledAt: string;
}

export interface LessonProgress {
  userId: string;
  lessonId: string;
  courseId: string;
  isCompleted: boolean;
  completedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  isActive: boolean;
  expiryDate?: string;
}

export interface OnChainCertificate {
  certId: string;
  courseId: string;
  recipient: string;
  certHash: string;
  issueDate: bigint | number;
  isRevoked: boolean;
  revokeReason: string;
  revokedAt: bigint | number;
}

export interface CertificateMetadata {
  certId: string;
  courseId: string;
  courseTitle?: string;
  studentId?: string;
  studentName: string;
  recipientAddress: string;
  issueDate: string;
  grade?: string;
  issuerName: string;
  notes?: string;
  generatedPdfHash?: string;
  pdfDataUrl?: string;
  txHash?: string;
}

export interface CertificateRecord extends CertificateMetadata {
  id: string;
  isRevoked: boolean;
  revokeReason?: string;
  revokedAt?: string;
}

export interface VerificationResult {
  searchedId: string;
  found: boolean;
  isValid: boolean;
  isRevoked: boolean;
  certId: string;
  courseId: string;
  courseTitle?: string;
  recipient: string;
  studentName?: string;
  issueDate: number;
  revokeReason: string;
  revokedAt: number;
  certHash: string;
  calculatedHash?: string;
  hashMatched?: boolean;
  transactionHash?: string;
  source: 'blockchain' | 'demo';
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  chainId: number | null;
  isSepolia: boolean;
  isOwner: boolean;
  balance: string | null;
}
