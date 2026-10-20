import type { Subject, KnowledgePoint, StudyTask, WrongQuestion, PointLedger, RewardItem, Redemption, DailyReport, Student, User } from './types';

// ===== 学科配置 =====
export const subjects: Subject[] = [
  { code: 'chinese', name: '语文', icon: '', color: '#ef4444', publisher: '统编版' },
  { code: 'math', name: '数学', icon: '🔢', color: '#3b82f6', publisher: '北京版' },
  { code: 'english', name: '英语', icon: '🔤', color: '#10b981', publisher: '北京版' },
];

// ===== 学生信息 =====
export const currentStudent: Student = {
  id: 'student-1',
  nickname: '小明',
  grade: 2,
  term: 'autumn',
  level: 7,
  xp: 3450,
  xpToNext: 4000,
  totalPoints: 12850,
  streak: 5,
  avatar: '',
};

export const currentUser: User = {
  id: 'user-1',
  displayName: '小明',
  role: 'child',
};

export const parentUser: User = {
  id: 'user-parent-1',
  displayName: '妈妈',
  role: 'parent',
};

// ===== 知识点（语文-统编版 二年级上） =====
export const knowledgePoints: KnowledgePoint[] = [
  // 语文 - 统编版 二年级上
  { id: 'kp-c1', subjectCode: 'chinese', unitTitle: '第一单元 课文', title: '小蝌蚪找妈妈', grade: 2, term: 'autumn', verificationStatus: 'verified' },
  { id: 'kp-c2', subjectCode: 'chinese', unitTitle: '第一单元 课文', title: '我是什么', grade: 2, term: 'autumn', verificationStatus: 'verified' },
  { id: 'kp-c3', subjectCode: 'chinese', unitTitle: '第一单元 课文', title: '植物妈妈有办法', grade: 2, term: 'autumn', verificationStatus: 'verified' },
  { id: 'kp-c4', subjectCode: 'chinese', unitTitle: '第二单元 识字', title: '场景歌', grade: 2, term: 'autumn', verificationStatus: 'verified' },
  { id: 'kp-c5', subjectCode: 'chinese', unitTitle: '第二单元 识字', title: '树之歌', grade: 2, term: 'autumn', verificationStatus: 'verified' },
  { id: 'kp-c6', subjectCode: 'chinese', unitTitle: '第三单元 课文', title: '曹冲称象', grade: 2, term: 'autumn', verificationStatus: 'verified' },
  { id: 'kp-c7', subjectCode: 'chinese', unitTitle: '第三单元 课文', title: '红马的故事', grade: 2, term: 'autumn', verificationStatus: 'verified' },
  { id: 'kp-c8', subjectCode: 'chinese', unitTitle: '语文园地', title: '写话：我最喜欢的玩具', grade: 2, term: 'autumn', verificationStatus: 'verified' },

  // 数学 - 北京版 二年级上
  { id: 'kp-m1', subjectCode: 'math', unitTitle: '第一单元 认识厘米和米', title: '认识厘米', grade: 2, term: 'autumn', verificationStatus: 'verified' },
  { id: 'kp-m2', subjectCode: 'math', unitTitle: '第一单元 认识厘米和米', title: '认识米', grade: 2, term: 'autumn', verificationStatus: 'verified' },
  { id: 'kp-m3', subjectCode: 'math', unitTitle: '第二单元 表内乘法', title: '乘法的初步认识', grade: 2, term: 'autumn', verificationStatus: 'verified' },
  { id: 'kp-m4', subjectCode: 'math', unitTitle: '第二单元 表内乘法', title: '2-5的乘法口诀', grade: 2, term: 'autumn', verificationStatus: 'verified' },
  { id: 'kp-m5', subjectCode: 'math', unitTitle: '第二单元 表内乘法', title: '6-9的乘法口诀', grade: 2, term: 'autumn', verificationStatus: 'verified' },
  { id: 'kp-m6', subjectCode: 'math', unitTitle: '第三单元 角的初步认识', title: '认识角', grade: 2, term: 'autumn', verificationStatus: 'verified' },
  { id: 'kp-m7', subjectCode: 'math', unitTitle: '第四单元 表内除法', title: '除法的初步认识', grade: 2, term: 'autumn', verificationStatus: 'verified' },

  // 英语 - 北京版 二年级上
  { id: 'kp-e1', subjectCode: 'english', unitTitle: 'Unit 1 My Family', title: 'Family Members', grade: 2, term: 'autumn', verificationStatus: 'verified' },
  { id: 'kp-e2', subjectCode: 'english', unitTitle: 'Unit 1 My Family', title: 'This is my father/mother', grade: 2, term: 'autumn', verificationStatus: 'verified' },
  { id: 'kp-e3', subjectCode: 'english', unitTitle: 'Unit 2 My School', title: 'Classroom Objects', grade: 2, term: 'autumn', verificationStatus: 'verified' },
  { id: 'kp-e4', subjectCode: 'english', unitTitle: 'Unit 2 My School', title: 'Whats in your schoolbag', grade: 2, term: 'autumn', verificationStatus: 'verified' },
  { id: 'kp-e5', subjectCode: 'english', unitTitle: 'Unit 3 My Body', title: 'Body Parts', grade: 2, term: 'autumn', verificationStatus: 'verified' },
  { id: 'kp-e6', subjectCode: 'english', unitTitle: 'Unit 4 My Day', title: 'Daily Activities', grade: 2, term: 'autumn', verificationStatus: 'verified' },
];

