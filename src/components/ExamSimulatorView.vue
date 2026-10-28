<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStudyStore } from '../composables/useStudyStore';
import confetti from 'canvas-confetti';
import { 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Flag, 
  AlertTriangle, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Sparkles, 
  Award, 
  BarChart3,
  HelpCircle,
  Eye,
  Pause,
  Play,
  Printer
} from 'lucide-vue-next';

const store = useStudyStore();

// Exam states: 'menu' | 'active' | 'result'
const examState = ref('menu');

// Selected mode/test config
const currentTestType = ref('simulation'); // 'simulation' | 'test_a' | 'test_b' | 'domain_sample'
const practiceImmediateFeedback = ref(false);

// Active exam session data
const activeQuestions = ref([]);
const currentIndex = ref(0);
const userAnswers = ref({}); // { [questionId]: 'A' | 'B' | 'C' | 'D' }
const flaggedQuestions = ref(new Set());
const checkedAnswers = ref(new Set()); // For immediate practice mode
const timeRemaining = ref(120 * 60); // Seconds
const isTimerPaused = ref(false);
let timerInterval = null;

// Submission modal
const showSubmitModal = ref(false);

// Results data
const examResult = ref(null);
const reviewFilter = ref('all'); // 'all' | 'incorrect' | 'flagged'
const reviewDomainFilter = ref('ALL'); // 'ALL' | 'Domain 1' | 'Domain 2' | 'Domain 3' | 'Domain 4'

// Saved session recovery
const savedSession = ref(null);

onMounted(() => {
  try {
    const raw = localStorage.getItem('ai200_active_session');
    if (raw) {
      savedSession.value = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load saved session:', e);
  }
});

function persistSession() {
  if (examState.value === 'active' && activeQuestions.value.length > 0) {
    const sessionData = {
      testType: currentTestType.value,
      title: activeQuestions.value[0]?.set,
      questions: activeQuestions.value,
      currentIndex: currentIndex.value,
      userAnswers: userAnswers.value,
      flagged: Array.from(flaggedQuestions.value),
      checked: Array.from(checkedAnswers.value),
      timeRemaining: timeRemaining.value,
      practiceImmediateFeedback: practiceImmediateFeedback.value,
      timestamp: Date.now()
    };
    try {
      localStorage.setItem('ai200_active_session', JSON.stringify(sessionData));
    } catch (e) {}
  }
}

function resumeSession() {
  if (!savedSession.value) return;
  currentTestType.value = savedSession.value.testType;
  activeQuestions.value = savedSession.value.questions;
  currentIndex.value = savedSession.value.currentIndex || 0;
  userAnswers.value = savedSession.value.userAnswers || {};
  flaggedQuestions.value = new Set(savedSession.value.flagged || []);
  checkedAnswers.value = new Set(savedSession.value.checked || []);
  timeRemaining.value = savedSession.value.timeRemaining;
  practiceImmediateFeedback.value = !!savedSession.value.practiceImmediateFeedback;
  isTimerPaused.value = false;

  savedSession.value = null;
  startTimer();
  examState.value = 'active';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function discardSession() {
  localStorage.removeItem('ai200_active_session');
  savedSession.value = null;
}

// Filter questions by test type
function setupExam(type, domainFilter = 'ALL') {
  currentTestType.value = type;
  let qList = [];
  let duration = 120 * 60; // 120 mins

  if (type === 'simulation') {
    qList = store.questions.filter(q => q.category === 'simulation');
    duration = 120 * 60;
    practiceImmediateFeedback.value = false;
  } else if (type === 'test_a') {
    qList = store.questions.filter(q => q.category === 'test_a');
    duration = 45 * 60;
    practiceImmediateFeedback.value = false;
  } else if (type === 'test_b') {
    qList = store.questions.filter(q => q.category === 'test_b');
    duration = 45 * 60;
    practiceImmediateFeedback.value = false;
  } else if (type === 'domain_sample') {
    qList = store.questions.filter(q => {
      if (q.category !== 'domain_sample') return false;
      if (domainFilter !== 'ALL' && q.domain !== domainFilter) return false;
      return true;
    });
    duration = 60 * 60;
    practiceImmediateFeedback.value = true;
  }

  activeQuestions.value = qList;
  currentIndex.value = 0;
  userAnswers.value = {};
  flaggedQuestions.value.clear();
  checkedAnswers.value.clear();
  timeRemaining.value = duration;
  isTimerPaused.value = false;

  startTimer();
  examState.value = 'active';
  persistSession();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!isTimerPaused.value && timeRemaining.value > 0) {
      timeRemaining.value--;
      if (timeRemaining.value === 0) {
        finishExam();
      }
    }
  }, 1000);
}

function toggleTimerPause() {
  isTimerPaused.value = !isTimerPaused.value;
}

