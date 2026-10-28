<script setup>
import { ref, computed, nextTick, watch } from 'vue';
import { useStudyStore } from '../composables/useStudyStore';
import { marked } from 'marked';
import { 
  Search, 
  CheckCircle, 
  Circle, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  BookOpen, 
  Clock, 
  ArrowUp,
  List,
  Target,
  Sparkles,
  FileText,
  Sliders,
  Type
} from 'lucide-vue-next';

const store = useStudyStore();
const searchQuery = ref('');
const selectedDomainFilter = ref('ALL');
const contentRef = ref(null);
const fontSize = ref('normal'); // 'small' | 'normal' | 'large'
const activeHeadingId = ref('');

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

// Custom marked renderer to add IDs to headings
const renderer = {
  heading({ tokens, depth }) {
    const raw = tokens.map(t => t.raw || t.text || '').join('');
    const id = slugify(raw);
    const text = this.parser.parseInline(tokens);
    return `<h${depth} id="${id}">${text}</h${depth}>\n`;
  }
};

marked.use({ renderer });
marked.setOptions({
  gfm: true,
  breaks: true
});

const domains = ['ALL', 'Domain 1', 'Domain 2', 'Domain 3', 'Domain 4', 'Practice & Labs', 'General'];

const filteredSections = computed(() => {
  return store.sections.filter(sec => {
    if (selectedDomainFilter.value !== 'ALL') {
      if (sec.domain !== selectedDomainFilter.value) return false;
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      const inTitle = sec.title.toLowerCase().includes(q);
      const inContent = sec.content.toLowerCase().includes(q);
      return inTitle || inContent;
    }
    return true;
  });
});

const currentSection = computed(() => {
  return store.sections.find(s => s.id === store.activeSectionId) || store.sections[0];
});

const currentIndex = computed(() => {
  return store.sections.findIndex(s => s.id === currentSection.value.id);
});

const wordCount = computed(() => {
  if (!currentSection.value) return 0;
  return currentSection.value.content.split(/\s+/).filter(Boolean).length;
});

const readingTime = computed(() => {
  return Math.max(1, Math.round(wordCount.value / 180));
});

