<script setup>
import { ref, computed } from 'vue';
import { useStudyStore } from '../composables/useStudyStore';
import { 
  TableProperties, 
  HelpCircle, 
  Sparkles, 
  Check, 
  Layers, 
  Cpu, 
  Database, 
  Radio, 
  KeyRound, 
  SlidersHorizontal,
  Compass
} from 'lucide-vue-next';

const store = useStudyStore();
const selectedTableIdx = ref(0);

// Architecture Advisor questionnaire
const advisorStep = ref(1);
const selectedComputeNeed = ref('');
const selectedDataNeed = ref('');
const selectedMessagingNeed = ref('');

const tables = store.decisionTables;

const tableIcons = [Cpu, Database, Radio, KeyRound, Layers];

// Recommendation Logic based on AI-200 Blueprint
const advisorRecommendation = computed(() => {
  let recs = [];

  // Compute recommendation
  if (selectedComputeNeed.value === 'scale_zero_keda') {
    recs.push({
      service: 'Azure Container Apps (ACA)',
      reason: 'Cung cấp tính năng scale-to-zero tự nhiên thông qua KEDA rules, hỗ trợ revisions traffic splitting và chi phí thấp cho microservices AI.',
      color: '#0078d4'
    });
  } else if (selectedComputeNeed.value === 'full_k8s') {
    recs.push({
      service: 'Azure Kubernetes Service (AKS)',
      reason: 'Cần toàn quyền kiểm soát Kubernetes API, Custom Resource Definitions (CRDs), DaemonSets hoặc GPU scheduling phức tạp.',
      color: '#008272'
    });
  } else if (selectedComputeNeed.value === 'simple_web') {
    recs.push({
      service: 'Azure App Service on Linux (Containers)',
      reason: 'Đơn giản nhất để host web/API với Custom Docker Image, hỗ trợ deployment slots nhưng không hỗ trợ scale-to-zero theo queue KEDA.',
      color: '#107c41'
    });
  }

  // Data / Vector recommendation
  if (selectedDataNeed.value === 'cosmos_nosql') {
    recs.push({
      service: 'Azure Cosmos DB for NoSQL (với Vector Index)',
      reason: 'Dữ liệu JSON NoSQL linh hoạt quy mô toàn cầu, tích hợp sẵn DiskANN vector index, point read tốc độ cao và Change Feed xử lý hướng sự kiện.',
      color: '#107c41'
    });
  } else if (selectedDataNeed.value === 'pgvector') {
    recs.push({
      service: 'Azure Database for PostgreSQL Flexible Server (pgvector)',
      reason: 'Dành cho bài toán cần quan hệ ACID, SQL joins phức tạp kết hợp vector similarity (`<=>` cosine) và HNSW/IVFFlat index.',
      color: '#0078d4'
    });
  } else if (selectedDataNeed.value === 'semantic_cache') {
    recs.push({
      service: 'Azure Managed Redis',
      reason: 'Độ trễ dưới mili-giây (sub-millisecond), cực kỳ lý tưởng cho Semantic Cache (bộ nhớ đệm ngữ nghĩa tái sử dụng prompt LLM) và Fast Session memory.',
      color: '#d83b01'
    });
  }

  // Messaging recommendation
  if (selectedMessagingNeed.value === 'service_bus_queue') {
    recs.push({
      service: 'Azure Service Bus Queue',
      reason: 'Đảm bảo xử lý lệnh (Command) với cạnh tranh người nhận (competing consumers), Peek-Lock, Dead-lettering và giao dịch xử lý chính xác.',
      color: '#d83b01'
    });
  } else if (selectedMessagingNeed.value === 'service_bus_topic') {
    recs.push({
      service: 'Azure Service Bus Topic & Subscriptions',
      reason: 'Mô hình Fan-out: một tin nhắn xuất bản được gửi đến nhiều người nhận độc lập qua các Subscription kèm bộ lọc SQL filter.',
      color: '#8764b8'
    });
  } else if (selectedMessagingNeed.value === 'event_grid') {
    recs.push({
      service: 'Azure Event Grid',
      reason: 'Phát tán thông báo sự kiện (Notification) với độ trễ thấp, tích hợp hàng loạt dịch vụ Azure, lọc theo Event Type và Subject.',
      color: '#00a4ef'
    });
  }

  return recs;
});

function resetAdvisor() {
  selectedComputeNeed.value = '';
  selectedDataNeed.value = '';
  selectedMessagingNeed.value = '';
}
</script>