// ===== 今日任务 =====
const today = new Date().toISOString().split('T')[0];

export const todayTasks: StudyTask[] = [
  {
    id: 'task-1', studentId: 'student-1', subjectCode: 'math',
    title: '乘法口诀练习（2-5）', description: '完成20道乘法口算题，重点练习2-5的乘法口诀',
    taskType: 'mental_math', knowledgePointId: 'kp-m4', plannedDate: today,
    estimatedMinutes: 10, priority: 1, completionCriteria: '正确率达到80%以上',
    requiresParentReview: false, status: 'planned', sortOrder: 0, pointsReward: 5, createdAt: today,
  },
  {
    id: 'task-2', studentId: 'student-1', subjectCode: 'chinese',
    title: '朗读《小蝌蚪找妈妈》', description: '有感情地朗读课文第1-3自然段，注意标点停顿',
    taskType: 'reading', knowledgePointId: 'kp-c1', plannedDate: today,
    estimatedMinutes: 15, priority: 1, completionCriteria: '流利朗读，注意语气',
    requiresParentReview: true, status: 'planned', sortOrder: 1, pointsReward: 5, createdAt: today,
  },
  {
    id: 'task-3', studentId: 'student-1', subjectCode: 'english',
    title: 'Unit 1 单词复习', description: '复习家庭成员单词：father, mother, brother, sister, grandfather, grandmother',
    taskType: 'review', knowledgePointId: 'kp-e1', plannedDate: today,
    estimatedMinutes: 10, priority: 2, completionCriteria: '能正确拼读所有单词',
    requiresParentReview: false, status: 'planned', sortOrder: 2, pointsReward: 3, createdAt: today,
  },
  {
    id: 'task-4', studentId: 'student-1', subjectCode: 'math',
    title: '认识厘米 - 课后练习', description: '完成课本第8页练习题，用尺子测量家中物品长度',
    taskType: 'homework', knowledgePointId: 'kp-m1', plannedDate: today,
    estimatedMinutes: 15, priority: 2, completionCriteria: '完成全部练习题',
    requiresParentReview: true, status: 'planned', sortOrder: 3, pointsReward: 5, createdAt: today,
  },
  {
    id: 'task-5', studentId: 'student-1', subjectCode: 'chinese',
    title: '写字练习：第一单元生字', description: '练习书写"两、哪、宽、顶"等生字，每个写3遍',
    taskType: 'writing', knowledgePointId: 'kp-c1', plannedDate: today,
    estimatedMinutes: 20, priority: 2, completionCriteria: '字迹工整，笔顺正确',
    requiresParentReview: true, status: 'planned', sortOrder: 4, pointsReward: 5, createdAt: today,
  },
  {
    id: 'task-6', studentId: 'student-1', subjectCode: 'english',
    title: '英语听力：Unit 1对话', description: '听Unit 1课文录音2遍，跟读对话',
    taskType: 'listening', knowledgePointId: 'kp-e2', plannedDate: today,
    estimatedMinutes: 10, priority: 3, completionCriteria: '能跟读对话内容',
    requiresParentReview: false, status: 'planned', sortOrder: 5, pointsReward: 3, createdAt: today,
  },
  {
    id: 'task-7', studentId: 'student-1', subjectCode: 'math',
    title: '错题订正：长度单位换算', description: '订正昨天的错题，理解厘米和米的关系',
    taskType: 'wrong_question', knowledgePointId: 'kp-m2', plannedDate: today,
    estimatedMinutes: 5, priority: 1, completionCriteria: '理解1米=100厘米',
    requiresParentReview: false, status: 'planned', sortOrder: 6, pointsReward: 3, createdAt: today,
  },
];

