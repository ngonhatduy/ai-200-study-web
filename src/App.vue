<script setup>
import { useStudyStore } from './composables/useStudyStore';
import Navbar from './components/Navbar.vue';
import DashboardView from './components/DashboardView.vue';
import StudyGuideView from './components/StudyGuideView.vue';
import ExamSimulatorView from './components/ExamSimulatorView.vue';
import DrillsView from './components/DrillsView.vue';
import DecisionMatrixView from './components/DecisionMatrixView.vue';
import CheatsheetView from './components/CheatsheetView.vue';
import VocabularyView from './components/VocabularyView.vue';
import ReadinessView from './components/ReadinessView.vue';

const store = useStudyStore();
</script>

<template>
  <div class="app-shell" :class="{ dark: store.isDarkMode }">
    <Navbar />

    <div class="app-body">
      <DashboardView v-if="store.currentTab === 'dashboard'" />
      <StudyGuideView v-else-if="store.currentTab === 'guide'" />
      <ExamSimulatorView v-else-if="store.currentTab === 'simulator'" />
      <DrillsView v-else-if="store.currentTab === 'drills'" />
      <DecisionMatrixView v-else-if="store.currentTab === 'decisions'" />
      <CheatsheetView v-else-if="store.currentTab === 'cheatsheet'" />
      <VocabularyView v-else-if="store.currentTab === 'vocab'" />
      <ReadinessView v-else-if="store.currentTab === 'readiness'" />
    </div>

    <!-- App Footer -->
    <footer class="app-footer">
      <div class="footer-container">
        <div class="footer-left">
          <span>Microsoft Certified: Azure AI Cloud Developer Associate (AI-200) Interactive Guide</span>
        </div>
        <div class="footer-right">
          <span>Tài liệu học tập tương tác & Hệ thống thi thử thông minh</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-main);
  color: var(--text-primary);
}

.app-body {
  flex: 1;
}

.app-footer {
  background: var(--bg-surface);
  border-top: 1px solid var(--border-color);
  padding: 16px 20px;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.footer-container {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
