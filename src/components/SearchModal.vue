<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useStudyStore } from '../composables/useStudyStore';
import { 
  Search, 
  X, 
  BookOpen, 
  GraduationCap, 
  Flame, 
  Code2, 
  Sparkles, 
  ChevronRight,
  ArrowRight
} from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close']);

const store = useStudyStore();
const searchQuery = ref('');
const searchInput = ref(null);
const selectedIndex = ref(0);

const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  const results = [];

  // 1. Search in Study Guide Sections
  store.sections.forEach(sec => {
    const titleMatch = sec.title.toLowerCase().includes(q);
    const contentMatch = sec.content.toLowerCase().includes(q);
    if (titleMatch || contentMatch) {
      results.push({
        type: 'guide',
        category: 'Tài liệu học',
        title: sec.title,
        subtitle: sec.domain,
        icon: BookOpen,
        action: () => {
          store.activeSectionId = sec.id;
          store.currentTab = 'guide';
          emit('close');
        }
      });
    }
  });

  // 2. Search in Questions & Simulation
  store.questions.forEach(quest => {
    const titleMatch = quest.title.toLowerCase().includes(q);
    const textMatch = quest.question.toLowerCase().includes(q);
    const expMatch = (quest.explanation || '').toLowerCase().includes(q);
    if (titleMatch || textMatch || expMatch) {
      results.push({
        type: 'question',
        category: quest.set,
        title: `${quest.num ? `[Câu ${quest.num}] ` : ''}${quest.title}`,
        subtitle: `${quest.domain} • ${quest.type === 'drill' ? 'Tình huống thực tế' : 'Trắc nghiệm'}`,
        icon: quest.type === 'drill' ? Flame : GraduationCap,
        action: () => {
          if (quest.type === 'drill') {
            store.currentTab = 'drills';
          } else {
            store.currentTab = 'simulator';
          }
          emit('close');
        }
      });
    }
  });

  // 3. Search in Cheatsheets (Code)
  store.cheatsheets.forEach(sheet => {
    const titleMatch = sheet.title.toLowerCase().includes(q);
    const codeMatch = sheet.code.toLowerCase().includes(q);
    if (titleMatch || codeMatch) {
      results.push({
        type: 'code',
        category: 'CLI & Code Snippet',
        title: sheet.title,
        subtitle: sheet.language.toUpperCase(),
        icon: Code2,
        action: () => {
          store.currentTab = 'cheatsheet';
          emit('close');
        }
      });
    }
  });

  // 4. Search in Vocabulary
  store.vocabulary.forEach(vocab => {
    const termMatch = vocab.term.toLowerCase().includes(q);
    const defMatch = vocab.definition.toLowerCase().includes(q);
    if (termMatch || defMatch) {
      results.push({
        type: 'vocab',
        category: 'Thuật ngữ cốt lõi',
        title: vocab.term,
        subtitle: vocab.definition.substring(0, 90) + '...',
        icon: Sparkles,
        action: () => {
          store.currentTab = 'vocab';
          emit('close');
        }
      });
    }
  });

  return results.slice(0, 20); // Top 20 results
});

watch(() => props.isOpen, (open) => {
  if (open) {
    searchQuery.value = '';
    selectedIndex.value = 0;
    nextTick(() => {
      searchInput.value?.focus();
    });
  }
});

function handleKeydown(e) {
  if (!props.isOpen) return;

  if (e.key === 'Escape') {
    emit('close');
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (selectedIndex.value < searchResults.value.length - 1) {
      selectedIndex.value++;
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (selectedIndex.value > 0) {
      selectedIndex.value--;
    }
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (searchResults.value[selectedIndex.value]) {
      searchResults.value[selectedIndex.value].action();
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div v-if="isOpen" class="search-backdrop" @click="emit('close')">
    <div class="search-modal card" @click.stop>
      <!-- Search Input Header -->
      <div class="modal-input-row">
        <Search class="modal-search-icon" :size="20" />
        <input 
          ref="searchInput"
          v-model="searchQuery" 
          type="text" 
          placeholder="Tìm bất kỳ nội dung nào (nhập từ 2 ký tự: ACR, Cosmos, KEDA, KQL, RBAC...)..." 
          class="modal-search-field"
        />
        <button class="modal-close-btn" @click="emit('close')">
          <X :size="18" />
        </button>
      </div>

      <!-- Quick Tips -->
      <div class="search-shortcuts-bar">
        <span class="sc-tip">Nhấn <strong>Esc</strong> để đóng</span>
        <span class="sc-tip">Dùng phím <strong>↑</strong> <strong>↓</strong> để di chuyển</span>
        <span class="sc-tip">Nhấn <strong>Enter</strong> để chuyển đến mục chọn</span>
      </div>

      <!-- Search Results List -->
      <div class="search-results-list">
        <div v-if="searchQuery.trim().length >= 2 && searchResults.length === 0" class="no-results">
          Không tìm thấy kết quả nào phù hợp với từ khóa "<strong>{{ searchQuery }}</strong>"
        </div>

        <div v-else-if="!searchQuery.trim()" class="search-empty-prompt">
          <Sparkles :size="28" style="color: var(--azure-cyan);" />
          <p>Nhập từ khóa kỹ thuật để tra cứu ngay trong 23 chương tài liệu, 178 câu hỏi thi, bảng so sánh và cú pháp lệnh.</p>
        </div>

        <div 
          v-for="(res, idx) in searchResults" 
          :key="idx"
          class="result-row"
          :class="{ active: selectedIndex === idx }"
          @mouseenter="selectedIndex = idx"
          @click="res.action"
        >
          <div class="res-icon-box">
            <component :is="res.icon" :size="18" />
          </div>

          <div class="res-content">
            <div class="res-title-line">
              <span class="res-title">{{ res.title }}</span>
              <span class="res-cat-badge">{{ res.category }}</span>
            </div>
            <div class="res-sub-text">{{ res.subtitle }}</div>
          </div>

          <ChevronRight class="res-arrow" :size="16" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 80px 20px 20px;
}

.search-modal {
  width: 100%;
  max-width: 680px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-input-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-surface-elevated);
}

.modal-search-icon {
  color: var(--azure-cyan);
  flex-shrink: 0;
}

.modal-search-field {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 1.05rem;
  color: var(--text-primary);
  outline: none;
  font-family: inherit;
}

.modal-close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  padding: 4px;
  border-radius: var(--radius-sm);
}

.modal-close-btn:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.search-shortcuts-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 20px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.72rem;
  color: var(--text-muted);
}

.sc-tip strong {
  background: var(--bg-surface-elevated);
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.search-results-list {
  max-height: 480px;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.no-results {
  padding: 36px 20px;
  text-align: center;
  font-size: 0.92rem;
  color: var(--text-secondary);
}

.search-empty-prompt {
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.5;
}

.result-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.result-row:hover,
.result-row.active {
  background: rgba(0, 120, 212, 0.12);
}

.res-icon-box {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--bg-surface-elevated);
  color: var(--azure-cyan);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.result-row.active .res-icon-box {
  background: var(--azure-blue);
  color: #ffffff;
}

.res-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.res-title-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.res-title {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.res-cat-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: var(--radius-full);
  background: var(--bg-surface-elevated);
  color: var(--text-muted);
  white-space: nowrap;
}

.res-sub-text {
  font-size: 0.78rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.res-arrow {
  color: var(--text-muted);
  flex-shrink: 0;
}

.result-row.active .res-arrow {
  color: var(--azure-cyan);
  transform: translateX(2px);
}
</style>
