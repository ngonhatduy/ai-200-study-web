<script setup>
import { useStudyStore } from '../composables/useStudyStore';
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  Target, 
  BookOpen, 
  Flame, 
  GraduationCap, 
  TableProperties, 
  Code2, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Server,
  Database,
  Radio,
  FileCheck
} from 'lucide-vue-next';

const store = useStudyStore();

const domains = [
  {
    id: 'domain-1',
    num: '1',
    title: 'Containerized Solutions',
    nameVi: 'Giải pháp Container trên Azure',
    weight: '20-25%',
    icon: Server,
    color: '#0078d4',
    badgeClass: 'badge-blue',
    topics: [
      'Azure Container Registry (Tasks, Webhooks, Multi-step)',
      'Azure Container Apps (Revisions, KEDA autoscaling, Ingress)',
      'Azure App Service Containers (Port, Startup, Custom images)',
      'Azure Kubernetes Service (Deployments, Services, Ingress, Pod debugging)'
    ],
    targetSection: '4-domain-1---containerized-solutions'
  },
  {
    id: 'domain-2',
    num: '2',
    title: 'AI Data Management',
    nameVi: 'Quản lý Dữ liệu AI & Vector',
    weight: '25-30%',
    icon: Database,
    color: '#107c41',
    badgeClass: 'badge-green',
    topics: [
      'Azure Cosmos DB for NoSQL (Vector search, Indexing, Point read, Partitioning)',
      'Azure Database for PostgreSQL (pgvector, <=> distance, HNSW, IVFFlat)',
      'Cosmos DB Change Feed (At-least-once, Lease container, Idempotency)',
      'Azure Managed Redis (Semantic caching, Low-latency session memory)'
    ],
    targetSection: '5-domain-2---ai-data-management'
  },
  {
    id: 'domain-3',
    num: '3',
    title: 'Connect & Consume Azure Services',
    nameVi: 'Kết nối & Tiêu thụ Dịch vụ Azure',
    weight: '20-25%',
    icon: Radio,
    color: '#d83b01',
    badgeClass: 'badge-orange',
    topics: [
      'Azure Service Bus (Queues, Topics, Subscriptions, Dead-lettering, Locks)',
      'Azure Event Grid (Events, Subscriptions, Subject & Event-type filters)',
      'Azure Functions (Triggers, Bindings, Direct SDK vs declarative)',
      'Event Hubs (High-throughput partitioned telemetry streaming)'
    ],
    targetSection: '6-domain-3---connect-to-and-consume-azure-services'
  },
  {
    id: 'domain-4',
    num: '4',
    title: 'Security, Monitoring & Troubleshooting',
    nameVi: 'Bảo mật, Giám sát & Khắc phục sự cố',
    weight: '20-25%',
    icon: ShieldCheck,
    color: '#8764b8',
    badgeClass: 'badge-purple',
    topics: [
      'Managed Identities (System-assigned vs User-assigned, RBAC roles)',
      'Azure Key Vault (Secrets, Certificates, Keys, Safe rotation pattern)',
      'Azure App Configuration (Centralized settings, Dynamic refresh, Feature flags)',
      'Application Insights & Log Analytics (KQL queries, Distributed traces, p95 latency)'
    ],
    targetSection: '7-domain-4---security-monitoring-and-troubleshooting'
  }
];

function goToSection(sectionId) {
  store.activeSectionId = sectionId;
  store.currentTab = 'guide';
}

function startExam(category) {
  store.currentTab = 'simulator';
}
</script>

