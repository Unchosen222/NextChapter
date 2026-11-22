import { Course, User, Coupon, Enrollment, LessonProgress, CertificateRecord } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-student-01',
    name: 'Alexander Vance',
    email: 'alex@nextchapter.edu',
    role: 'Student',
    walletAddress: '0x30035Ca790093E941bf4AD0f60056c7Bd7995A10',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'user-teacher-01',
    name: 'Dr. Arisara Thorne',
    email: 'teacher@nextchapter.edu',
    role: 'Teacher',
    walletAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-05T08:00:00Z',
  },
  {
    id: 'user-admin-01',
    name: 'NextChapter Admin',
    email: 'admin@nextchapter.edu',
    role: 'Admin',
    walletAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01T08:00:00Z',
  },
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'NEXT50',
    discountPercentage: 50,
    isActive: true,
    expiryDate: '2026-12-31',
  },
  {
    id: 'coup-2',
    code: 'SPU2026',
    discountPercentage: 100,
    isActive: true,
    expiryDate: '2026-12-31',
  },
  {
    id: 'coup-3',
    code: 'WELCOME20',
    discountPercentage: 20,
    isActive: true,
    expiryDate: '2026-12-31',
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'CS-AI-01',
    title: 'Advanced Artificial Intelligence & Deep Learning',
    category: 'AI',
    description: 'Comprehensive study of transformer architectures, neural networks, computer vision, and autonomous agent frameworks.',
    price: 1290,
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
    skills: ['PyTorch', 'Transformers', 'Deep Neural Networks', 'Computer Vision', 'Model Optimization'],
    durationHours: 60,
    instructor: 'Dr. Arisara Thorne (AI Lead)',
    instructorWallet: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    createdAt: '2026-01-15',
    lessons: [
      {
        id: 'lesson-ai-01',
        courseId: 'CS-AI-01',
        title: 'Introduction to Neural Architecture & Tensors',
        youtubeUrl: 'https://www.youtube.com/embed/aircAruvnKk',
        instruction: 'In this introductory lesson, we will explore mathematical tensors, backpropagation fundamentals, and neural network foundations.',
        orderNumber: 1,
      },
      {
        id: 'lesson-ai-02',
        courseId: 'CS-AI-01',
        title: 'Building Multi-Layer Perceptrons from Scratch',
        youtubeUrl: 'https://www.youtube.com/embed/IHZwWFHWa-w',
        instruction: 'Code walkthrough: implement forward propagation, loss computation, and Adam optimizer updates using Python and NumPy.',
        orderNumber: 2,
      },
      {
        id: 'lesson-ai-03',
        courseId: 'CS-AI-01',
        title: 'Transformer Attention Mechanisms & Self-Attention',
        youtubeUrl: 'https://www.youtube.com/embed/kCc8FmEb1nY',
        instruction: 'Analyze query, key, and value matrices. Implement scaled dot-product attention and multi-head attention blocks.',
        orderNumber: 3,
      },
    ],
  },
  {
    id: 'CS-BC-01',
    title: 'Ethereum Smart Contracts & Web3 Decentralized Architecture',
    category: 'Other',
    description: 'Architecting decentralized applications, Ethereum Virtual Machine internals, cryptographic state proofs, and Solidity 0.8+ security patterns.',
    price: 990,
    thumbnailUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80',
    skills: ['Ethereum EVM', 'Solidity 0.8+', 'Hardhat', 'Ethers.js v6', 'Smart Contract Security'],
    durationHours: 50,
    instructor: 'Dr. Arisara Thorne (AI Lead)',
    instructorWallet: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    createdAt: '2026-02-25',
    lessons: [
      {
        id: 'lesson-bc-01',
        courseId: 'CS-BC-01',
        title: 'EVM Architecture, Gas Economics & Solidity Basics',
        youtubeUrl: 'https://www.youtube.com/embed/gyMwXuJrbJQ',
        instruction: 'Understanding state storage slots, calldata vs memory, gas optimization, and basic smart contract structure.',
        orderNumber: 1,
      },
      {
        id: 'lesson-bc-02',
        courseId: 'CS-BC-01',
        title: 'Deploying & Testing Smart Contracts with Hardhat',
        youtubeUrl: 'https://www.youtube.com/embed/M576WGiDBdQ',
        instruction: 'Writing automated unit tests in JavaScript/TypeScript, configuring testnets, and deploying to Ethereum Sepolia.',
        orderNumber: 2,
      },
      {
        id: 'lesson-bc-03',
        courseId: 'CS-BC-01',
        title: 'Zero-PII Digital Certificate Registry Implementation',
        youtubeUrl: 'https://www.youtube.com/embed/1v_4S99G5lI',
        instruction: 'Hashing document payloads with SHA-256 and anchoring immutable verification proofs onto the public ledger.',
        orderNumber: 3,
      },
    ],
  },
  {
    id: 'CS-SEC-01',
    title: 'Offensive & Defensive Cybersecurity Engineering',
    category: 'Cybersecurity',
    description: 'Practical penetration testing, defensive threat hunting, incident response protocols, and enterprise zero-trust security postures.',
    price: 1450,
    thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    skills: ['Penetration Testing', 'SIEM & Threat Hunting', 'Cryptography', 'Smart Contract Auditing', 'Zero Trust'],
    durationHours: 75,
    instructor: 'Marcus Vance, CISSP',
    createdAt: '2026-01-20',
    lessons: [
      {
        id: 'lesson-sec-01',
        courseId: 'CS-SEC-01',
        title: 'Threat Modeling & Network Attack Vectors',
        youtubeUrl: 'https://www.youtube.com/embed/3Kq1MIfTWCE',
        instruction: 'Discover common attack surfaces, vulnerability scanning methodologies, and perimeter defense strategies.',
        orderNumber: 1,
      },
      {
        id: 'lesson-sec-02',
        courseId: 'CS-SEC-01',
        title: 'Cryptography & Public Key Infrastructure (PKI)',
        youtubeUrl: 'https://www.youtube.com/embed/GSIDS_lvRv4',
        instruction: 'Symmetric vs asymmetric ciphers, digital signatures, hashing algorithms, and SSL/TLS handshakes.',
        orderNumber: 2,
      },
    ],
  },
  {
    id: 'CS-CLOUD-01',
    title: 'Enterprise Cloud Architecture & Distributed Systems',
    category: 'Cloud Computing',
    description: 'Design and deployment of highly available, resilient cloud applications with Kubernetes orchestration, Terraform, and multi-region failover.',
    price: 1100,
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    skills: ['Kubernetes', 'Terraform', 'Microservices', 'Cloud Resilience', 'Chaos Engineering'],
    durationHours: 50,
    instructor: 'Elena Rostova (Cloud Architect)',
    createdAt: '2026-02-01',
    lessons: [
      {
        id: 'lesson-cloud-01',
        courseId: 'CS-CLOUD-01',
        title: 'Cloud Architecture Patterns & Multi-Region Design',
        youtubeUrl: 'https://www.youtube.com/embed/ia__Z_XnBf8',
        instruction: 'High-availability infrastructure design, load balancing strategies, and disaster recovery planning.',
        orderNumber: 1,
      },
    ],
  },
];

