<script setup>
import { ref, computed } from 'vue';
import { useStudyStore } from '../composables/useStudyStore';
import { 
  Flame, 
  Search, 
  CheckCircle2, 
  Circle, 
  Eye, 
  EyeOff, 
  BookOpen, 
  HelpCircle,
  Lightbulb
} from 'lucide-vue-next';

const store = useStudyStore();
const searchQuery = ref('');
const selectedDomain = ref('ALL');
const statusFilter = ref('ALL'); // 'ALL' | 'mastered' | 'unmastered'
const revealedAnswers = ref(new Set());

const drills = computed(() => {
  return store.questions.filter(q => q.type === 'drill');
});

const domains = ['ALL', 'Domain 1', 'Domain 2', 'Domain 3', 'Domain 4'];

const filteredDrills = computed(() => {
  return drills.value.filter(d => {
    // Domain filter
    if (selectedDomain.value !== 'ALL' && d.domain !== selectedDomain.value) {
      return false;
    }
    // Status filter
    const isMastered = store.masteredDrills.has(d.id);
    if (statusFilter.value === 'mastered' && !isMastered) return false;
    if (statusFilter.value === 'unmastered' && isMastered) return false;

    // Search query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      const inTitle = d.title.toLowerCase().includes(q);
      const inQ = d.question.toLowerCase().includes(q);
      const inAns = (d.explanation || '').toLowerCase().includes(q);
      return inTitle || inQ || inAns;
    }
    return true;
  });
});

function toggleReveal(id) {
  if (revealedAnswers.value.has(id)) {
    revealedAnswers.value.delete(id);
  } else {
    revealedAnswers.value.add(id);
  }
}

function revealAll() {
  filteredDrills.value.forEach(d => revealedAnswers.value.add(d.id));
}

function hideAll() {
  revealedAnswers.value.clear();
}
</script>