const formattedTime = computed(() => {
  const m = Math.floor(timeRemaining.value / 60);
  const s = timeRemaining.value % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

const currentQ = computed(() => {
  return activeQuestions.value[currentIndex.value] || null;
});

const answeredCount = computed(() => {
  return Object.keys(userAnswers.value).length;
});

const unansweredCount = computed(() => {
  return activeQuestions.value.length - answeredCount.value;
});

function selectOption(key) {
  if (!currentQ.value) return;
  userAnswers.value[currentQ.value.id] = key;
  persistSession();
}

function clearAnswer() {
  if (!currentQ.value) return;
  delete userAnswers.value[currentQ.value.id];
  checkedAnswers.value.delete(currentQ.value.id);
  persistSession();
}

function toggleFlag() {
  if (!currentQ.value) return;
  if (flaggedQuestions.value.has(currentQ.value.id)) {
    flaggedQuestions.value.delete(currentQ.value.id);
  } else {
    flaggedQuestions.value.add(currentQ.value.id);
  }
  persistSession();
}

function checkCurrentAnswer() {
  if (!currentQ.value) return;
  checkedAnswers.value.add(currentQ.value.id);
  persistSession();
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    persistSession();
  }
}

function nextQuestion() {
  if (currentIndex.value < activeQuestions.value.length - 1) {
    currentIndex.value++;
    persistSession();
  }
}

function jumpToQuestion(idx) {
  currentIndex.value = idx;
  persistSession();
}

function confirmSubmit() {
  showSubmitModal.value = true;
}

function printResult() {
  window.print();
}

function finishExam() {
  clearInterval(timerInterval);
  showSubmitModal.value = false;
  localStorage.removeItem('ai200_active_session');

  // Calculate scores
  let rawScore = 0;
  const domainBreakdown = {
    'Domain 1': { total: 0, correct: 0, target: 14 },
    'Domain 2': { total: 0, correct: 0, target: 17 },
    'Domain 3': { total: 0, correct: 0, target: 13 },
    'Domain 4': { total: 0, correct: 0, target: 12 }
  };

  activeQuestions.value.forEach(q => {
    const d = q.domain || 'Domain 1';
    if (!domainBreakdown[d]) {
      domainBreakdown[d] = { total: 0, correct: 0, target: 10 };
    }
    domainBreakdown[d].total++;

    const chosen = userAnswers.value[q.id];
    if (chosen && chosen === q.correctAnswer) {
      rawScore++;
      domainBreakdown[d].correct++;
    }
  });

  const total = activeQuestions.value.length;
  const percentage = Math.round((rawScore / total) * 100);
  // Microsoft Scaled score calculation (scaled to 1000, passing >= 700)
  const scaledScore = Math.round((rawScore / total) * 1000);
  const passed = scaledScore >= 700;
  const metStudyGate = rawScore >= (total === 60 ? 57 : Math.round(total * 0.95));

  const resultObj = {
    testType: currentTestType.value,
    set: activeQuestions.value[0]?.set || 'Exam',
    rawScore,
    totalQuestions: total,
    percentage,
    scaledScore,
    passed,
    metStudyGate,
    domainBreakdown,
    userAnswers: { ...userAnswers.value },
    flagged: Array.from(flaggedQuestions.value)
  };

  examResult.value = resultObj;
  store.saveExamResult(resultObj);
  examState.value = 'result';
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Confetti on passing!
  if (passed) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

const filteredReviewQuestions = computed(() => {
  if (!examResult.value) return [];
  return activeQuestions.value.filter(q => {
    const isCorrect = userAnswers.value[q.id] === q.correctAnswer;
    const isFlagged = flaggedQuestions.value.has(q.id);

    if (reviewFilter.value === 'incorrect' && isCorrect) return false;
    if (reviewFilter.value === 'flagged' && !isFlagged) return false;

    if (reviewDomainFilter.value !== 'ALL' && q.domain !== reviewDomainFilter.value) {
      return false;
    }
    return true;
  });
});

onUnmounted(() => {
  clearInterval(timerInterval);
});
</script>

<template>
  <div class="simulator-page">
    <!-- 1. EXAM SELECTOR MENU -->
    <div v-if="examState === 'menu'" class="menu-view">
      <!-- Unfinished Session Resume Banner -->
      <div v-if="savedSession" class="resume-session-banner card">
        <div class="resume-left">
          <div class="resume-icon">
            <Clock :size="24" />
          </div>
          <div>
            <h3 class="resume-title">Bạn có bài thi đang làm dở: {{ savedSession.title }}</h3>
            <p class="resume-desc">
              Thời gian còn lại: <strong>{{ Math.floor(savedSession.timeRemaining / 60) }} phút</strong> • 
              Đã trả lời: <strong>{{ Object.keys(savedSession.userAnswers || {}).length }}/{{ savedSession.questions?.length }} câu</strong>
            </p>
          </div>
        </div>
        <div class="resume-actions">
          <button class="btn btn-secondary btn-sm" @click="discardSession">
            Hủy bài này
          </button>
          <button class="btn btn-primary btn-sm" @click="resumeSession">
            <Play :size="14" />
            <span>Tiếp tục làm bài</span>
          </button>
        </div>
      </div>

      <div class="menu-hero">
        <h1 class="menu-title">Phòng Thi Thử AI-200 (Exam Simulator)</h1>
        <p class="menu-subtitle">
          Mô phỏng kỳ thi Microsoft AI-200 với thời gian thực, bảng điều hướng 60 câu hỏi, 
          chấm điểm theo thang điểm 1000 của Microsoft và giải thích chi tiết từng lựa chọn.
        </p>
      </div>

      <div class="test-cards-grid">
        <!-- Full 120-min Simulation -->
        <div class="test-card card featured">
          <div class="card-featured-badge">Kỳ thi chuẩn hóa</div>
          <div class="test-card-top">
            <div class="test-icon" style="background: rgba(0, 120, 212, 0.15); color: #0078d4;">
              <GraduationCap :size="28" />
            </div>
            <span class="badge badge-blue">Đề thi đầy đủ</span>
          </div>

          <h2 class="test-title">Full 120-Minute Simulation</h2>
          <p class="test-desc">
            Bài thi hoàn chỉnh 60 câu hỏi (F01 - F60) bao trọn 4 Domain theo đúng tỷ trọng của Microsoft. 
            Mục tiêu sẵn sàng: 57/60 câu (95%).
          </p>

          <div class="test-meta-grid">
            <div class="meta-cell">
              <span class="lbl">Số lượng câu:</span>
              <strong class="val">60 câu</strong>
            </div>
            <div class="meta-cell">
              <span class="lbl">Thời gian:</span>
              <strong class="val">120 phút</strong>
            </div>
            <div class="meta-cell">
              <span class="lbl">Điểm chuẩn qua:</span>
              <strong class="val">700 / 1000</strong>
            </div>
            <div class="meta-cell">
              <span class="lbl">Mục tiêu 95%:</span>
              <strong class="val highlight-green">57 / 60</strong>
            </div>
          </div>

          <button class="btn btn-primary btn-lg start-btn" @click="setupExam('simulation')">
            <GraduationCap :size="20" />
            <span>Bắt đầu thi thử 120 phút</span>
          </button>
        </div>

        <!-- Practice Test A -->
        <div class="test-card card">
          <div class="test-card-top">
            <div class="test-icon" style="background: rgba(16, 124, 65, 0.15); color: #107c41;">
              <Award :size="28" />
            </div>
            <span class="badge badge-green">45 Phút</span>
          </div>

          <h2 class="test-title">Practice Test A</h2>
          <p class="test-desc">
            Bộ 20 câu hỏi tình huống tính giờ (câu 79-98). Kiểm tra khả năng chẩn đoán startup, ACR Task triggers, 
            KEDA scale-to-zero và Cosmos DB partition query.
          </p>

          <div class="test-meta-grid">
            <div class="meta-cell">
              <span class="lbl">Số câu hỏi:</span>
              <strong class="val">20 câu</strong>
            </div>
            <div class="meta-cell">
              <span class="lbl">Thời gian:</span>
              <strong class="val">45 phút</strong>
            </div>
            <div class="meta-cell">
              <span class="lbl">Mục tiêu đỗ:</span>
              <strong class="val">19 / 20 (95%)</strong>
            </div>
            <div class="meta-cell">
              <span class="lbl">Độ khó:</span>
              <strong class="val">Trung bình - Khó</strong>
            </div>
          </div>

          <button class="btn btn-outline-azure start-btn" @click="setupExam('test_a')">
            <span>Bắt đầu Practice Test A</span>
          </button>
        </div>

        <!-- Practice Test B -->
        <div class="test-card card">
          <div class="test-card-top">
            <div class="test-icon" style="background: rgba(216, 59, 1, 0.15); color: #d83b01;">
              <Award :size="28" />
            </div>
            <span class="badge badge-orange">45 Phút</span>
          </div>

          <h2 class="test-title">Practice Test B</h2>
          <p class="test-desc">
            Bộ 20 câu hỏi tính giờ bổ trợ (câu 99-118). Luyện tập các kịch bản rollback an toàn, Key Vault rotation, 
            Distributed tracing OpenTelemetry và KQL queries.
          </p>

          <div class="test-meta-grid">
            <div class="meta-cell">
              <span class="lbl">Số câu hỏi:</span>
              <strong class="val">20 câu</strong>
            </div>
            <div class="meta-cell">
              <span class="lbl">Thời gian:</span>
              <strong class="val">45 phút</strong>
            </div>
            <div class="meta-cell">
              <span class="lbl">Mục tiêu đỗ:</span>
              <strong class="val">19 / 20 (95%)</strong>
            </div>
            <div class="meta-cell">
              <span class="lbl">Độ khó:</span>
              <strong class="val">Trung bình - Khó</strong>
            </div>
          </div>

          <button class="btn btn-outline-azure start-btn" @click="setupExam('test_b')">
            <span>Bắt đầu Practice Test B</span>
          </button>
        </div>

        <!-- Domain Sample Questions -->
        <div class="test-card card">
          <div class="test-card-top">
            <div class="test-icon" style="background: rgba(135, 100, 184, 0.15); color: #8764b8;">
              <Sparkles :size="28" />
            </div>
            <span class="badge badge-purple">Chế độ ôn tập</span>
          </div>

          <h2 class="test-title">Luyện tập câu hỏi theo Domain</h2>
          <p class="test-desc">
            36 câu hỏi mẫu (câu 31-66) với chế độ xem đáp án và giải thích ngay lập tức sau mỗi câu chọn.
          </p>

          <div class="test-meta-grid">
            <div class="meta-cell">
              <span class="lbl">Số câu:</span>
              <strong class="val">36 câu</strong>
            </div>
            <div class="meta-cell">
              <span class="lbl">Chế độ:</span>
              <strong class="val">Xem đáp án tức thì</strong>
            </div>
            <div class="meta-cell">
              <span class="lbl">Phản hồi:</span>
              <strong class="val">Giải thích chi tiết</strong>
            </div>
            <div class="meta-cell">
              <span class="lbl">Thời gian:</span>
              <strong class="val">Tự do</strong>
            </div>
          </div>

          <div class="domain-quick-chips">
            <button class="chip-btn" @click="setupExam('domain_sample', 'ALL')">Tất cả (36)</button>
            <button class="chip-btn" @click="setupExam('domain_sample', 'Domain 1')">D1 (10)</button>
            <button class="chip-btn" @click="setupExam('domain_sample', 'Domain 2')">D2 (12)</button>
            <button class="chip-btn" @click="setupExam('domain_sample', 'Domain 3')">D3 (8)</button>
            <button class="chip-btn" @click="setupExam('domain_sample', 'Domain 4')">D4 (6)</button>
          </div>

          <button class="btn btn-secondary start-btn" @click="setupExam('domain_sample', 'ALL')">
            <span>Luyện tập toàn bộ (36 câu)</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 2. ACTIVE EXAM VIEW -->
    <div v-else-if="examState === 'active'" class="active-exam-layout">
      <!-- Exam Control Bar -->
      <div class="exam-top-bar">
        <div class="exam-title-group">
          <span class="badge badge-blue">{{ activeQuestions[0]?.set }}</span>
          <span class="q-progress-text">Câu {{ currentIndex + 1 }} / {{ activeQuestions.length }}</span>
        </div>

        <!-- Timer -->
        <div class="timer-box" :class="{ 'timer-warning': timeRemaining < 15 * 60 }">
          <Clock :size="18" />
          <span class="timer-text">{{ formattedTime }}</span>
          <button class="pause-btn" :title="isTimerPaused ? 'Tiếp tục' : 'Tạm dừng'" @click="toggleTimerPause">
            <Play v-if="isTimerPaused" :size="14" />
            <Pause v-else :size="14" />
          </button>
        </div>

        <!-- Submit Button -->
        <button class="btn btn-primary" @click="confirmSubmit">
          <Send :size="16" />
          <span>Nộp bài thi</span>
        </button>
      </div>

      <div class="exam-main-grid">
        <!-- Question Pane -->
        <div class="question-pane card">
          <div class="q-header">
            <div class="q-tags">
              <span class="badge badge-muted">{{ currentQ?.domain }}</span>
              <span class="q-id-tag">Mã câu: {{ currentQ?.num }}</span>
            </div>
            
            <button 
              class="flag-btn" 
              :class="{ flagged: flaggedQuestions.has(currentQ?.id) }"
              @click="toggleFlag"
            >
              <Flag :size="16" />
              <span>{{ flaggedQuestions.has(currentQ?.id) ? 'Đã đánh dấu xem lại' : 'Đánh dấu xem lại' }}</span>
            </button>
          </div>

          <h2 class="q-title">{{ currentQ?.title }}</h2>
          <div class="q-body-text">{{ currentQ?.question }}</div>

          <!-- Options List -->
          <div class="options-container">
            <div 
              v-for="opt in currentQ?.options" 
              :key="opt.key"
              class="option-item"
              :class="{ 
                selected: userAnswers[currentQ?.id] === opt.key,
                correct: checkedAnswers.has(currentQ?.id) && opt.key === currentQ?.correctAnswer,
                incorrect: checkedAnswers.has(currentQ?.id) && userAnswers[currentQ?.id] === opt.key && opt.key !== currentQ?.correctAnswer
              }"
              @click="selectOption(opt.key)"
            >
              <div class="opt-key-circle">{{ opt.key }}</div>
              <div class="opt-text">{{ opt.text }}</div>
            </div>
          </div>

          <!-- Practice Immediate Feedback Box -->
          <div v-if="checkedAnswers.has(currentQ?.id)" class="feedback-box card">
            <div class="feedback-header">
              <div v-if="userAnswers[currentQ?.id] === currentQ?.correctAnswer" class="feedback-status success">
                <CheckCircle2 :size="18" />
                <span>Chính xác! Đáp án đúng là {{ currentQ?.correctAnswer }}</span>
              </div>
              <div v-else class="feedback-status fail">
                <XCircle :size="18" />
                <span>Chưa đúng! Đáp án chính xác là {{ currentQ?.correctAnswer }}</span>
              </div>
            </div>
            <div class="feedback-explanation">
              <strong>Giải thích theo chuẩn AI-200:</strong>
              <p>{{ currentQ?.explanation }}</p>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="q-footer">
            <div class="footer-left">
              <button class="btn btn-secondary btn-sm" @click="clearAnswer">
                <span>Xóa lựa chọn</span>
              </button>
              <button 
                v-if="practiceImmediateFeedback && !checkedAnswers.has(currentQ?.id)" 
                class="btn btn-outline-azure btn-sm"
                :disabled="!userAnswers[currentQ?.id]"
                @click="checkCurrentAnswer"
              >
                <Eye :size="14" />
                <span>Kiểm tra đáp án câu này</span>
              </button>
            </div>

            <div class="footer-right">
              <button class="btn btn-secondary" :disabled="currentIndex === 0" @click="prevQuestion">
                <ChevronLeft :size="18" />
                <span>Câu trước</span>
              </button>
              <button class="btn btn-primary" :disabled="currentIndex === activeQuestions.length - 1" @click="nextQuestion">
                <span>Câu tiếp theo</span>
                <ChevronRight :size="18" />
              </button>
            </div>
          </div>
        </div>

        <!-- Question Navigation Grid Sidebar -->
        <aside class="exam-sidebar card">
          <div class="sidebar-sec-title">Bảng điều hướng câu hỏi</div>
          
          <div class="status-summary">
            <div class="status-pill">
              <span class="dot answered"></span>
              <span>Đã trả lời: {{ answeredCount }}</span>
            </div>
            <div class="status-pill">
              <span class="dot unanswered"></span>
              <span>Chưa làm: {{ unansweredCount }}</span>
            </div>
            <div class="status-pill">
              <span class="dot flagged"></span>
              <span>Đánh dấu: {{ flaggedQuestions.size }}</span>
            </div>
          </div>

          <!-- 60 Question Grid -->
          <div class="palette-grid">
            <button
              v-for="(q, idx) in activeQuestions"
              :key="q.id"
              class="palette-btn"
              :class="{
                current: idx === currentIndex,
                answered: !!userAnswers[q.id],
                flagged: flaggedQuestions.has(q.id)
              }"
              @click="jumpToQuestion(idx)"
            >
              <span>{{ idx + 1 }}</span>
              <span v-if="flaggedQuestions.has(q.id)" class="flag-indicator"></span>
            </button>
          </div>

          <button class="btn btn-primary submit-sidebar-btn" @click="confirmSubmit">
            <Send :size="16" />
            <span>Nộp bài & Xem kết quả</span>
          </button>
        </aside>
      </div>

      <!-- Submit Modal -->
      <div v-if="showSubmitModal" class="modal-backdrop">
        <div class="modal-card card">
          <h3 class="modal-title">Xác nhận nộp bài thi</h3>
          <p class="modal-desc">Bạn có chắc chắn muốn kết thúc bài thi và nhận bảng điểm chi tiết?</p>

          <div class="modal-stats">
            <div class="m-stat">
              <span class="lbl">Tổng số câu hỏi:</span>
              <strong class="val">{{ activeQuestions.length }}</strong>
            </div>
            <div class="m-stat">
              <span class="lbl">Đã chọn đáp án:</span>
              <strong class="val highlight-green">{{ answeredCount }}</strong>
            </div>
            <div class="m-stat">
              <span class="lbl">Chưa trả lời:</span>
              <strong class="val highlight-orange">{{ unansweredCount }}</strong>
            </div>
            <div class="m-stat">
              <span class="lbl">Đang gắn cờ:</span>
              <strong class="val highlight">{{ flaggedQuestions.size }}</strong>
            </div>
          </div>

          <div v-if="unansweredCount > 0" class="modal-warning">
            <AlertTriangle :size="18" />
            <span>Còn {{ unansweredCount }} câu hỏi chưa chọn đáp án!</span>
          </div>

          <div class="modal-actions">
            <button class="btn btn-secondary" @click="showSubmitModal = false">
              Tiếp tục làm bài
            </button>
            <button class="btn btn-primary" @click="finishExam">
              Xác nhận nộp bài ngay
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. EXAM RESULTS & REVIEW VIEW -->
    <div v-else-if="examState === 'result'" class="result-view">
      <!-- Result Banner -->
      <div class="result-banner card" :class="examResult?.passed ? 'passed-card' : 'failed-card'">
        <div class="result-left">
          <div class="res-badge-box">
            <Award v-if="examResult?.passed" :size="36" />
            <AlertTriangle v-else :size="36" />
          </div>
          <div class="res-title-box">
            <div class="res-sub">{{ examResult?.set }}</div>
            <h1 class="res-status-title">
              {{ examResult?.passed ? 'CHÚC MỪNG! BẠN ĐÃ ĐẠT (PASS)' : 'CHƯA ĐẠT ĐIỂM CHUẨN (FAIL)' }}
            </h1>
            <p class="res-desc">
              {{ examResult?.passed 
                ? 'Điểm thi của bạn vượt qua ngưỡng 700/1000 theo chuẩn Microsoft Scaled Score.' 
                : 'Bạn cần đạt tối thiểu 700/1000 điểm để vượt qua kỳ thi AI-200. Hãy ôn lại các phần bị yếu.' }}
            </p>
          </div>
        </div>

        <div class="result-right">
          <div class="score-circle">
            <div class="score-num">{{ examResult?.scaledScore }}</div>
            <div class="score-max">/ 1000 Điểm</div>
          </div>
          <div class="raw-score-tag">
            Đúng: {{ examResult?.rawScore }} / {{ examResult?.totalQuestions }} câu ({{ examResult?.percentage }}%)
          </div>
          <div class="target-status" :class="examResult?.metStudyGate ? 'target-met' : 'target-miss'">
            Mục tiêu sẵn sàng 95%: {{ examResult?.metStudyGate ? 'ĐÃ ĐẠT' : 'CHƯA ĐẠT (Mục tiêu 57/60)' }}
          </div>
        </div>
      </div>

      <!-- Domain Breakdown Scorecard -->
      <div class="domain-breakdown-card card">
        <h2 class="breakdown-title">
          <BarChart3 :size="20" />
          <span>Kết quả theo từng Domain</span>
        </h2>

        <div class="domains-score-grid">
          <div 
            v-for="(val, dKey) in examResult?.domainBreakdown" 
            :key="dKey"
            class="domain-score-box"
          >
            <div class="d-top">
              <span class="d-name">{{ dKey }}</span>
              <span class="d-val">{{ val.correct }} / {{ val.total }} câu</span>
            </div>
            <div class="progress-track">
              <div 
                class="progress-fill" 
                :style="{ 
                  width: `${val.total ? (val.correct/val.total)*100 : 0}%`,
                  background: (val.correct / val.total) >= 0.9 ? '#107c41' : ((val.correct / val.total) >= 0.7 ? '#0078d4' : '#d83b01')
                }"
              ></div>
            </div>
            <div class="d-target-note">
              Ngưỡng đề xuất: {{ val.target }}/{{ val.total }} câu ({{ Math.round((val.correct/val.total)*100) }}%)
            </div>
          </div>
        </div>
      </div>

      <!-- Question Review Section -->
      <div class="review-section">
        <div class="review-header">
          <div>
            <h2 class="review-title">Xem lại chi tiết từng câu hỏi</h2>
            <p class="review-subtitle">Lọc theo trạng thái và Domain để củng cố các lỗ hổng kiến thức</p>
          </div>
          
          <div class="review-filters-group">
            <div class="review-filters">
              <button 
                class="filter-pill" 
                :class="{ active: reviewFilter === 'all' }"
                @click="reviewFilter = 'all'"
              >
                Tất cả ({{ activeQuestions.length }})
              </button>
              <button 
                class="filter-pill" 
                :class="{ active: reviewFilter === 'incorrect' }"
                @click="reviewFilter = 'incorrect'"
              >
                Câu sai ({{ activeQuestions.length - (examResult?.rawScore || 0) }})
              </button>
              <button 
                class="filter-pill" 
                :class="{ active: reviewFilter === 'flagged' }"
                @click="reviewFilter = 'flagged'"
              >
                Đã cờ ({{ flaggedQuestions.size }})
              </button>
            </div>

            <div class="review-sub-filters">
              <button 
                class="sub-pill" 
                :class="{ active: reviewDomainFilter === 'ALL' }"
                @click="reviewDomainFilter = 'ALL'"
              >
                Tất cả Domain
              </button>
              <button 
                v-for="d in ['Domain 1', 'Domain 2', 'Domain 3', 'Domain 4']"
                :key="d"
                class="sub-pill" 
                :class="{ active: reviewDomainFilter === d }"
                @click="reviewDomainFilter = d"
              >
                {{ d }}
              </button>
            </div>
          </div>
        </div>

        <!-- Questions Review List -->
        <div class="review-cards-list">
          <div 
            v-for="q in filteredReviewQuestions" 
            :key="q.id"
            class="review-item card"
            :class="{
              'correct-item': userAnswers[q.id] === q.correctAnswer,
              'incorrect-item': userAnswers[q.id] !== q.correctAnswer
            }"
          >
            <div class="rev-top">
              <div class="rev-left-tags">
                <span class="badge" :class="userAnswers[q.id] === q.correctAnswer ? 'badge-green' : 'badge-orange'">
                  {{ userAnswers[q.id] === q.correctAnswer ? 'Chính xác' : 'Sai' }}
                </span>
                <span class="badge badge-muted">{{ q.domain }}</span>
                <span class="rev-num">Câu {{ q.num }}</span>
              </div>
              <span v-if="flaggedQuestions.has(q.id)" class="badge badge-orange">Đã đánh dấu</span>
            </div>

            <h3 class="rev-question-title">{{ q.title }}</h3>
            <p class="rev-scenario">{{ q.question }}</p>

            <div class="rev-options-list">
              <div 
                v-for="opt in q.options" 
                :key="opt.key"
                class="rev-option"
                :class="{
                  'chosen-user': userAnswers[q.id] === opt.key,
                  'is-correct': opt.key === q.correctAnswer
                }"
              >
                <div class="rev-opt-key">{{ opt.key }}</div>
                <div class="rev-opt-text">{{ opt.text }}</div>
                <div v-if="opt.key === q.correctAnswer" class="rev-opt-tag correct-tag">Đáp án đúng</div>
                <div v-else-if="userAnswers[q.id] === opt.key" class="rev-opt-tag wrong-tag">Bạn đã chọn</div>
              </div>
            </div>

            <!-- Rationale -->
            <div class="rev-explanation">
              <strong>Lý do chọn dịch vụ & Giải thích đề thi:</strong>
              <p>{{ q.explanation }}</p>
            </div>
          </div>
        </div>

        <div class="review-actions">
          <button class="btn btn-outline-azure btn-lg" @click="printResult">
            <Printer :size="18" />
            <span>In / Lưu PDF Bảng điểm</span>
          </button>
          <button class="btn btn-primary btn-lg" @click="setupExam(currentTestType)">
            <RotateCcw :size="18" />
            <span>Làm lại bài thi này</span>
          </button>
          <button class="btn btn-secondary btn-lg" @click="examState = 'menu'">
            <GraduationCap :size="18" />
            <span>Quay về danh sách bài thi</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.simulator-page {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px 20px 60px;
}

