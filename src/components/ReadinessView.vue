<script setup>
import { ref, computed } from 'vue';
import { useStudyStore } from '../composables/useStudyStore';
import { 
  CheckSquare, 
  Calendar, 
  Award, 
  CheckCircle2, 
  Circle, 
  ShieldCheck, 
  Layers, 
  ChevronDown, 
  ChevronRight,
  TrendingUp,
  Target
} from 'lucide-vue-next';

const store = useStudyStore();
const activeTab = ref('gate'); // 'gate' | 'plan'
const expandedWeeks = ref(new Set(['week-1', 'week-2', 'week-3', 'week-4']));

const readinessGroups = store.readiness;
const studyWeeks = store.studyPlan;

const readinessStatus = computed(() => {
  const p = store.readinessPercent;
  if (p >= 95) return { text: 'Tín hiệu sẵn sàng cao (High Readiness)', color: '#4ade80', badge: 'badge-green', desc: 'Bạn đã hoàn thành đủ các bài lab và nắm chắc các tiêu chuẩn kiểm thử của 4 Domain!' };
  if (p >= 85) return { text: 'Gần sẵn sàng (Close Readiness)', color: '#00a4ef', badge: 'badge-blue', desc: 'Kiểm tra kỹ các câu hỏi còn phân vân và hoàn thành nốt các tiêu chuẩn còn thiếu.' };
  if (p >= 60) return { text: 'Đang tích lũy kiến thức (In Progress)', color: '#fb923c', badge: 'badge-orange', desc: 'Tập trung hoàn thành các bài lab thực hành để củng cố kinh nghiệm thực tế.' };
  return { text: 'Cần xây dựng nền tảng vững chắc', color: '#f87171', badge: 'badge-orange', desc: 'Đọc kỹ tài liệu các Domain và làm các bài thi thử để phát hiện lỗ hổng.' };
});

function toggleWeek(id) {
  if (expandedWeeks.value.has(id)) {
    expandedWeeks.value.delete(id);
  } else {
    expandedWeeks.value.add(id);
  }
}
</script>

