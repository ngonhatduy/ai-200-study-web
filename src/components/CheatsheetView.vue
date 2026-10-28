<script setup>
import { ref, computed } from 'vue';
import { useStudyStore } from '../composables/useStudyStore';
import { 
  Code2, 
  Search, 
  Copy, 
  Check, 
  Terminal, 
  Database, 
  Activity, 
  FileCode,
  Sparkles
} from 'lucide-vue-next';

const store = useStudyStore();
const searchQuery = ref('');
const selectedLang = ref('ALL');
const copiedIndex = ref(null);

const languages = ['ALL', 'azurecli', 'python', 'sql', 'kusto'];

const langLabels = {
  ALL: 'Tất cả',
  azurecli: 'Azure CLI',
  python: 'Python SDK',
  sql: 'SQL & pgvector',
  kusto: 'KQL Log Analytics'
};

const filteredCheatsheets = computed(() => {
  return store.cheatsheets.filter(item => {
    if (selectedLang.value !== 'ALL' && item.language !== selectedLang.value) {
      return false;
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      const inTitle = item.title.toLowerCase().includes(q);
      const inCode = item.code.toLowerCase().includes(q);
      const inDesc = item.description.toLowerCase().includes(q);
      return inTitle || inCode || inDesc;
    }
    return true;
  });
});

function copyCode(code, index) {
  navigator.clipboard.writeText(code);
  copiedIndex.value = index;
  setTimeout(() => {
    copiedIndex.value = null;
  }, 2000);
}
</script>

<template>
  <div class="cheatsheet-page">
    <div class="sheet-hero">
      <div class="badge badge-purple">
        <Code2 :size="16" />
        <span>Section 11 & 11.1 Reference</span>
      </div>
      <h1 class="sheet-title">Bộ Tra Cứu Cú Pháp: CLI, SDK, SQL & KQL</h1>
      <p class="sheet-desc">
        Tổng hợp các mẫu lệnh nhận diện trọng tâm trong đề thi AI-200. Hãy chú ý các quy tắc sử dụng SDK 
        như tái sử dụng Client, DefaultAzureCredential, tham số hóa truy vấn và phân vùng Cosmos DB.
      </p>
    </div>

    <!-- Filter Bar -->
    <div class="sheet-filter-bar card">
      <div class="search-wrap">
        <Search class="search-icon" :size="16" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tìm kiếm cú pháp (ví dụ: AcrPull, VectorDistance, requests, pool, ConnectionPool)..." 
          class="search-input"
        />
      </div>

      <div class="lang-pills">
        <button 
          v-for="lang in languages" 
          :key="lang"
          class="lang-pill"
          :class="{ active: selectedLang === lang }"
          @click="selectedLang = lang"
        >
          {{ langLabels[lang] || lang }}
        </button>
      </div>
    </div>

    <!-- Cheatsheet Cards Grid -->
    <div class="snippets-grid">
      <div 
        v-for="(item, idx) in filteredCheatsheets" 
        :key="idx"
        class="snippet-card card"
      >
        <div class="snippet-header">
          <div class="snippet-title-box">
            <span class="badge" :class="item.language === 'python' ? 'badge-blue' : (item.language === 'sql' ? 'badge-green' : (item.language === 'kusto' ? 'badge-orange' : 'badge-purple'))">
              {{ langLabels[item.language] || item.language }}
            </span>
            <h3 class="snippet-title">{{ item.title }}</h3>
          </div>

          <button 
            class="copy-btn" 
            :title="copiedIndex === idx ? 'Đã sao chép' : 'Sao chép đoạn mã'"
            @click="copyCode(item.code, idx)"
          >
            <Check v-if="copiedIndex === idx" :size="16" style="color: #4ade80;" />
            <Copy v-else :size="16" />
            <span>{{ copiedIndex === idx ? 'Đã chép!' : 'Sao chép' }}</span>
          </button>
        </div>

        <p v-if="item.description" class="snippet-desc">{{ item.description }}</p>

        <!-- Code Block -->
        <div class="code-wrapper">
          <pre><code>{{ item.code }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cheatsheet-page {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px 20px 60px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sheet-hero {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sheet-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.sheet-desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
  max-width: 800px;
}

.sheet-filter-bar {
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

.lang-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.lang-pill {
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background: var(--bg-surface-elevated);
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lang-pill:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.lang-pill.active {
  background: var(--azure-blue);
  color: #ffffff;
  border-color: var(--azure-blue);
}

.snippets-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.snippet-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 22px;
}

.snippet-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.snippet-title-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.snippet-title {
  font-size: 1.15rem;
  font-weight: 700;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-color);
  padding: 6px 12px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.copy-btn:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
  border-color: var(--text-muted);
}

.snippet-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.45;
}

.code-wrapper {
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-top: 4px;
}

.code-wrapper pre {
  margin: 0;
  padding: 16px;
  background: #080d1a !important;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow-x: auto;
}

.code-wrapper code {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  line-height: 1.5;
  color: #e2e8f0;
}

@media (max-width: 960px) {
  .snippets-grid {
    grid-template-columns: 1fr;
  }
}
</style>
