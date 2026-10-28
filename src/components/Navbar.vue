<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStudyStore } from '../composables/useStudyStore';
import SearchModal from './SearchModal.vue';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Flame, 
  TableProperties, 
  Code2, 
  Sparkles, 
  CheckSquare, 
  Moon, 
  Sun,
  RotateCcw,
  Search,
  Menu,
  X
} from 'lucide-vue-next';

const store = useStudyStore();
const isSearchOpen = ref(false);
const isMobileMenuOpen = ref(false);

const navItems = computed(() => [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'guide', label: 'Tài liệu học', icon: BookOpen, badge: `${store.sectionsProgressPercent}%` },
  { id: 'simulator', label: 'Thi thử (Sim & Test)', icon: GraduationCap, highlight: true },
  { id: 'drills', label: 'Tình huống thực tế', icon: Flame, badge: `${store.drillsMasteredCount}/${store.totalDrills}` },
  { id: 'decisions', label: 'Bảng quyết định & Kiến trúc', icon: TableProperties },
  { id: 'cheatsheet', label: 'CLI & SDK & KQL', icon: Code2 },
  { id: 'vocab', label: 'Thuật ngữ (Flashcard)', icon: Sparkles },
  { id: 'readiness', label: 'Cổng sẵn sàng 95%', icon: CheckSquare, badge: `${store.readinessPercent}%` },
]);

function handleGlobalKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    isSearchOpen.value = true;
  }
}

function selectTab(id) {
  store.currentTab = id;
  isMobileMenuOpen.value = false;
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});
</script>

<template>
  <header class="navbar-wrapper">
    <div class="navbar-container">
      <!-- Left: Mobile Menu Toggle & Brand Logo -->
      <div class="brand-group">
        <button class="mobile-menu-btn" @click="isMobileMenuOpen = !isMobileMenuOpen">
          <Menu v-if="!isMobileMenuOpen" :size="20" />
          <X v-else :size="20" />
        </button>

        <div class="navbar-brand" @click="selectTab('dashboard')">
          <div class="azure-badge-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M13.05 4.24l-3.32 6.32 5.09 5.8 5.76-8.52-7.53-3.6z" fill="#0078D4"/>
              <path d="M4 18.25h16l-3.88-5.89-6.38 2.37L4 18.25z" fill="#50E6FF"/>
              <path d="M9.73 10.56L4 18.25l5.74-3.52 4.09-1.52-4.1-2.65z" fill="#1490DF"/>
            </svg>
          </div>
          <div class="brand-text">
            <div class="brand-title">Azure AI-200</div>
            <div class="brand-subtitle">Interactive Study Portal</div>
          </div>
        </div>
      </div>

      <!-- Center: Desktop Navigation Tabs -->
      <nav class="nav-links desktop-nav">
        <button
          v-for="item in navItems"
          :key="item.id"
          class="nav-tab"
          :class="{ active: store.currentTab === item.id, highlight: item.highlight }"
          @click="selectTab(item.id)"
        >
          <component :is="item.icon" class="tab-icon" :size="16" />
          <span>{{ item.label }}</span>
          <span v-if="item.badge" class="nav-pill">{{ item.badge }}</span>
        </button>
      </nav>

      <!-- Right: Search trigger & Theme Controls -->
      <div class="nav-actions">
        <!-- Quick Search Button -->
        <button class="search-trigger-btn" @click="isSearchOpen = true" title="Tìm kiếm nhanh (Ctrl + K)">
          <Search :size="16" />
          <span class="search-btn-text">Tìm kiếm...</span>
          <kbd class="kbd-shortcut">Ctrl K</kbd>
        </button>

        <!-- Theme Toggle -->
        <button 
          class="action-btn" 
          :title="store.isDarkMode ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'"
          @click="store.isDarkMode = !store.isDarkMode"
        >
          <Sun v-if="store.isDarkMode" :size="18" />
          <Moon v-else :size="18" />
        </button>

        <!-- Reset Button -->
        <button 
          class="action-btn" 
          title="Đặt lại tiến độ học tập"
          @click="store.resetAllProgress"
        >
          <RotateCcw :size="16" />
        </button>
      </div>
    </div>

    <!-- Mobile Drawer Menu -->
    <div v-if="isMobileMenuOpen" class="mobile-drawer card">
      <nav class="mobile-nav-list">
        <button
          v-for="item in navItems"
          :key="item.id"
          class="mobile-nav-item"
          :class="{ active: store.currentTab === item.id }"
          @click="selectTab(item.id)"
        >
          <component :is="item.icon" :size="18" />
          <span class="m-label">{{ item.label }}</span>
          <span v-if="item.badge" class="badge badge-muted">{{ item.badge }}</span>
        </button>
      </nav>
    </div>

    <!-- Universal Search Modal -->
    <SearchModal :is-open="isSearchOpen" @close="isSearchOpen = false" />
  </header>
</template>

<style scoped>
.navbar-wrapper {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(12px);
  box-shadow: var(--shadow-sm);
}

.navbar-container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 20px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mobile-menu-btn {
  display: none;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  padding: 6px;
  cursor: pointer;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex-shrink: 0;
}

.azure-badge-icon {
  width: 36px;
  height: 36px;
  background: rgba(0, 120, 212, 0.12);
  border: 1px solid rgba(0, 120, 212, 0.3);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #0078d4 0%, #00a4ef 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-subtitle {
  font-size: 0.68rem;
  color: var(--text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  padding: 8px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.nav-links::-webkit-scrollbar {
  display: none;
}

.nav-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.84rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.nav-tab:hover {
  color: var(--text-primary);
  background: var(--bg-surface-hover);
}

.nav-tab.active {
  color: #ffffff !important;
  background: var(--azure-blue) !important;
  border-color: var(--azure-hover) !important;
  box-shadow: 0 2px 8px rgba(0, 120, 212, 0.35);
}

.nav-tab.highlight:not(.active) {
  border-color: rgba(0, 120, 212, 0.4);
  color: var(--azure-cyan);
}

.nav-pill {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.2);
  color: currentColor;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.search-trigger-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-color);
  padding: 6px 12px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.82rem;
  transition: all 0.2s ease;
}

.search-trigger-btn:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
  border-color: var(--azure-blue);
}

.kbd-shortcut {
  font-family: inherit;
  font-size: 0.68rem;
  font-weight: 600;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 1px 5px;
  color: var(--text-muted);
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-surface-elevated);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  color: var(--text-primary);
  background: var(--bg-surface-hover);
  border-color: var(--text-muted);
}

/* Mobile Drawer */
.mobile-drawer {
  display: none;
  border-radius: 0;
  border-left: none;
  border-right: none;
  padding: 12px 16px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
}

.mobile-nav-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.mobile-nav-item:hover,
.mobile-nav-item.active {
  background: rgba(0, 120, 212, 0.15);
  color: var(--azure-cyan);
}

.mobile-nav-item .m-label {
  flex: 1;
}

@media (max-width: 1080px) {
  .search-btn-text,
  .kbd-shortcut {
    display: none;
  }
}

@media (max-width: 900px) {
  .desktop-nav {
    display: none;
  }
  .mobile-menu-btn {
    display: flex;
  }
  .mobile-drawer {
    display: block;
  }
}
</style>