<template>
  <div class="readiness-page">
    <div class="readiness-hero">
      <div class="badge badge-green">
        <CheckSquare :size="16" />
        <span>Section 13 & 14 Gate</span>
      </div>
      <h1 class="readiness-title">Cổng Kiểm Tra Mức Độ Sẵn Sàng 95% & Lịch Học</h1>
      <p class="readiness-desc">
        Microsoft AI-200 không chỉ yêu cầu thuộc định nghĩa mà kiểm tra khả năng lập luận kiến trúc và giải quyết sự cố.
        Đạt 95% trên các bảng kiểm thử này trước khi đăng ký lịch thi chính thức.
      </p>
    </div>

    <!-- Readiness Scorecard Banner -->
    <div class="readiness-banner card">
      <div class="banner-left">
        <div class="banner-badge-box">
          <Award :size="40" :style="{ color: readinessStatus.color }" />
        </div>
        <div class="banner-info">
          <div class="banner-sub">Đánh giá mức độ tự tin</div>
          <h2 class="banner-status-title" :style="{ color: readinessStatus.color }">
            {{ readinessStatus.text }}
          </h2>
          <p class="banner-status-desc">{{ readinessStatus.desc }}</p>
        </div>
      </div>

      <div class="banner-right">
        <div class="gauge-box">
          <span class="gauge-num">{{ store.readinessPercent }}%</span>
          <span class="gauge-label">Hoàn thành tiêu chuẩn</span>
        </div>
        <div class="count-tag">
          Đã đạt: {{ store.readinessCheckedCount }} / {{ store.totalReadinessItems }} tiêu chuẩn
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="view-tabs">
      <button 
        class="v-tab"
        :class="{ active: activeTab === 'gate' }"
        @click="activeTab = 'gate'"
      >
        <ShieldCheck :size="18" />
        <span>Cổng kiểm tra năng lực (Mastery Gate)</span>
        <span class="badge badge-muted">{{ store.readinessCheckedCount }}/{{ store.totalReadinessItems }}</span>
      </button>

      <button 
        class="v-tab"
        :class="{ active: activeTab === 'plan' }"
        @click="activeTab = 'plan'"
      >
        <Calendar :size="18" />
        <span>Lịch trình học tập chi tiết (Study Plan)</span>
        <span class="badge badge-muted">{{ studyWeeks.length }} giai đoạn</span>
      </button>
    </div>

    <!-- 1. READINESS GATE CHECKLISTS -->
    <div v-if="activeTab === 'gate'" class="gate-section">
      <div class="gate-grid">
        <div 
          v-for="(grp, gIdx) in readinessGroups" 
          :key="grp.id"
          class="gate-group card"
        >
          <div class="group-header">
            <span class="badge" :class="grp.domain.includes('1') ? 'badge-blue' : (grp.domain.includes('2') ? 'badge-green' : (grp.domain.includes('3') ? 'badge-orange' : 'badge-purple'))">
              {{ grp.domain }}
            </span>
            <h3 class="group-title">{{ grp.title }}</h3>
          </div>

          <div class="checklist-items">
            <div 
              v-for="(item, iIdx) in grp.items" 
              :key="iIdx"
              class="check-row"
              :class="{ checked: store.checkedReadiness.has(`${grp.id}-${iIdx}`) }"
              @click="store.toggleReadinessItem(`${grp.id}-${iIdx}`)"
            >
              <button class="check-toggle">
                <CheckCircle2 v-if="store.checkedReadiness.has(`${grp.id}-${iIdx}`)" class="checked-icon" :size="18" />
                <Circle v-else class="unchecked-icon" :size="18" />
              </button>
              <span class="check-text">{{ item }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. STUDY PLAN TIMELINE -->
    <div v-else-if="activeTab === 'plan'" class="plan-section">
      <div class="plan-timeline">
        <div 
          v-for="(week, wIdx) in studyWeeks" 
          :key="wIdx"
          class="week-card card"
        >
          <div class="week-header" @click="toggleWeek(`week-${wIdx}`)">
            <div class="week-title-group">
              <span class="badge badge-blue">Giai đoạn {{ wIdx + 1 }}</span>
              <h3 class="week-title">{{ week.title }}</h3>
            </div>
            <button class="week-toggle-btn">
              <ChevronDown v-if="expandedWeeks.has(`week-${wIdx}`)" :size="18" />
              <ChevronRight v-else :size="18" />
            </button>
          </div>

          <div v-if="expandedWeeks.has(`week-${wIdx}`)" class="tasks-list">
            <div 
              v-for="(task, tIdx) in week.tasks" 
              :key="tIdx"
              class="task-row"
              :class="{ done: store.completedTasks.has(`task-${wIdx}-${tIdx}`) }"
              @click="store.toggleTaskCompleted(`task-${wIdx}-${tIdx}`)"
            >
              <button class="task-checkbox">
                <CheckCircle2 v-if="store.completedTasks.has(`task-${wIdx}-${tIdx}`)" class="checked-icon" :size="18" />
                <Circle v-else class="unchecked-icon" :size="18" />
              </button>
              <div class="task-content">
                <strong v-if="task.topic" class="task-topic">{{ task.topic }}:</strong>
                <span class="task-details">{{ task.details }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.readiness-page {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px 20px 60px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.readiness-hero {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.readiness-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.readiness-desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
  max-width: 800px;
}

/* Banner */
.readiness-banner {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
  padding: 28px 32px;
  background: var(--surface-gradient);
}

.banner-left {
  display: flex;
  align-items: flex-start;
  gap: 18px;
}

.banner-badge-box {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  background: var(--bg-surface-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.banner-sub {
  font-size: 0.78rem;
  color: var(--text-muted);
  text-transform: uppercase;
  font-weight: 600;
}

.banner-status-title {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 2px 0 6px;
}

.banner-status-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.banner-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-left: 1px solid var(--border-color);
  padding-left: 24px;
}

.gauge-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gauge-num {
  font-size: 2.8rem;
  font-weight: 800;
  color: var(--azure-cyan);
  line-height: 1;
}

.gauge-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.count-tag {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 600;
  margin-top: 8px;
}

/* Tabs */
.view-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
}

.v-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.v-tab:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.v-tab.active {
  background: var(--azure-blue);
  color: #ffffff;
}

/* Gate Checklists */
.gate-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.gate-group {
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.group-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.group-title {
  font-size: 1.15rem;
  font-weight: 700;
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.check-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.check-row:hover {
  background: var(--bg-surface-elevated);
}

.check-row.checked {
  background: rgba(16, 124, 65, 0.08);
}

.check-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px 0 0;
  display: flex;
  flex-shrink: 0;
}

.checked-icon { color: #4ade80; }
.unchecked-icon { color: var(--text-muted); }

.check-text {
  font-size: 0.88rem;
  line-height: 1.45;
  color: var(--text-secondary);
}

.check-row.checked .check-text {
  color: var(--text-primary);
}

/* Study Plan */
.plan-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.week-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.week-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.week-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.week-title {
  font-size: 1.15rem;
  font-weight: 700;
}

.week-toggle-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
}

.task-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.task-row:hover {
  background: var(--bg-surface-elevated);
}

.task-row.done {
  background: rgba(16, 124, 65, 0.08);
}

.task-checkbox {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px 0 0;
  display: flex;
  flex-shrink: 0;
}

.task-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.88rem;
  line-height: 1.45;
  color: var(--text-secondary);
}

.task-topic {
  color: var(--azure-cyan);
}

.task-row.done .task-details {
  color: var(--text-primary);
}

@media (max-width: 960px) {
  .readiness-banner {
    grid-template-columns: 1fr;
  }
  .banner-right {
    border-left: none;
    border-top: 1px solid var(--border-color);
    padding-left: 0;
    padding-top: 18px;
  }
  .gate-grid {
    grid-template-columns: 1fr;
  }
}
</style>
