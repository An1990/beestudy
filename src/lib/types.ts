// ===== 学科与教材 =====
export type SubjectCode = 'chinese' | 'math' | 'english';

export interface Subject {
  code: SubjectCode;
  name: string;
  icon: string;
  color: string;
  publisher: string; // 统编版 / 北京版
}

export interface KnowledgePoint {
  id: string;
  subjectCode: SubjectCode;
  unitTitle: string;
  title: string;
  grade: number;
  term: 'spring' | 'autumn';
  verificationStatus: 'draft' | 'verified' | 'archived';
}

// ===== 任务 =====
export type TaskType = 'review' | 'mental_math' | 'homework' | 'wrong_question' | 'preview' | 'habit' | 'quiz' | 'reading' | 'writing' | 'listening' | 'speaking';
export type TaskStatus = 'planned' | 'in_progress' | 'submitted' | 'completed' | 'needs_revision' | 'cancelled';

export interface StudyTask {
  id: string;
  studentId: string;
  subjectCode: SubjectCode;
  title: string;
  description: string;
  taskType: TaskType;
  knowledgePointId?: string;
  plannedDate: string;
  estimatedMinutes: number;
  priority: 1 | 2 | 3;
  completionCriteria: string;
  requiresParentReview: boolean;
  status: TaskStatus;
  sortOrder: number;
  actualMinutes?: number;
  selfAssessment?: 'easy' | 'okay' | 'hard' | 'need_help';
  pointsReward: number;
  createdAt: string;
  // 竖式题目格式
  verticalLines?: string[];
  verticalOperator?: string;
}

// ===== 错题 =====
export type WrongQuestionStatus = 'open' | 'reviewing' | 'provisionally_resolved' | 'archived';
export type ErrorReason = 'calculation' | 'misread' | 'concept' | 'omitted_step' | 'unknown' | 'other';

export interface WrongQuestion {
  id: string;
  studentId: string;
  subjectCode: SubjectCode;
  prompt: string;
  studentAnswer: string;
  correctAnswer: string;
  explanation: string;
  errorReason: ErrorReason;
  knowledgePointId?: string;
  status: WrongQuestionStatus;
  firstWrongAt: string;
  lastReviewedAt?: string;
  nextReviewDate?: string;
  reviewCount: number;
}

// ===== 积分 =====
export interface PointLedger {
  id: string;
  studentId: string;
  pointsDelta: number;
  eventType: string;
  sourceType: string;
  sourceId: string;
  note: string;
  createdAt: string;
}

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  enabled: boolean;
  icon: string;
}

export interface Redemption {
  id: string;
  studentId: string;
  rewardItemId: string;
  rewardName: string;
  pointsCost: number;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  requestedAt: string;
  decisionNote?: string;
}

// ===== 成长 =====
export interface DailyReport {
  date: string;
  plannedTasks: number;
  completedTasks: number;
  pendingReview: number;
  needsRevision: number;
  studyMinutes: number;
  pointsEarned: number;
  reviewItems: number;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  completionRate: number;
  totalStudyMinutes: number;
  avgStudyMinutes: number;
  wrongQuestionsCorrected: number;
  pointsEarned: number;
  dailyData: DailyReport[];
}

// ===== 用户 =====
export type UserRole = 'parent' | 'child';

export interface User {
  id: string;
  displayName: string;
  role: UserRole;
  avatar?: string;
}

export interface Student {
  id: string;
  nickname: string;
  grade: number;
  term: 'spring' | 'autumn';
  level: number;
  xp: number;
  xpToNext: number;
  totalPoints: number;
  streak: number;
  avatar: string;
}
