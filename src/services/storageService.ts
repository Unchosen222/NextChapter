import { Course, User, Enrollment, LessonProgress, Coupon, CertificateRecord } from '../types';
import { 
  INITIAL_COURSES, 
  INITIAL_USERS, 
  INITIAL_COUPONS, 
  INITIAL_ENROLLMENTS, 
  INITIAL_PROGRESS, 
  INITIAL_CERTIFICATES 
} from '../data/mockData';
import { supabase } from './supabaseClient';

const STORAGE_KEYS = {
  CURRENT_USER: 'nextchapter_current_user',
  USERS: 'nextchapter_users',
  COURSES: 'nextchapter_courses',
  ENROLLMENTS: 'nextchapter_enrollments',
  PROGRESS: 'nextchapter_progress',
  COUPONS: 'nextchapter_coupons',
  CERTIFICATES: 'nextchapter_certificates',
  CUSTOM_RPC: 'nextchapter_custom_rpc',
  CONTRACT_ADDR: 'nextchapter_contract_address',
};

export class StorageService {
  /**
   * Current Logged In User
   */
  static getCurrentUser(): User {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        // fallback
      }
    }
    // Default to Student user
    const defaultUser = INITIAL_USERS[0];
    this.setCurrentUser(defaultUser);
    return defaultUser;
  }

  static setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  static getAllUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        // fallback
      }
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }

  static addUser(user: User): User[] {
    const users = this.getAllUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.setCurrentUser(user);

    try {
      supabase.from('users').upsert([{
        name: user.name,
        email: user.email,
        role: user.role,
        wallet_address: user.walletAddress,
      }]).then(() => {});
    } catch {}

    return users;
  }

  /**
   * Link wallet address to student profile
   */
  static updateStudentWallet(userId: string, walletAddress: string): User {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].walletAddress = walletAddress;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      
      const currentUser = this.getCurrentUser();
      if (currentUser.id === userId) {
        currentUser.walletAddress = walletAddress;
        this.setCurrentUser(currentUser);
      }
      return users[userIndex];
    }
    const curr = this.getCurrentUser();
    curr.walletAddress = walletAddress;
    this.setCurrentUser(curr);
    return curr;
  }

  /**
   * Courses
   */
  static getCourses(): Course[] {
    const data = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
    return INITIAL_COURSES;
  }

  static saveCourse(course: Course): Course[] {
    const courses = this.getCourses();
    const idx = courses.findIndex(c => c.id === course.id);
    if (idx >= 0) {
      courses[idx] = course;
    } else {
      courses.unshift(course);
    }
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    return courses;
  }

  static addCourse(course: Course): Course[] {
    return this.saveCourse(course);
  }

  static exportDataBackup(): string {
    return JSON.stringify({
      courses: this.getCourses(),
      certificates: this.getCertificates(),
      enrollments: this.getEnrollments(),
      coupons: this.getCoupons(),
    }, null, 2);
  }

  static importDataBackup(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.courses) localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(parsed.courses));
      if (parsed.certificates) localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(parsed.certificates));
      if (parsed.enrollments) localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(parsed.enrollments));
      if (parsed.coupons) localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(parsed.coupons));
      return true;
    } catch {
      return false;
    }
  }

  static getCourseById(id: string): Course | undefined {
    return this.getCourses().find(c => c.id.toLowerCase() === id.toLowerCase());
  }

  /**
   * Enrollments
   */
  static getEnrollments(): Enrollment[] {
    const data = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        // fallback
      }
    }
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(INITIAL_ENROLLMENTS));
    return INITIAL_ENROLLMENTS;
  }

  static isEnrolled(userId: string, courseId: string): boolean {
    const enrollments = this.getEnrollments();
    return enrollments.some(e => e.userId === userId && e.courseId === courseId);
  }

  static enrollStudent(userId: string, courseId: string, purchasePrice: number): Enrollment {
    const enrollments = this.getEnrollments();
    const existing = enrollments.find(e => e.userId === userId && e.courseId === courseId);
    if (existing) return existing;

    const newEnroll: Enrollment = {
      id: `enroll-${Date.now()}`,
      userId,
      courseId,
      purchasePrice,
      enrolledAt: new Date().toISOString(),
    };
    enrollments.push(newEnroll);
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
    return newEnroll;
  }

  /**
   * Lesson Progress Tracking
   */
  static getProgressList(): LessonProgress[] {
    const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        // fallback
      }
    }
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(INITIAL_PROGRESS));
    return INITIAL_PROGRESS;
  }

  static isLessonCompleted(userId: string, lessonId: string): boolean {
    const list = this.getProgressList();
    return list.some(p => p.userId === userId && p.lessonId === lessonId && p.isCompleted);
  }

  static toggleLessonProgress(userId: string, lessonId: string, courseId: string): boolean {
    const list = this.getProgressList();
    const idx = list.findIndex(p => p.userId === userId && p.lessonId === lessonId);
    let newStatus = true;

    if (idx >= 0) {
      list[idx].isCompleted = !list[idx].isCompleted;
      list[idx].completedAt = new Date().toISOString();
      newStatus = list[idx].isCompleted;
    } else {
      list.push({
        userId,
        lessonId,
        courseId,
        isCompleted: true,
        completedAt: new Date().toISOString(),
      });
      newStatus = true;
    }
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(list));
    return newStatus;
  }

  /**
   * Computes Course Progress percentage for a student (0 - 100)
   */
  static getCourseProgress(userId: string, courseId: string): { completed: number; total: number; percentage: number; isEligible: boolean } {
    const course = this.getCourseById(courseId);
    if (!course || !course.lessons || course.lessons.length === 0) {
      return { completed: 0, total: 0, percentage: 0, isEligible: false };
    }

    const total = course.lessons.length;
    const progressList = this.getProgressList();
    const completed = course.lessons.filter(l => 
      progressList.some(p => p.userId === userId && p.lessonId === l.id && p.isCompleted)
    ).length;

    const percentage = Math.round((completed / total) * 100);
    const isEligible = percentage === 100;

    return { completed, total, percentage, isEligible };
  }

  /**
   * Coupons
   */
  static getCoupons(): Coupon[] {
    const data = localStorage.getItem(STORAGE_KEYS.COUPONS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        // fallback
      }
    }
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(INITIAL_COUPONS));
    return INITIAL_COUPONS;
  }

  static validateCoupon(code: string): Coupon | null {
    const cleanCode = code.trim().toUpperCase();
    const coupons = this.getCoupons();
    return coupons.find(c => c.code.toUpperCase() === cleanCode && c.isActive) || null;
  }

  static saveCoupon(coupon: Coupon): Coupon[] {
    const coupons = this.getCoupons();
    const idx = coupons.findIndex(c => c.id === coupon.id);
    if (idx >= 0) {
      coupons[idx] = coupon;
    } else {
      coupons.push(coupon);
    }
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
    return coupons;
  }

  /**
   * Certificate Records
   */
  static getCertificates(): CertificateRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        // fallback
      }
    }
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(INITIAL_CERTIFICATES));
    return INITIAL_CERTIFICATES;
  }

  static getCertificateById(certId: string): CertificateRecord | undefined {
    const cleanId = certId.trim().toUpperCase();
    return this.getCertificates().find(c => c.certId.trim().toUpperCase() === cleanId);
  }

  static getCertificatesByRecipient(recipientAddress: string): CertificateRecord[] {
    const cleanAddr = recipientAddress.trim().toLowerCase();
    return this.getCertificates().filter(c => c.recipientAddress.trim().toLowerCase() === cleanAddr);
  }

  static saveCertificate(cert: CertificateRecord): CertificateRecord[] {
    const certs = this.getCertificates();
    const idx = certs.findIndex(c => c.certId.trim().toUpperCase() === cert.certId.trim().toUpperCase());
    if (idx >= 0) {
      certs[idx] = cert;
    } else {
      certs.unshift(cert);
    }
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs));
    
    // Async attempt to sync to Supabase without blocking
    try {
      supabase.from('certificates').upsert([
        {
          cert_id: cert.certId,
          course_id: cert.courseId,
          student_name: cert.studentName,
          recipient_address: cert.recipientAddress,
          issuer_name: cert.issuerName,
          cert_hash: cert.generatedPdfHash || '0x',
          tx_hash: cert.txHash,
          issue_date: cert.issueDate,
          is_revoked: cert.isRevoked,
          revoke_reason: cert.revokeReason,
          pdf_data_url: cert.pdfDataUrl,
        }
      ]).then(() => {});
    } catch {}

    return certs;
  }

  static revokeCertificate(certId: string, reason: string): boolean {
    const certs = this.getCertificates();
    const cleanId = certId.trim().toUpperCase();
    const idx = certs.findIndex(c => c.certId.trim().toUpperCase() === cleanId);
    if (idx >= 0) {
      certs[idx].isRevoked = true;
      certs[idx].revokeReason = reason;
      certs[idx].revokedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs));
      
      try {
        supabase.from('certificates').update({
          is_revoked: true,
          revoke_reason: reason,
          revoked_at: new Date().toISOString(),
        }).eq('cert_id', cleanId).then(() => {});
      } catch {}

      return true;
    }
    return false;
  }

  /**
   * Custom RPC
   */
  static getCustomRpcUrl(): string {
    return localStorage.getItem(STORAGE_KEYS.CUSTOM_RPC) || '';
  }

  static setCustomRpcUrl(url: string): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_RPC, url.trim());
  }

  static getContractAddress(): string {
    return localStorage.getItem(STORAGE_KEYS.CONTRACT_ADDR) || '';
  }

  static setContractAddress(addr: string): void {
    localStorage.setItem(STORAGE_KEYS.CONTRACT_ADDR, addr.trim());
  }

  static getCustomContractAddress(): string {
    return this.getContractAddress();
  }

  static setCustomContractAddress(addr: string): void {
    this.setContractAddress(addr);
  }

  static getCertMetadata(certId: string): any {
    return this.getCertificateById(certId) || null;
  }

  static saveCertMetadata(metadata: any): void {
    const certRecord: CertificateRecord = {
      id: `cert-${Date.now()}`,
      certId: metadata.certId,
      courseId: metadata.courseId,
      courseTitle: metadata.courseTitle || metadata.courseId,
      studentId: metadata.studentId,
      studentName: metadata.studentName,
      recipientAddress: metadata.recipientAddress,
      issuerName: metadata.issuerName,
      issueDate: metadata.issueDate,
      grade: metadata.grade,
      notes: metadata.notes,
      generatedPdfHash: metadata.generatedPdfHash,
      txHash: metadata.txHash,
      isRevoked: false,
    };
    this.saveCertificate(certRecord);
  }
}
