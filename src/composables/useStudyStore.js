import { ref, computed, watch, reactive } from 'vue';
import sectionsData from '../data/sections.json';
import questionsData from '../data/questions.json';
import vocabularyData from '../data/vocabulary.json';
import readinessData from '../data/readiness.json';
import studyPlanData from '../data/study-plan.json';
import decisionTablesData from '../data/decision-tables.json';
import cheatsheetsData from '../data/cheatsheets.json';

// LocalStorage helpers
function loadStorage(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Storage read error:', e);
    return defaultValue;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write error:', e);
  }
}

// Global reactive states
const currentTab = ref('dashboard');
const isDarkMode = ref(loadStorage('ai200_dark_mode', true));
const activeSectionId = ref(sectionsData[0]?.id || '1-exam-snapshot');

// Tracking states (Using arrays in storage, Sets in runtime)
const completedSections = ref(new Set(loadStorage('ai200_completed_sections', [])));
const masteredDrills = ref(new Set(loadStorage('ai200_mastered_drills', [])));
const masteredVocab = ref(new Set(loadStorage('ai200_mastered_vocab', [])));
const checkedReadiness = ref(new Set(loadStorage('ai200_checked_readiness', [])));
const completedTasks = ref(new Set(loadStorage('ai200_completed_tasks', [])));
const examHistory = ref(loadStorage('ai200_exam_history', []));

// Apply initial dark mode
if (typeof document !== 'undefined') {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Sync watchers to localStorage
watch(isDarkMode, (val) => {
  saveStorage('ai200_dark_mode', val);
  if (typeof document !== 'undefined') {
    if (val) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
});

watch(completedSections, (val) => {
  saveStorage('ai200_completed_sections', Array.from(val));
}, { deep: true });

watch(masteredDrills, (val) => {
  saveStorage('ai200_mastered_drills', Array.from(val));
}, { deep: true });

watch(masteredVocab, (val) => {
  saveStorage('ai200_mastered_vocab', Array.from(val));
}, { deep: true });

watch(checkedReadiness, (val) => {
  saveStorage('ai200_checked_readiness', Array.from(val));
}, { deep: true });

watch(completedTasks, (val) => {
  saveStorage('ai200_completed_tasks', Array.from(val));
}, { deep: true });

watch(examHistory, (val) => {
  saveStorage('ai200_exam_history', val);
}, { deep: true });

// Toggle helpers
function toggleSectionCompleted(id) {
  const next = new Set(completedSections.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  completedSections.value = next;
  saveStorage('ai200_completed_sections', Array.from(next));
}

function toggleDrillMastered(id) {
  const next = new Set(masteredDrills.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  masteredDrills.value = next;
  saveStorage('ai200_mastered_drills', Array.from(next));
}

function toggleVocabMastered(term) {
  const next = new Set(masteredVocab.value);
  if (next.has(term)) {
    next.delete(term);
  } else {
    next.add(term);
  }
  masteredVocab.value = next;
  saveStorage('ai200_mastered_vocab', Array.from(next));
}

function toggleReadinessItem(itemKey) {
  const next = new Set(checkedReadiness.value);
  if (next.has(itemKey)) {
    next.delete(itemKey);
  } else {
    next.add(itemKey);
  }
  checkedReadiness.value = next;
  saveStorage('ai200_checked_readiness', Array.from(next));
}

function toggleTaskCompleted(taskKey) {
  const next = new Set(completedTasks.value);
  if (next.has(taskKey)) {
    next.delete(taskKey);
  } else {
    next.add(taskKey);
  }
  completedTasks.value = next;
  saveStorage('ai200_completed_tasks', Array.from(next));
}

function saveExamResult(result) {
  examHistory.value = [
    {
      id: Date.now(),
      date: new Date().toISOString(),
      ...result
    },
    ...examHistory.value
  ];
  saveStorage('ai200_exam_history', examHistory.value);
}

function resetAllProgress() {
  if (confirm('Bạn có chắc chắn muốn đặt lại toàn bộ tiến độ học tập và kết quả bài thi?')) {
    completedSections.value = new Set();
    masteredDrills.value = new Set();
    masteredVocab.value = new Set();
    checkedReadiness.value = new Set();
    completedTasks.value = new Set();
    examHistory.value = [];

    saveStorage('ai200_completed_sections', []);
    saveStorage('ai200_mastered_drills', []);
    saveStorage('ai200_mastered_vocab', []);
    saveStorage('ai200_checked_readiness', []);
    saveStorage('ai200_completed_tasks', []);
    saveStorage('ai200_exam_history', []);
  }
}

// Computed metrics
const totalSections = computed(() => sectionsData.length);
const sectionsProgressPercent = computed(() => {
  if (!totalSections.value) return 0;
  return Math.round((completedSections.value.size / totalSections.value) * 100);
});

const totalDrills = computed(() => questionsData.filter(q => q.type === 'drill').length);
const drillsMasteredCount = computed(() => masteredDrills.value.size);
const drillsProgressPercent = computed(() => {
  if (!totalDrills.value) return 0;
  return Math.round((drillsMasteredCount.value / totalDrills.value) * 100);
});

const totalVocab = computed(() => vocabularyData.length);
const vocabMasteredCount = computed(() => masteredVocab.value.size);
const vocabProgressPercent = computed(() => {
  if (!totalVocab.value) return 0;
  return Math.round((vocabMasteredCount.value / totalVocab.value) * 100);
});

const totalReadinessItems = computed(() => {
  return readinessData.reduce((acc, cat) => acc + cat.items.length, 0);
});
const readinessCheckedCount = computed(() => checkedReadiness.value.size);
const readinessPercent = computed(() => {
  if (!totalReadinessItems.value) return 0;
  return Math.round((readinessCheckedCount.value / totalReadinessItems.value) * 100);
});

const bestSimScore = computed(() => {
  const sims = examHistory.value.filter(e => e.set === 'Full 120-minute simulation');
  if (!sims.length) return null;
  return Math.max(...sims.map(s => s.scaledScore || 0));
});

const overallMasteryScore = computed(() => {
  const g = sectionsProgressPercent.value * 0.25;
  const d = drillsProgressPercent.value * 0.25;
  const r = readinessPercent.value * 0.25;
  const e = bestSimScore.value ? (bestSimScore.value / 1000) * 100 * 0.25 : 0;
  return Math.round(g + d + r + e);
});

// Create singleton reactive store
const store = reactive({
  // Data
  sections: sectionsData,
  questions: questionsData,
  vocabulary: vocabularyData,
  readiness: readinessData,
  studyPlan: studyPlanData,
  decisionTables: decisionTablesData,
  cheatsheets: cheatsheetsData,

  // Navigation & Theme
  currentTab,
  isDarkMode,
  activeSectionId,

  // Progress State
  completedSections,
  masteredDrills,
  masteredVocab,
  checkedReadiness,
  completedTasks,
  examHistory,

  // Actions
  toggleSectionCompleted,
  toggleDrillMastered,
  toggleVocabMastered,
  toggleReadinessItem,
  toggleTaskCompleted,
  saveExamResult,
  resetAllProgress,

  // Metrics
  totalSections,
  sectionsProgressPercent,
  totalDrills,
  drillsMasteredCount,
  drillsProgressPercent,
  totalVocab,
  vocabMasteredCount,
  vocabProgressPercent,
  totalReadinessItems,
  readinessCheckedCount,
  readinessPercent,
  bestSimScore,
  overallMasteryScore
});

export function useStudyStore() {
  return store;
}