/* Menu View */
.menu-hero {
  margin-bottom: 28px;
}

.menu-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.menu-subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-top: 4px;
}

.test-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.test-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 28px;
}

.test-card.featured {
  border-color: var(--azure-blue);
  background: linear-gradient(180deg, rgba(0, 120, 212, 0.08) 0%, var(--bg-surface) 100%);
}

.card-featured-badge {
  position: absolute;
  top: 14px;
  right: 18px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--azure-cyan);
  background: rgba(0, 120, 212, 0.18);
  border: 1px solid rgba(0, 120, 212, 0.35);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.test-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.test-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.test-title {
  font-size: 1.25rem;
  font-weight: 700;
}

.test-desc {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.test-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  background: var(--bg-surface-elevated);
  padding: 12px;
  border-radius: var(--radius-md);
  margin: 6px 0;
}

.meta-cell {
  display: flex;
  flex-direction: column;
}

.meta-cell .lbl {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.meta-cell .val {
  font-size: 0.95rem;
  color: var(--text-primary);
}

.start-btn {
  margin-top: auto;
  width: 100%;
}

/* Active Exam Layout */
.active-exam-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.exam-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 12px 20px;
}

.exam-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.q-progress-text {
  font-weight: 600;
  font-size: 0.9rem;
}