<template>
  <div class="dashboard-page">
    <!-- Hero Banner -->
    <div class="hero-banner">
      <div class="hero-content">
        <div class="hero-badge">
          <Award :size="16" />
          <span>Chứng chỉ Microsoft Certified: Azure AI Cloud Developer Associate</span>
        </div>
        <h1 class="hero-title">AI-200 Interactive Study Hub</h1>
        <p class="hero-desc">
          Toàn bộ tài liệu chuẩn hóa 4,287 dòng, 178 câu hỏi mô phỏng kèm giải thích chi tiết, 
          bảng so sánh kiến trúc và công cụ tra cứu lệnh CLI/SDK/KQL.
        </p>

        <!-- Exam Snapshot Highlights -->
        <div class="snapshot-grid">
          <div class="snapshot-item">
            <span class="label">Mã kỳ thi</span>
            <strong class="value highlight">AI-200</strong>
          </div>
          <div class="snapshot-item">
            <span class="label">Điểm đỗ (Passing)</span>
            <strong class="value">700 / 1000</strong>
          </div>
          <div class="snapshot-item">
            <span class="label">Thời lượng thi</span>
            <strong class="value">120 phút</strong>
          </div>
          <div class="snapshot-item">
            <span class="label">Mục tiêu sẵn sàng</span>
            <strong class="value highlight-green">95% (57/60)</strong>
          </div>
        </div>

        <div class="hero-actions">
          <button class="btn btn-primary btn-lg" @click="startExam('simulation')">
            <GraduationCap :size="20" />
            <span>Làm bài thi thử 120 phút (60 câu)</span>
          </button>
          <button class="btn btn-secondary btn-lg" @click="goToSection('1-exam-snapshot')">
            <BookOpen :size="18" />
            <span>Đọc hướng dẫn kỳ thi</span>
          </button>
        </div>
      </div>

      <!-- Overall Readiness Gauge -->
      <div class="hero-gauge-card card">
        <div class="gauge-title">Chỉ số Sẵn sàng AI-200</div>
        <div class="gauge-circle-container">
          <div class="gauge-value">{{ store.overallMasteryScore }}%</div>
          <div class="gauge-sub">Mức độ hoàn thành</div>
        </div>
        
        <div class="metric-bars">
          <div class="metric-row">
            <span class="m-label">Đã đọc tài liệu:</span>
            <span class="m-val">{{ store.completedSections.size }}/{{ store.totalSections }} mục ({{ store.sectionsProgressPercent }}%)</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: `${store.sectionsProgressPercent}%`, background: '#0078d4' }"></div>
          </div>

          <div class="metric-row">
            <span class="m-label">Tình huống thực tế đã làm:</span>
            <span class="m-val">{{ store.drillsMasteredCount }}/{{ store.totalDrills }} câu ({{ store.drillsProgressPercent }}%)</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: `${store.drillsProgressPercent}%`, background: '#107c41' }"></div>
          </div>

          <div class="metric-row">
            <span class="m-label">Cổng sẵn sàng 95%:</span>
            <span class="m-val">{{ store.readinessCheckedCount }}/{{ store.totalReadinessItems }} tiêu chuẩn ({{ store.readinessPercent }}%)</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: `${store.readinessPercent}%`, background: '#d83b01' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Shortcuts Bar -->
    <div class="quick-nav-grid">
      <div class="quick-card" @click="store.currentTab = 'simulator'">
        <div class="q-icon" style="background: rgba(0, 120, 212, 0.15); color: #0078d4;">
          <GraduationCap :size="24" />
        </div>
        <div class="q-info">
          <h3>Kỳ thi thử (Practice Tests)</h3>
          <p>60 câu thi mô phỏng 120p + Test A & Test B (20 câu/đề)</p>
        </div>
        <ArrowRight class="q-arrow" :size="18" />
      </div>

      <div class="quick-card" @click="store.currentTab = 'drills'">
        <div class="q-icon" style="background: rgba(216, 59, 1, 0.15); color: #d83b01;">
          <Flame :size="24" />
        </div>
        <div class="q-info">
          <h3>42 Tình huống thực chiến</h3>
          <p>Thực hành chẩn đoán lỗi, Rollback, Hot Partition, KEDA scale</p>
        </div>
        <ArrowRight class="q-arrow" :size="18" />
      </div>

      <div class="quick-card" @click="store.currentTab = 'decisions'">
        <div class="q-icon" style="background: rgba(16, 124, 65, 0.15); color: #107c41;">
          <TableProperties :size="24" />
        </div>
        <div class="q-info">
          <h3>Bảng so sánh & Quyết định</h3>
          <p>Cosmos vs pgvector vs Redis, Container Apps vs AKS vs WebApp</p>
        </div>
        <ArrowRight class="q-arrow" :size="18" />
      </div>

      <div class="quick-card" @click="store.currentTab = 'cheatsheet'">
        <div class="q-icon" style="background: rgba(135, 100, 184, 0.15); color: #8764b8;">
          <Code2 :size="24" />
        </div>
        <div class="q-info">
          <h3>Cheat Sheet CLI & KQL</h3>
          <p>Câu lệnh `az` mẫu, Python SDK, KQL Log Analytics mẫu thi</p>
        </div>
        <ArrowRight class="q-arrow" :size="18" />
      </div>
    </div>

    <!-- Official Blueprint Section -->
    <div class="section-container">
      <div class="section-header">
        <div>
          <h2 class="section-title">4 Lĩnh vực trọng tâm (Official AI-200 Blueprint)</h2>
          <p class="section-subtitle">Tỉ trọng các phần trong đề thi chính thức của Microsoft và các chủ đề bắt buộc nắm vững</p>
        </div>
      </div>

      <div class="domains-grid">
        <div 
          v-for="d in domains" 
          :key="d.id"
          class="domain-card card"
        >
          <div class="domain-top">
            <div class="domain-icon-box" :style="{ background: `${d.color}20`, color: d.color }">
              <component :is="d.icon" :size="24" />
            </div>
            <div class="domain-badge-group">
              <span class="badge" :class="d.badgeClass">Domain {{ d.num }}</span>
              <span class="badge badge-muted">Trọng số: {{ d.weight }}</span>
            </div>
          </div>

          <h3 class="domain-name">{{ d.title }}</h3>
          <div class="domain-vi">{{ d.nameVi }}</div>

          <ul class="domain-topics-list">
            <li v-for="(t, idx) in d.topics" :key="idx">
              <CheckCircle2 :size="14" class="check-icon" :style="{ color: d.color }" />
              <span>{{ t }}</span>
            </li>
          </ul>

          <div class="domain-card-actions">
            <button class="btn btn-outline-azure btn-sm" @click="goToSection(d.targetSection)">
              <BookOpen :size="14" />
              <span>Đọc lý thuyết</span>
            </button>
            <button class="btn btn-secondary btn-sm" @click="store.currentTab = 'simulator'">
              <Target :size="14" />
              <span>Luyện câu hỏi</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Exam History -->
    <div v-if="store.examHistory.length > 0" class="section-container">
      <div class="section-header">
        <h2 class="section-title">Lịch sử bài thi đã làm</h2>
      </div>
      <div class="exam-history-list card">
        <div v-for="h in store.examHistory.slice(0, 5)" :key="h.id" class="history-item">
          <div class="h-main">
            <strong class="h-title">{{ h.title || h.set }}</strong>
            <span class="h-date">{{ new Date(h.date).toLocaleString('vi-VN') }}</span>
          </div>
          <div class="h-scores">
            <span class="h-raw">Đúng: {{ h.rawScore }}/{{ h.totalQuestions }}</span>
            <span class="badge" :class="h.passed ? 'badge-green' : 'badge-orange'">
              {{ h.scaledScore ? `${h.scaledScore}/1000` : `${Math.round((h.rawScore/h.totalQuestions)*100)}%` }} - {{ h.passed ? 'ĐẠT (PASS)' : 'CHƯA ĐẠT' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px 20px 60px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Hero Banner */
.hero-banner {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 28px;
  background: var(--surface-gradient);
  border: 1px solid #bfdbfe;
  border-radius: var(--radius-lg);
  padding: 36px 32px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px -2px rgba(0, 120, 212, 0.08);
}

html.dark .hero-banner {
  border-color: var(--border-color);
  box-shadow: var(--shadow-md);
}

.hero-banner::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(0, 120, 212, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #e0f2fe;
  border: 1px solid #bae6fd;
  color: #0284c7;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 0.82rem;
  font-weight: 600;
  width: fit-content;
}

html.dark .hero-badge {
  background: rgba(0, 120, 212, 0.18);
  border-color: rgba(0, 120, 212, 0.35);
  color: var(--azure-cyan);
}

.hero-title {
  font-size: 2.25rem;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.hero-desc {
  font-size: 1rem;
  color: var(--text-secondary);
  max-width: 680px;
  line-height: 1.6;
}

.snapshot-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin: 8px 0;
}

.snapshot-item {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

html.dark .snapshot-item {
  background: var(--bg-surface-elevated);
  border-color: var(--border-color);
  box-shadow: none;
}

.snapshot-item .label {
  font-size: 0.72rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.03em;
}

html.dark .snapshot-item .label {
  color: var(--text-muted);
}

.snapshot-item .value {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: 2px;
}

.snapshot-item .highlight {
  color: #0078d4;
}

html.dark .snapshot-item .highlight {
  color: var(--azure-cyan);
}

.snapshot-item .highlight-green {
  color: #15803d;
}

html.dark .snapshot-item .highlight-green {
  color: #4ade80;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
}

/* Readiness Gauge */
.hero-gauge-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 24px;
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 16px rgba(0, 120, 212, 0.06);
}

html.dark .hero-gauge-card {
  background: var(--bg-surface);
  border-color: var(--border-color);
  box-shadow: none;
}

.gauge-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  text-align: center;
  margin-bottom: 12px;
}

html.dark .gauge-title {
  color: var(--text-primary);
}

.gauge-circle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: radial-gradient(circle, rgba(0, 120, 212, 0.08) 0%, transparent 75%);
  border-radius: 50%;
  margin-bottom: 16px;
}