<template>
  <div class="drills-page">
    <!-- Header -->
    <div class="drills-hero">
      <div class="hero-left">
        <div class="badge badge-orange">
          <Flame :size="16" />
          <span>Thực chiến giải quyết sự cố</span>
        </div>
        <h1 class="drills-title">42 Tình huống thực tế (Scenario Drills)</h1>
        <p class="drills-desc">
          Các câu hỏi tự luận phỏng vấn chuyên sâu từ Section 12 và Deep-Audit. 
          Hãy tự trả lời trong đầu trước khi mở đáp án để rèn luyện tư duy phản biện khi vào phòng thi.
        </p>
      </div>

      <div class="drills-stats card">
        <div class="d-stat">
          <span class="lbl">Tiến độ nắm vững:</span>
          <strong class="val highlight-green">{{ store.drillsMasteredCount }} / {{ store.totalDrills }} câu</strong>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${store.drillsProgressPercent}%`, background: '#107c41' }"></div>
        </div>
        <span class="d-percent">Đạt {{ store.drillsProgressPercent }}% mục tiêu</span>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar card">
      <div class="search-wrap">
        <Search class="search-icon" :size="16" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tìm tình huống (ví dụ: KEDA, hot partition, 127.0.0.1, deadlock)..." 
          class="search-input"
        />
      </div>

      <div class="filter-controls">
        <div class="domain-pills">
          <button 
            v-for="d in domains" 
            :key="d"
            class="filter-pill"
            :class="{ active: selectedDomain === d }"
            @click="selectedDomain = d"
          >
            {{ d === 'ALL' ? 'Tất cả Domain' : d }}
          </button>
        </div>

        <div class="status-pills">
          <button 
            class="filter-pill" 
            :class="{ active: statusFilter === 'ALL' }"
            @click="statusFilter = 'ALL'"
          >
            Tất cả
          </button>
          <button 
            class="filter-pill" 
            :class="{ active: statusFilter === 'mastered' }"
            @click="statusFilter = 'mastered'"
          >
            Đã thuộc
          </button>
          <button 
            class="filter-pill" 
            :class="{ active: statusFilter === 'unmastered' }"
            @click="statusFilter = 'unmastered'"
          >
            Cần ôn lại
          </button>
        </div>

        <div class="reveal-toggle-group">
          <button class="btn btn-secondary btn-sm" @click="revealAll">
            <Eye :size="14" />
            <span>Mở tất cả đáp án</span>
          </button>
          <button class="btn btn-secondary btn-sm" @click="hideAll">
            <EyeOff :size="14" />
            <span>Ẩn tất cả</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Drills Grid -->
    <div class="drills-grid">
      <div 
        v-for="d in filteredDrills" 
        :key="d.id"
        class="drill-card card"
        :class="{ mastered: store.masteredDrills.has(d.id) }"
      >
        <div class="drill-top">
          <div class="drill-tags">
            <span class="badge" :class="d.domain.includes('1') ? 'badge-blue' : (d.domain.includes('2') ? 'badge-green' : (d.domain.includes('3') ? 'badge-orange' : 'badge-purple'))">
              {{ d.domain }}
            </span>
            <span class="drill-num">Tình huống {{ d.num }}</span>
          </div>

          <!-- Mastered Checkbox Button -->
          <button 
            class="mastered-btn"
            :class="{ active: store.masteredDrills.has(d.id) }"
            :title="store.masteredDrills.has(d.id) ? 'Bỏ đánh dấu nắm vững' : 'Đánh dấu đã hiểu vững'"
            @click="store.toggleDrillMastered(d.id)"
          >
            <CheckCircle2 v-if="store.masteredDrills.has(d.id)" :size="18" />
            <Circle v-else :size="18" />
            <span>{{ store.masteredDrills.has(d.id) ? 'Đã hiểu vững' : 'Cần ôn' }}</span>
          </button>
        </div>

        <h3 class="drill-title">{{ d.title }}</h3>
        <p class="drill-scenario">{{ d.question }}</p>

        <!-- Solution Section -->
        <div v-if="revealedAnswers.has(d.id)" class="drill-solution card">
          <div class="solution-header">
            <Lightbulb :size="18" class="sol-icon" />
            <strong>Giải pháp kỹ thuật & Đáp án chính thức:</strong>
          </div>
          <div class="solution-text">{{ d.explanation }}</div>
        </div>

        <div class="drill-bottom">
          <button 
            class="btn btn-sm"
            :class="revealedAnswers.has(d.id) ? 'btn-secondary' : 'btn-outline-azure'"
            @click="toggleReveal(d.id)"
          >
            <component :is="revealedAnswers.has(d.id) ? EyeOff : Eye" :size="14" />
            <span>{{ revealedAnswers.has(d.id) ? 'Ẩn đáp án' : 'Xem đáp án & Phân tích' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drills-page {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px 20px 60px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.drills-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.hero-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.drills-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.drills-desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
  max-width: 720px;
}

.drills-stats {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 240px;
}

.d-stat {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
}

.d-percent {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: right;
}

/* Filter Bar */
.filter-bar {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 14px 10px 38px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-surface-elevated);
  color: var(--text-primary);
  font-size: 0.88rem;
  outline: none;
}

.search-input:focus {
  border-color: var(--azure-blue);
}

.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.domain-pills,
.status-pills {
  display: flex;
  gap: 6px;
}

.filter-pill {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background: var(--bg-surface-elevated);
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-pill:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.filter-pill.active {
  background: var(--azure-blue);
  color: #ffffff;
  border-color: var(--azure-blue);
}

.reveal-toggle-group {
  display: flex;
  gap: 8px;
}

/* Drills Grid */
.drills-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.drill-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 22px;
  transition: all 0.2s ease;
}

.drill-card.mastered {
  border-color: rgba(16, 124, 65, 0.4);
  background: linear-gradient(180deg, rgba(16, 124, 65, 0.05) 0%, var(--bg-surface) 100%);
}

.drill-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drill-tags {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drill-num {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
}

.mastered-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid var(--border-color);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mastered-btn.active {
  border-color: #107c41;
  color: #4ade80;
  background: rgba(16, 124, 65, 0.15);
}

.drill-title {
  font-size: 1.15rem;
  font-weight: 700;
}

.drill-scenario {
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--text-primary);
}

.drill-solution {
  background: var(--bg-surface-elevated);
  border-left: 3px solid #00a4ef;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  animation: fadeIn 0.25s ease;
}

.solution-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--azure-cyan);
}

.solution-text {
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--text-secondary);
}

.drill-bottom {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  padding-top: 8px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 960px) {
  .drills-hero {
    flex-direction: column;
    align-items: flex-start;
  }
  .drills-grid {
    grid-template-columns: 1fr;
  }
}
</style>