.timer-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-color);
  padding: 6px 14px;
  border-radius: var(--radius-full);
}

.timer-text {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1.15rem;
  color: var(--azure-cyan);
}

.timer-warning .timer-text {
  color: #fb923c;
  animation: pulse 1s infinite;
}

.pause-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
}

.exam-main-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
}

.question-pane {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 28px;
}

.q-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.q-tags {
  display: flex;
  align-items: center;
  gap: 8px;
}

.q-id-tag {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
}

.flag-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid var(--border-color);
  padding: 6px 12px;
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.flag-btn.flagged {
  border-color: #fb923c;
  color: #fb923c;
  background: rgba(216, 59, 1, 0.1);
}

.q-title {
  font-size: 1.3rem;
  font-weight: 700;
}

.q-body-text {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-primary);
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 12px 0;
}

.option-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 18px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-surface-elevated);
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-item:hover {
  border-color: var(--azure-blue);
  background: var(--bg-surface-hover);
}

.option-item.selected {
  border-color: var(--azure-blue);
  background: rgba(0, 120, 212, 0.15);
}

.option-item.correct {
  border-color: #107c41;
  background: rgba(16, 124, 65, 0.15);
}

.option-item.incorrect {
  border-color: #d83b01;
  background: rgba(216, 59, 1, 0.15);
}