// ===== 错题 =====
export const wrongQuestions: WrongQuestion[] = [
  {
    id: 'wq-1', studentId: 'student-1', subjectCode: 'math',
    prompt: '1米 = (  ) 厘米', studentAnswer: '10', correctAnswer: '100',
    explanation: '1米等于100厘米，米和厘米之间的进率是100',
    errorReason: 'concept', knowledgePointId: 'kp-m2',
    status: 'open', firstWrongAt: '2026-10-14', nextReviewDate: '2026-10-16', reviewCount: 0,
  },
  {
    id: 'wq-2', studentId: 'student-1', subjectCode: 'math',
    prompt: '3 × 4 = (  )', studentAnswer: '7', correctAnswer: '12',
    explanation: '3×4表示3个4相加，即4+4+4=12，不是3+4=7',
    errorReason: 'concept', knowledgePointId: 'kp-m4',
    status: 'reviewing', firstWrongAt: '2026-10-13', lastReviewedAt: '2026-10-14', nextReviewDate: '2026-10-17', reviewCount: 1,
  },
  {
    id: 'wq-3', studentId: 'student-1', subjectCode: 'chinese',
    prompt: '"蝌"字的拼音是？', studentAnswer: 'kē', correctAnswer: 'kē',
    explanation: '"蝌"读kē，注意和"科"同音',
    errorReason: 'misread', knowledgePointId: 'kp-c1',
    status: 'provisionally_resolved', firstWrongAt: '2026-10-10', lastReviewedAt: '2026-10-14', reviewCount: 2,
  },
  {
    id: 'wq-4', studentId: 'student-1', subjectCode: 'english',
    prompt: '翻译：这是我的妈妈。', studentAnswer: 'This is my father.', correctAnswer: 'This is my mother.',
    explanation: '妈妈是mother，爸爸是father，注意区分',
    errorReason: 'misread', knowledgePointId: 'kp-e1',
    status: 'open', firstWrongAt: '2026-10-14', nextReviewDate: '2026-10-16', reviewCount: 0,
  },
  {
    id: 'wq-5', studentId: 'student-1', subjectCode: 'math',
    prompt: '5 × 6 = (  )', studentAnswer: '25', correctAnswer: '30',
    explanation: '5×6=30，五六三十。注意不是5×5=25',
    errorReason: 'calculation', knowledgePointId: 'kp-m5',
    status: 'open', firstWrongAt: '2026-10-14', nextReviewDate: '2026-10-16', reviewCount: 0,
  },
];

// ===== 积分流水 =====
export const pointLedger: PointLedger[] = [
  { id: 'pl-1', studentId: 'student-1', pointsDelta: 5, eventType: 'task_completed', sourceType: 'task', sourceId: 'task-1', note: '完成乘法口诀练习', createdAt: '2026-10-14T10:30:00Z' },
  { id: 'pl-2', studentId: 'student-1', pointsDelta: 5, eventType: 'task_completed', sourceType: 'task', sourceId: 'task-2', note: '完成朗读任务', createdAt: '2026-10-14T11:00:00Z' },
  { id: 'pl-3', studentId: 'student-1', pointsDelta: 3, eventType: 'task_checked', sourceType: 'task', sourceId: 'task-1', note: '完成后检查了答案', createdAt: '2026-10-14T10:32:00Z' },
  { id: 'pl-4', studentId: 'student-1', pointsDelta: 3, eventType: 'wrong_question_corrected', sourceType: 'wrong_question', sourceId: 'wq-3', note: '订正了拼音错题', createdAt: '2026-10-14T14:00:00Z' },
  { id: 'pl-5', studentId: 'student-1', pointsDelta: 5, eventType: 'daily_plan_completed', sourceType: 'daily_plan', sourceId: 'dp-1', note: '完成当日全部计划', createdAt: '2026-10-14T16:00:00Z' },
  { id: 'pl-6', studentId: 'student-1', pointsDelta: -10, eventType: 'reward_redemption', sourceType: 'redemption', sourceId: 'rd-1', note: '兑换：亲子桌游', createdAt: '2026-10-13T18:00:00Z' },
  { id: 'pl-7', studentId: 'student-1', pointsDelta: 2, eventType: 'task_started_on_time', sourceType: 'task', sourceId: 'task-1', note: '按时开始任务', createdAt: '2026-10-14T10:00:00Z' },
];

// ===== 奖励项目 =====
export const rewardItems: RewardItem[] = [
  { id: 'rw-1', name: '亲子桌游时间', description: '和家人一起玩一次桌游', pointsCost: 10, enabled: true, icon: '🎲' },
  { id: 'rw-2', name: '看一集动画片', description: '可以看一集喜欢的动画片', pointsCost: 15, enabled: true, icon: '📺' },
  { id: 'rw-3', name: '选择周末活动', description: '可以决定周末家庭活动', pointsCost: 30, enabled: true, icon: '🎉' },
  { id: 'rw-4', name: '小零食奖励', description: '可以选一种喜欢的小零食', pointsCost: 8, enabled: true, icon: '🍪' },
  { id: 'rw-5', name: '多玩15分钟', description: '自由活动时间增加15分钟', pointsCost: 12, enabled: true, icon: '⏰' },
  { id: 'rw-6', name: '选一本新书', description: '可以去书店选一本新书', pointsCost: 25, enabled: true, icon: '📚' },
];