// In-page Table of Contents
const inPageTOC = computed(() => {
  if (!currentSection.value) return [];
  const lines = currentSection.value.content.split('\n');
  const headers = [];
  for (const line of lines) {
    const m = line.match(/^(#{2,4})\s+(.*)/);
    if (m) {
      const level = m[1].length;
      const text = m[2].trim().replace(/\*\*/g, '').replace(/`/g, '');
      const id = slugify(text);
      if (text && id) {
        headers.push({ level, text, id });
      }
    }
  }
  return headers;
});

const renderedHtml = computed(() => {
  if (!currentSection.value) return '';
  return marked.parse(currentSection.value.content);
});

function selectSection(id) {
  store.activeSectionId = id;
  scrollToTop();
}

function prevSection() {
  if (currentIndex.value > 0) {
    store.activeSectionId = store.sections[currentIndex.value - 1].id;
    scrollToTop();
  }
}

function nextSection() {
  if (currentIndex.value < store.sections.length - 1) {
    store.activeSectionId = store.sections[currentIndex.value + 1].id;
    scrollToTop();
  }
}

function scrollToTop() {
  if (contentRef.value) {
    contentRef.value.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function scrollToHeader(id) {
  if (!contentRef.value) return;
  activeHeadingId.value = id;
  const target = contentRef.value.querySelector(`#${id}`);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function goToDomainPractice() {
  store.currentTab = 'simulator';
}

function attachCodeCopyButtons() {
  nextTick(() => {
    if (!contentRef.value) return;
    const preBlocks = contentRef.value.querySelectorAll('pre');
    preBlocks.forEach((pre) => {
      if (pre.querySelector('.code-copy-btn')) return;

      const codeElement = pre.querySelector('code');
      const text = codeElement ? codeElement.innerText : pre.innerText;

      const copyBtn = document.createElement('button');
      copyBtn.className = 'code-copy-btn';
      copyBtn.innerHTML = '<span>Sao chép</span>';
      
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(text);
        copyBtn.innerHTML = '<span style="color: #4ade80">Đã chép!</span>';
        setTimeout(() => {
          copyBtn.innerHTML = '<span>Sao chép</span>';
        }, 2000);
      });

      pre.style.position = 'relative';
      pre.appendChild(copyBtn);
    });
  });
}

watch(renderedHtml, () => {
  attachCodeCopyButtons();
}, { immediate: true });
</script>

<template>
  <div class="study-guide-layout">
    <!-- 1. LEFT SIDEBAR: SECTIONS LIST & SEARCH -->
    <aside class="guide-sidebar">
      <div class="sidebar-header">
        <div class="search-input-wrap">
          <Search class="search-icon" :size="16" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Tìm kiếm trong tài liệu..." 
            class="search-input"
          />
        </div>

        <!-- Filter domain pills -->
        <div class="domain-pills">
          <button 
            v-for="d in domains" 
            :key="d"
            class="domain-pill"
            :class="{ active: selectedDomainFilter === d }"
            @click="selectedDomainFilter = d"
          >
            {{ d === 'ALL' ? 'Tất cả' : d }}
          </button>
        </div>
      </div>

      <!-- Sections List -->
      <div class="sections-menu">
        <div 
          v-for="(sec) in filteredSections" 
          :key="sec.id"
          class="section-menu-item"
          :class="{ active: sec.id === store.activeSectionId }"
          @click="selectSection(sec.id)"
        >
          <!-- Read status check -->
          <button 
            class="status-btn"
            :title="store.completedSections.has(sec.id) ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'"
            @click.stop="store.toggleSectionCompleted(sec.id)"
          >
            <CheckCircle v-if="store.completedSections.has(sec.id)" class="icon-checked" :size="16" />
            <Circle v-else class="icon-unchecked" :size="16" />
          </button>

          <div class="sec-item-text">
            <span class="sec-item-title">{{ sec.title }}</span>
            <span class="sec-item-domain">{{ sec.domain }}</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- 2. CENTER: ARTICLE CONTENT -->
    <main ref="contentRef" class="guide-content" :class="`font-${fontSize}`">
      <div class="guide-article-inner">
        <!-- Article Top Header Bar -->
        <div class="article-top-bar">
          <div class="article-meta">
            <span class="badge badge-blue">{{ currentSection?.domain }}</span>
            <span class="meta-item">
              <Clock :size="14" />
              <span>Khoảng {{ readingTime }} phút đọc ({{ wordCount }} từ)</span>
            </span>
            <span class="meta-item">
              <BookOpen :size="14" />
              <span>Phần {{ currentIndex + 1 }} / {{ store.sections.length }}</span>
            </span>
          </div>

          <button 
            class="btn"
            :class="store.completedSections.has(currentSection?.id) ? 'btn-secondary' : 'btn-primary'"
            @click="store.toggleSectionCompleted(currentSection?.id)"
          >
            <CheckCircle :size="16" />
            <span>{{ store.completedSections.has(currentSection?.id) ? 'Đã hoàn thành' : 'Đánh dấu đã đọc' }}</span>
          </button>
        </div>

        <!-- Rendered Markdown HTML Body -->
        <article class="markdown-body" v-html="renderedHtml"></article>

        <!-- Bottom Nav (Prev / Next) -->
        <div class="article-bottom-nav">
          <button 
            class="btn btn-secondary"
            :disabled="currentIndex === 0"
            @click="prevSection"
          >
            <ChevronLeft :size="18" />
            <span>Bài trước</span>
          </button>

          <button class="btn btn-secondary" @click="scrollToTop">
            <ArrowUp :size="16" />
            <span>Lên đầu trang</span>
          </button>

          <button 
            class="btn btn-primary"
            :disabled="currentIndex === store.sections.length - 1"
            @click="nextSection"
          >
            <span>Bài tiếp theo</span>
            <ChevronRight :size="18" />
          </button>
        </div>
      </div>
    </main>

    <!-- 3. RIGHT SIDEBAR: IN-PAGE TOC & STUDY TOOLS -->
    <aside class="right-panel">
      <!-- Reading Preferences Box -->
      <div class="panel-box card">
        <div class="panel-box-title">
          <Sliders :size="15" />
          <span>Tùy chọn đọc</span>
        </div>
        
        <div class="font-size-picker">
          <span class="fs-label">Cỡ chữ:</span>
          <div class="fs-buttons">
            <button 
              class="fs-btn" 
              :class="{ active: fontSize === 'small' }"
              @click="fontSize = 'small'"
              title="Cỡ nhỏ"
            >
              A-
            </button>
            <button 
              class="fs-btn" 
              :class="{ active: fontSize === 'normal' }"
              @click="fontSize = 'normal'"
              title="Cỡ chuẩn"
            >
              A
            </button>
            <button 
              class="fs-btn" 
              :class="{ active: fontSize === 'large' }"
              @click="fontSize = 'large'"
              title="Cỡ lớn"
            >
              A+
            </button>
          </div>
        </div>

        <button 
          class="btn btn-outline-azure btn-sm quick-action-btn"
          @click="store.toggleSectionCompleted(currentSection?.id)"
        >
          <CheckCircle :size="14" />
          <span>{{ store.completedSections.has(currentSection?.id) ? 'Hủy đánh dấu đọc' : 'Đánh dấu đã học xong' }}</span>
        </button>

        <button 
          class="btn btn-secondary btn-sm quick-action-btn"
          @click="goToDomainPractice"
        >
          <Target :size="14" />
          <span>Luyện đề thi Domain này</span>
        </button>
      </div>

      <!-- In-Page Table of Contents -->
      <div v-if="inPageTOC.length > 0" class="panel-box card toc-box">
        <div class="panel-box-title">
          <List :size="15" />
          <span>Mục lục trong bài ({{ inPageTOC.length }})</span>
        </div>

        <nav class="in-page-links">
          <a
            v-for="(h, idx) in inPageTOC"
            :key="idx"
            href="javascript:void(0)"
            class="toc-link"
            :class="[
              `level-${h.level}`,
              { active: activeHeadingId === h.id }
            ]"
            @click.prevent="scrollToHeader(h.id)"
          >
            {{ h.text }}
          </a>
        </nav>
      </div>

      <!-- Quick Exam Tip Callout -->
      <div class="panel-box card exam-tip-card">
        <div class="tip-header">
          <Sparkles :size="16" style="color: #fb923c;" />
          <strong>Ghi nhớ chuẩn thi AI-200</strong>
        </div>
        <p class="tip-body">
          Microsoft tập trung vào khả năng ra quyết định kiến trúc, bảo mật Managed Identity, 
          cấu hình cổng listener, và kỹ năng chẩn đoán sự cố qua KQL thay vì học thuộc định nghĩa.
        </p>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.study-guide-layout {
  display: grid;
  grid-template-columns: 310px minmax(0, 1fr) 290px;
  height: calc(100vh - 65px);
  overflow: hidden;
  background: var(--bg-main);
}

/* 1. Left Sidebar */
.guide-sidebar {
  background: var(--bg-surface);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-input-wrap {
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
  padding: 8px 12px 8px 36px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-surface-elevated);
  color: var(--text-primary);
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--azure-blue);
}

.domain-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.domain-pill {
  font-size: 0.72rem;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.domain-pill:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.domain-pill.active {
  background: var(--azure-blue);
  color: #ffffff;
  border-color: var(--azure-blue);
}

.sections-menu {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-menu-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.section-menu-item:hover {
  background: var(--bg-surface-hover);
}

.section-menu-item.active {
  background: rgba(0, 120, 212, 0.15);
  border-left: 3px solid var(--azure-blue);
}

.status-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px 0 0;
  color: var(--text-muted);
  display: flex;
}

.icon-checked {
  color: #4ade80;
}

.icon-unchecked {
  color: var(--text-muted);
}

.sec-item-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.sec-item-title {
  font-size: 0.84rem;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.35;
}

.sec-item-domain {
  font-size: 0.7rem;
  color: var(--text-muted);
}

/* 2. Center Content */
.guide-content {
  overflow-y: auto;
  padding: 32px 40px 80px;
  scroll-behavior: smooth;
}

.guide-article-inner {
  max-width: 900px;
  margin: 0 auto;
}

.font-small .markdown-body {
  font-size: 0.88rem;
  line-height: 1.6;
}

.font-normal .markdown-body {
  font-size: 0.98rem;
  line-height: 1.7;
}

.font-large .markdown-body {
  font-size: 1.1rem;
  line-height: 1.8;
}

.article-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 12px;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.82rem;
  color: var(--text-muted);
  flex-wrap: wrap;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.article-bottom-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
  flex-wrap: wrap;
  gap: 12px;
}

/* 3. Right Panel */
.right-panel {
  background: var(--bg-surface);
  border-left: 1px solid var(--border-color);
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.panel-box {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--bg-surface-elevated);
}

.panel-box-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.font-size-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fs-label {
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.fs-buttons {
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.fs-btn {
  padding: 4px 10px;
  background: var(--bg-surface);
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.fs-btn:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.fs-btn.active {
  background: var(--azure-blue);
  color: #ffffff;
}

.quick-action-btn {
  width: 100%;
}

.toc-box {
  max-height: 480px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.in-page-links {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  padding-right: 4px;
}

.toc-link {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-decoration: none;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  line-height: 1.35;
  transition: all 0.15s ease;
  white-space: normal;
  display: block;
}

.toc-link:hover {
  background: var(--bg-surface-hover);
  color: var(--azure-cyan);
}

.toc-link.active {
  color: #ffffff;
  background: var(--azure-blue);
  font-weight: 600;
}

.toc-link.level-2 {
  font-weight: 600;
  color: var(--text-primary);
}

.toc-link.level-3 {
  padding-left: 14px;
}

.toc-link.level-4 {
  padding-left: 22px;
  font-size: 0.76rem;
  color: var(--text-muted);
}

.exam-tip-card {
  border-left: 3px solid #fb923c;
  background: rgba(216, 59, 1, 0.05);
}

.tip-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: #fb923c;
}

.tip-body {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.45;
}

:deep(.code-copy-btn) {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 0.72rem;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-sm);
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.code-copy-btn:hover) {
  background: rgba(255, 255, 255, 0.2);
}

@media (max-width: 1200px) {
  .study-guide-layout {
    grid-template-columns: 280px minmax(0, 1fr);
  }
  .right-panel {
    display: none;
  }
}

@media (max-width: 768px) {
  .study-guide-layout {
    grid-template-columns: 1fr;
    height: auto;
  }
  .guide-sidebar {
    height: 280px;
  }
  .guide-content {
    padding: 20px;
  }
}
</style>