html.dark .gauge-circle-container {
  background: radial-gradient(circle, rgba(0, 120, 212, 0.15) 0%, transparent 75%);
}

.gauge-value {
  font-size: 2.8rem;
  font-weight: 800;
  color: #0078d4;
  line-height: 1;
}

html.dark .gauge-value {
  background: linear-gradient(135deg, #0078d4 0%, #50e6ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gauge-sub {
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 500;
  margin-top: 4px;
}

html.dark .gauge-sub {
  color: var(--text-muted);
}

.metric-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.metric-row .m-val {
  font-weight: 600;
  color: var(--text-primary);
}

.progress-track {
  height: 6px;
  background: #e2e8f0;
  border-radius: var(--radius-full);
  overflow: hidden;
}

html.dark .progress-track {
  background: var(--bg-surface-elevated);
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.4s ease;
}
/* Quick Nav Cards */
.quick-nav-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.quick-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-card:hover {
  transform: translateY(-2px);
  border-color: var(--azure-blue);
  box-shadow: var(--shadow-md);
}

.q-icon {
  width: 46px;
  height: 46px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.q-info {
  flex: 1;
  min-width: 0;
}

.q-info h3 {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 2px;
}

.q-info p {
  font-size: 0.78rem;
  color: var(--text-muted);
  line-height: 1.35;
}

.q-arrow {
  color: var(--text-muted);
  transition: transform 0.2s ease;
}

.quick-card:hover .q-arrow {
  transform: translateX(4px);
  color: var(--azure-cyan);
}

/* Section Container */
.section-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.section-subtitle {
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

/* Domains Grid */
.domains-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.domain-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 22px;
}

.domain-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.domain-icon-box {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.domain-badge-group {
  display: flex;
  gap: 6px;
}

.domain-name {
  font-size: 1.15rem;
  font-weight: 700;
  margin-top: 4px;
}

.domain-vi {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-top: -6px;
}

.domain-topics-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 8px 0 12px;
}

.domain-topics-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.84rem;
  color: var(--text-secondary);
}

.check-icon {
  margin-top: 3px;
  flex-shrink: 0;
}

.domain-card-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

/* History */
.exam-history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-surface-elevated);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.h-main {
  display: flex;
  flex-direction: column;
}

.h-title {
  font-size: 0.95rem;
}

.h-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.h-scores {
  display: flex;
  align-items: center;
  gap: 12px;
}

.h-raw {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

@media (max-width: 1024px) {
  .hero-banner {
    grid-template-columns: 1fr;
  }
  .quick-nav-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .domains-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .snapshot-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .quick-nav-grid {
    grid-template-columns: 1fr;
  }
}
</style>