<template>
  <div class="decision-page">
    <!-- Header -->
    <div class="decision-hero">
      <div class="badge badge-blue">
        <TableProperties :size="16" />
        <span>AI-200 Decision Tables</span>
      </div>
      <h1 class="decision-title">Bảng Quyết Định Dịch Vụ & Kiến Trúc</h1>
      <p class="decision-desc">
        Trong đề thi AI-200, các câu hỏi thường yêu cầu bạn chọn dịch vụ "Best Fit" dựa trên tiêu chí kỹ thuật: 
        độ trễ, scale-to-zero, locks, vector recall, và chi phí vận hành.
      </p>
    </div>

    <!-- Interactive Advisor Card -->
    <div class="advisor-card card">
      <div class="advisor-header">
        <div class="advisor-icon">
          <Compass :size="24" />
        </div>
        <div>
          <h2 class="advisor-title">Bộ trợ lý Quyết định Kiến trúc (AI Architecture Advisor)</h2>
          <p class="advisor-subtitle">Chọn nhanh các yêu cầu của bài toán để xem dịch vụ Azure tối ưu theo chuẩn AI-200</p>
        </div>
      </div>

      <div class="advisor-grid">
        <!-- Question 1: Compute -->
        <div class="advisor-box">
          <label class="advisor-label">1. Nhu cầu Compute / Container:</label>
          <select v-model="selectedComputeNeed" class="advisor-select">
            <option value="">-- Chọn yêu cầu hạ tầng --</option>
            <option value="scale_zero_keda">Microservices AI cần scale về 0 khi hàng đợi rỗng (KEDA)</option>
            <option value="full_k8s">Cần toàn quyền Kubernetes API, CRDs, GPU DaemonSets</option>
            <option value="simple_web">Web API thông thường, tối thiểu hóa gánh nặng vận hành</option>
          </select>
        </div>

        <!-- Question 2: Vector Data -->
        <div class="advisor-box">
          <label class="advisor-label">2. Nhu cầu Lưu trữ & Vector Search:</label>
          <select v-model="selectedDataNeed" class="advisor-select">
            <option value="">-- Chọn giải pháp dữ liệu --</option>
            <option value="cosmos_nosql">NoSQL JSON toàn cầu + Vector DiskANN + Change Feed</option>
            <option value="pgvector">Relational SQL + ACID Transactions + pgvector (HNSW/IVFFlat)</option>
            <option value="semantic_cache">Semantic Cache độ trễ dưới 1ms cho LLM Prompts / Session</option>
          </select>
        </div>

        <!-- Question 3: Messaging -->
        <div class="advisor-box">
          <label class="advisor-label">3. Nhu cầu Tin nhắn & Sự kiện:</label>
          <select v-model="selectedMessagingNeed" class="advisor-select">
            <option value="">-- Chọn mô hình truyền tin --</option>
            <option value="service_bus_queue">Giao tác vụ (Task/Command), cần Peek-Lock và Dead-letter</option>
            <option value="service_bus_topic">Gửi 1 tin cho nhiều Consumer nhận riêng biệt (Fan-out)</option>
            <option value="event_grid">Thông báo sự kiện phản ứng nhanh (Event Notification)</option>
          </select>
        </div>
      </div>

      <!-- Recommendation Output -->
      <div v-if="advisorRecommendation.length > 0" class="recommendation-result">
        <div class="rec-title">
          <Sparkles :size="18" style="color: #4ade80;" />
          <strong>Đề xuất kiến trúc phù hợp:</strong>
        </div>
        <div class="rec-cards">
          <div 
            v-for="(rec, idx) in advisorRecommendation" 
            :key="idx"
            class="rec-item"
            :style="{ borderLeftColor: rec.color }"
          >
            <strong class="rec-service" :style="{ color: rec.color }">{{ rec.service }}</strong>
            <p class="rec-reason">{{ rec.reason }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Decision Tables Tabs -->
    <div class="tables-section">
      <div class="table-tabs">
        <button 
          v-for="(t, idx) in tables" 
          :key="idx"
          class="table-tab"
          :class="{ active: selectedTableIdx === idx }"
          @click="selectedTableIdx = idx"
        >
          <component :is="tableIcons[idx % tableIcons.length]" :size="16" />
          <span>{{ t.title }}</span>
        </button>
      </div>

      <!-- Active Table -->
      <div v-if="tables[selectedTableIdx]" class="table-card card">
        <h3 class="table-heading">{{ tables[selectedTableIdx].title }}</h3>
        
        <div class="table-responsive">
          <table class="azure-table">
            <thead>
              <tr>
                <th v-for="(h, i) in tables[selectedTableIdx].headers" :key="i">
                  {{ h }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rIdx) in tables[selectedTableIdx].rows" :key="rIdx">
                <td v-for="(cell, cIdx) in row" :key="cIdx" :class="{ 'highlight-cell': cIdx === 0 }">
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.decision-page {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px 20px 60px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.decision-hero {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.decision-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.decision-desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
  max-width: 800px;
}

/* Advisor Card */
.advisor-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: linear-gradient(180deg, rgba(0, 120, 212, 0.06) 0%, var(--bg-surface) 100%);
  border-color: rgba(0, 120, 212, 0.35);
}

.advisor-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.advisor-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: rgba(0, 120, 212, 0.15);
  color: var(--azure-cyan);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.advisor-title {
  font-size: 1.15rem;
  font-weight: 700;
}

.advisor-subtitle {
  font-size: 0.84rem;
  color: var(--text-secondary);
}

.advisor-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.advisor-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.advisor-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.advisor-select {
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-surface-elevated);
  color: var(--text-primary);
  font-size: 0.85rem;
  outline: none;
}

.advisor-select:focus {
  border-color: var(--azure-blue);
}

.recommendation-result {
  background: var(--bg-surface-elevated);
  border-radius: var(--radius-md);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rec-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: var(--azure-cyan);
}

.rec-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.rec-item {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-left-width: 4px;
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rec-service {
  font-size: 0.95rem;
  font-weight: 700;
}

.rec-reason {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.45;
}

/* Tables Section */
.tables-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.table-tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.table-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.table-tab:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.table-tab.active {
  background: var(--azure-blue);
  color: #ffffff;
  border-color: var(--azure-blue);
}

.table-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.table-heading {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--azure-cyan);
}

.table-responsive {
  overflow-x: auto;
}

.azure-table {
  width: 100%;
  border-collapse: collapse;
}

.azure-table th,
.azure-table td {
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  font-size: 0.88rem;
  text-align: left;
}

.azure-table th {
  background: var(--bg-surface-elevated);
  color: var(--text-primary);
  font-weight: 700;
}

.highlight-cell {
  font-weight: 600;
  color: var(--azure-cyan);
}

.azure-table tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

@media (max-width: 1024px) {
  .advisor-grid,
  .rec-cards {
    grid-template-columns: 1fr;
  }
}
</style>