.opt-key-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.option-item.selected .opt-key-circle {
  background: var(--azure-blue);
  color: #ffffff;
  border-color: var(--azure-blue);
}

.opt-text {
  font-size: 0.92rem;
  line-height: 1.45;
}

.feedback-box {
  background: var(--bg-surface-elevated);
  border-left: 4px solid var(--azure-blue);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feedback-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
}

.feedback-status.success { color: #4ade80; }
.feedback-status.fail { color: #f87171; }

.feedback-explanation {
  font-size: 0.88rem;
  color: var(--text-secondary);
}

.q-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
  margin-top: 8px;
}

.footer-left,
.footer-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Exam Sidebar & Palette */
.exam-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}

.sidebar-sec-title {
  font-weight: 700;
  font-size: 0.95rem;
}

.status-summary {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.status-pill {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot.answered { background: var(--azure-blue); }
.dot.unanswered { background: var(--border-color); }
.dot.flagged { background: #fb923c; }

.palette-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  max-height: 380px;
  overflow-y: auto;
  padding-right: 4px;
}

.palette-btn {
  position: relative;
  height: 38px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background: var(--bg-surface-elevated);
  color: var(--text-secondary);
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.palette-btn:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.palette-btn.answered {
  background: rgba(0, 120, 212, 0.25);
  border-color: var(--azure-blue);
  color: #ffffff;
}

.palette-btn.current {
  outline: 2px solid var(--azure-cyan);
  outline-offset: 1px;
}

.flag-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  background: #fb923c;
  border-radius: 50%;
}

.submit-sidebar-btn {
  width: 100%;
  margin-top: auto;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 28px;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
}

.modal-desc {
  font-size: 0.88rem;
  color: var(--text-secondary);
}

.modal-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  background: var(--bg-surface-elevated);
  padding: 12px;
  border-radius: var(--radius-md);
}

.m-stat {
  display: flex;
  flex-direction: column;
}

.m-stat .lbl {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.m-stat .val {
  font-size: 1rem;
  font-weight: 700;
}

.modal-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(216, 59, 1, 0.15);
  border: 1px solid rgba(216, 59, 1, 0.3);
  color: #fb923c;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 0.84rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

/* Result View */
.result-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.result-banner {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
  padding: 32px;
  border-radius: var(--radius-lg);
}

.result-banner.passed-card {
  background: linear-gradient(135deg, rgba(16, 124, 65, 0.15) 0%, var(--bg-surface) 100%);
  border-color: #107c41;
}

.result-banner.failed-card {
  background: linear-gradient(135deg, rgba(216, 59, 1, 0.15) 0%, var(--bg-surface) 100%);
  border-color: #d83b01;
}

.result-left {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.res-badge-box {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface-elevated);
  flex-shrink: 0;
}

.passed-card .res-badge-box { color: #4ade80; }
.failed-card .res-badge-box { color: #fb923c; }

.res-sub {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-transform: uppercase;
  font-weight: 600;
}

.res-status-title {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 4px 0 8px;
}

.res-desc {
  font-size: 0.92rem;
  color: var(--text-secondary);
}

.result-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-left: 1px solid var(--border-color);
  padding-left: 24px;
}

.score-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-num {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
}

.passed-card .score-num { color: #4ade80; }
.failed-card .score-num { color: #fb923c; }

.score-max {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.raw-score-tag {
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 8px;
}

.target-status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  margin-top: 6px;
}

.target-met { background: rgba(16, 124, 65, 0.2); color: #4ade80; }
.target-miss { background: rgba(216, 59, 1, 0.2); color: #fb923c; }

/* Domain Breakdown Scorecard */
.domain-breakdown-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.breakdown-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.15rem;
  font-weight: 700;
}

.domains-score-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.domain-score-box {
  background: var(--bg-surface-elevated);
  padding: 14px;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.d-top {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  font-weight: 600;
}

.d-target-note {
  font-size: 0.72rem;
  color: var(--text-muted);
}

/* Review Section */
.review-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-title {
  font-size: 1.3rem;
  font-weight: 700;
}

.review-filters {
  display: flex;
  gap: 6px;
}

.filter-pill {
  padding: 6px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
}

.filter-pill.active {
  background: var(--azure-blue);
  color: #ffffff;
  border-color: var(--azure-blue);
}

.review-cards-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rev-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rev-left-tags {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rev-num {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.rev-question-title {
  font-size: 1.15rem;
  font-weight: 700;
}

.rev-scenario {
  font-size: 0.95rem;
  color: var(--text-primary);
  line-height: 1.5;
}

.rev-options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 6px 0;
}

.rev-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-surface-elevated);
  font-size: 0.9rem;
}

.rev-option.is-correct {
  border-color: #107c41;
  background: rgba(16, 124, 65, 0.15);
}

.rev-option.chosen-user:not(.is-correct) {
  border-color: #d83b01;
  background: rgba(216, 59, 1, 0.15);
}

.rev-opt-key {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.rev-opt-text {
  flex: 1;
}

.rev-opt-tag {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.correct-tag { background: rgba(16, 124, 65, 0.2); color: #4ade80; }
.wrong-tag { background: rgba(216, 59, 1, 0.2); color: #fb923c; }

.rev-explanation {
  background: var(--bg-surface-elevated);
  border-left: 3px solid var(--azure-cyan);
  padding: 14px 16px;
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  font-size: 0.88rem;
  color: var(--text-secondary);
}

.review-actions {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-top: 24px;
}

@media (max-width: 1024px) {
  .test-cards-grid {
    grid-template-columns: 1fr;
  }
  .exam-main-grid {
    grid-template-columns: 1fr;
  }
  .domains-score-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .result-banner {
    grid-template-columns: 1fr;
  }
  .result-right {
    border-left: none;
    border-top: 1px solid var(--border-color);
    padding-left: 0;
    padding-top: 20px;
  }
}
/* Resume session banner */
.resume-session-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  margin-bottom: 24px;
  background: linear-gradient(90deg, rgba(0, 120, 212, 0.15) 0%, rgba(0, 180, 216, 0.08) 100%);
  border: 1px solid rgba(0, 120, 212, 0.4);
  border-radius: var(--radius-lg);
}

.resume-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.resume-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--azure-blue);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.resume-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 2px;
}

.resume-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.resume-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Domain quick chips */
.domain-quick-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 4px 0 8px;
}

.chip-btn {
  font-size: 0.76rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-color);
  background: var(--bg-surface-elevated);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.chip-btn:hover {
  background: var(--azure-blue);
  color: white;
  border-color: var(--azure-blue);
}

/* Review filters group */
.review-subtitle {
  font-size: 0.86rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.review-filters-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.review-sub-filters {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.sub-pill {
  font-size: 0.76rem;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.sub-pill:hover,
.sub-pill.active {
  background: var(--azure-blue);
  color: white;
  border-color: var(--azure-blue);
  font-weight: 600;
}

@media print {
  .exam-top-bar,
  .review-filters-group,
  .review-actions,
  .flag-btn,
  .sidebar-sec-title,
  .palette-grid {
    display: none !important;
  }
  .simulator-page {
    padding: 0 !important;
  }
  .card {
    box-shadow: none !important;
    border: 1px solid #ccc !important;
  }
}
</style>