export const INITIAL_ENROLLMENTS: Enrollment[] = [
  {
    id: 'enroll-1',
    userId: 'user-student-01',
    courseId: 'CS-AI-01',
    purchasePrice: 645,
    enrolledAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'enroll-2',
    userId: 'user-student-01',
    courseId: 'CS-BC-01',
    purchasePrice: 0,
    enrolledAt: '2026-02-15T14:30:00Z',
  },
];

export const INITIAL_PROGRESS: LessonProgress[] = [
  // CS-AI-01 has 3 lessons, student completed 2:
  {
    userId: 'user-student-01',
    lessonId: 'lesson-ai-01',
    courseId: 'CS-AI-01',
    isCompleted: true,
    completedAt: '2026-02-02T11:00:00Z',
  },
  {
    userId: 'user-student-01',
    lessonId: 'lesson-ai-02',
    courseId: 'CS-AI-01',
    isCompleted: true,
    completedAt: '2026-02-04T15:00:00Z',
  },
  // CS-BC-01 has 3 lessons, student completed all 3 (100% - Eligible for Certificate!):
  {
    userId: 'user-student-01',
    lessonId: 'lesson-bc-01',
    courseId: 'CS-BC-01',
    isCompleted: true,
    completedAt: '2026-02-16T09:00:00Z',
  },
  {
    userId: 'user-student-01',
    lessonId: 'lesson-bc-02',
    courseId: 'CS-BC-01',
    isCompleted: true,
    completedAt: '2026-02-17T10:00:00Z',
  },
  {
    userId: 'user-student-01',
    lessonId: 'lesson-bc-03',
    courseId: 'CS-BC-01',
    isCompleted: true,
    completedAt: '2026-02-18T16:00:00Z',
  },
];

export const INITIAL_CERTIFICATES: CertificateRecord[] = [
  {
    id: 'cert-rec-1',
    certId: 'NC-2026-BC01',
    courseId: 'CS-BC-01',
    courseTitle: 'Ethereum Smart Contracts & Web3 Decentralized Architecture',
    studentId: 'user-student-01',
    studentName: 'Alexander Vance',
    recipientAddress: '0x30035Ca790093E941bf4AD0f60056c7Bd7995A10',
    issueDate: '2026-02-20',
    grade: 'Pass with Distinction',
    issuerName: 'Dr. Arisara Thorne (NextChapter)',
    notes: 'Completed all 3 core lessons and passed final blockchain project evaluation.',
    generatedPdfHash: '0x9b76c8c49e7bdfa189f81a7b82fe89c8a6b1e6042db621a644485591d8e12470',
    txHash: '0x3a4f8d9b1c7e62a45d0f81c9e3b4a2d7f5e8c1b9a6d4e2f7c0b8a5d3f1e9c2b4',
    isRevoked: false,
  },
];