// ===== 兑换记录 =====
export const redemptions: Redemption[] = [
  { id: 'rd-1', studentId: 'student-1', rewardItemId: 'rw-1', rewardName: '亲子桌游时间', pointsCost: 10, status: 'fulfilled', requestedAt: '2026-10-13T15:00:00Z' },
  { id: 'rd-2', studentId: 'student-1', rewardItemId: 'rw-4', rewardName: '小零食奖励', pointsCost: 8, status: 'approved', requestedAt: '2026-10-15T09:00:00Z' },
  { id: 'rd-3', studentId: 'student-1', rewardItemId: 'rw-2', rewardName: '看一集动画片', pointsCost: 15, status: 'pending', requestedAt: '2026-10-15T10:00:00Z' },
];

// ===== 成长报告 =====
export const dailyReports: DailyReport[] = [
  { date: '2026-10-09', plannedTasks: 5, completedTasks: 5, pendingReview: 0, needsRevision: 0, studyMinutes: 55, pointsEarned: 18, reviewItems: 1 },
  { date: '2026-10-10', plannedTasks: 6, completedTasks: 5, pendingReview: 1, needsRevision: 0, studyMinutes: 62, pointsEarned: 15, reviewItems: 2 },
  { date: '2026-10-11', plannedTasks: 5, completedTasks: 5, pendingReview: 0, needsRevision: 0, studyMinutes: 50, pointsEarned: 20, reviewItems: 0 },
  { date: '2026-10-12', plannedTasks: 4, completedTasks: 3, pendingReview: 1, needsRevision: 1, studyMinutes: 40, pointsEarned: 10, reviewItems: 2 },
  { date: '2026-10-13', plannedTasks: 6, completedTasks: 6, pendingReview: 0, needsRevision: 0, studyMinutes: 68, pointsEarned: 22, reviewItems: 1 },
  { date: '2026-10-14', plannedTasks: 7, completedTasks: 7, pendingReview: 0, needsRevision: 0, studyMinutes: 72, pointsEarned: 23, reviewItems: 1 },
  { date: today, plannedTasks: 7, completedTasks: 2, pendingReview: 1, needsRevision: 0, studyMinutes: 25, pointsEarned: 8, reviewItems: 2 },
];

// ===== 任务类型映射 =====
export const taskTypeLabels: Record<string, { label: string; icon: string; color: string }> = {
  review: { label: '复习', icon: '🔄', color: 'bg-blue-100 text-blue-700' },
  mental_math: { label: '口算', icon: '🧮', color: 'bg-purple-100 text-purple-700' },
  homework: { label: '作业', icon: '📝', color: 'bg-amber-100 text-amber-700' },
  wrong_question: { label: '错题订正', icon: '️', color: 'bg-red-100 text-red-700' },
  preview: { label: '预习', icon: '', color: 'bg-cyan-100 text-cyan-700' },
  habit: { label: '习惯', icon: '⭐', color: 'bg-yellow-100 text-yellow-700' },
  quiz: { label: '小测', icon: '', color: 'bg-indigo-100 text-indigo-700' },
  reading: { label: '朗读', icon: '', color: 'bg-rose-100 text-rose-700' },
  writing: { label: '写字', icon: '✍️', color: 'bg-teal-100 text-teal-700' },
  listening: { label: '听力', icon: '🎧', color: 'bg-violet-100 text-violet-700' },
  speaking: { label: '口语', icon: '🗣️', color: 'bg-orange-100 text-orange-700' },
};

// ===== 任务状态映射 =====
export const taskStatusLabels: Record<string, { label: string; color: string; bgColor: string }> = {
  planned: { label: '待开始', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  in_progress: { label: '进行中', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  submitted: { label: '待验收', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  completed: { label: '已完成', color: 'text-green-600', bgColor: 'bg-green-100' },
  needs_revision: { label: '需订正', color: 'text-red-600', bgColor: 'bg-red-100' },
  cancelled: { label: '已取消', color: 'text-gray-400', bgColor: 'bg-gray-50' },
};

// ===== 错误原因映射 =====
export const errorReasonLabels: Record<string, string> = {
  calculation: '计算错误',
  misread: '看错题目',
  concept: '概念不熟',
  omitted_step: '步骤遗漏',
  unknown: '不会做',
  other: '其他',
};
