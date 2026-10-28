<script setup>
import { ref, computed } from 'vue';
import { useStudyStore } from '../composables/useStudyStore';
import { 
  Sparkles, 
  Search, 
  CheckCircle2, 
  Circle, 
  Rotate3d, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  TableProperties
} from 'lucide-vue-next';

const store = useStudyStore();
const searchQuery = ref('');
const selectedCategory = ref('ALL');
const viewMode = ref('flashcard'); // 'flashcard' | 'grid'
const activeCardIndex = ref(0);
const isCardFlipped = ref(false);

const categories = ['ALL', 'Container terms', 'Data and AI terms', 'Messaging and operations terms'];

const filteredVocab = computed(() => {
  return store.vocabulary.filter(v => {
    if (selectedCategory.value !== 'ALL' && v.category !== selectedCategory.value) {
      return false;
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      return v.term.toLowerCase().includes(q) || v.definition.toLowerCase().includes(q);
    }
    return true;
  });
});

const currentCard = computed(() => {
  if (!filteredVocab.value.length) return null;
  return filteredVocab.value[activeCardIndex.value] || filteredVocab.value[0];
});

function flipCard() {
  isCardFlipped.value = !isCardFlipped.value;
}

function prevCard() {
  isCardFlipped.value = false;
  if (activeCardIndex.value > 0) {
    activeCardIndex.value--;
  } else {
    activeCardIndex.value = filteredVocab.value.length - 1;
  }
}

function nextCard() {
  isCardFlipped.value = false;
  if (activeCardIndex.value < filteredVocab.value.length - 1) {
    activeCardIndex.value++;
  } else {
    activeCardIndex.value = 0;
  }
}
</script>

<template>
  <div class="vocab-page">
    <div class="vocab-hero">
      <div class="badge badge-blue">
        <Sparkles :size="16" />
        <span>Section 3: Core Vocabulary</span>
      </div>
      <h1 class="vocab-title">Flashcard Thuật Ngữ Cốt Lõi AI-200</h1>
      <p class="vocab-desc">
        Nắm vững 31 định nghĩa nền tảng về Containers, Vector Search, KEDA, Change Feed và Tracing để không bị bối rối trước các từ khóa trong đề thi.
      </p>
    </div>

    <!-- Filter & Mode Bar -->
    <div class="vocab-controls card">
      <div class="search-wrap">
        <Search class="search-icon" :size="16" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tìm kiếm thuật ngữ (ví dụ: KEDA, DiskANN, RAG, Ingress, Trace)..." 
          class="search-input"
        />
      </div>

      <div class="control-row">
        <div class="cat-pills">
          <button 
            v-for="cat in categories" 
            :key="cat"
            class="cat-pill"
            :class="{ active: selectedCategory === cat }"
            @click="selectedCategory = cat; activeCardIndex = 0; isCardFlipped = false;"
          >
            {{ cat === 'ALL' ? 'Tất cả' : cat }}
          </button>
        </div>

        <div class="mode-switch">
          <button 
            class="mode-btn" 
            :class="{ active: viewMode === 'flashcard' }"
            @click="viewMode = 'flashcard'"
          >
            <Layers :size="16" />
            <span>Thẻ lật 3D</span>
          </button>
          <button 
            class="mode-btn" 
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
          >
            <TableProperties :size="16" />
            <span>Dạng danh sách</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 1. FLASHCARD 3D MODE -->
    <div v-if="viewMode === 'flashcard' && currentCard" class="flashcard-container">
      <div class="card-counter">
        Thẻ {{ activeCardIndex + 1 }} / {{ filteredVocab.length }}
        <span class="badge badge-muted" style="margin-left: 8px;">{{ currentCard.category }}</span>
      </div>

      <div class="flashcard-3d-box" @click="flipCard">
        <div class="flashcard-flipper" :class="{ flipped: isCardFlipped }">
          <!-- Front Face -->
          <div class="face front-face card">
            <div class="face-top">
              <span class="face-hint">Nhấp vào thẻ để xem định nghĩa</span>
              <button 
                class="mastery-star"
                :class="{ active: store.masteredVocab.has(currentCard.term) }"
                @click.stop="store.toggleVocabMastered(currentCard.term)"
              >
                <CheckCircle2 v-if="store.masteredVocab.has(currentCard.term)" :size="20" />
                <Circle v-else :size="20" />
                <span>{{ store.masteredVocab.has(currentCard.term) ? 'Đã nhớ' : 'Chưa nhớ' }}</span>
              </button>
            </div>
            
            <div class="front-center">
              <h2 class="term-title">{{ currentCard.term }}</h2>
              <div class="flip-prompt">
                <Rotate3d :size="16" />
                <span>Lật mặt sau</span>
              </div>
            </div>

            <div class="face-bottom">
              <span class="badge badge-blue">{{ currentCard.category }}</span>
            </div>
          </div>

          <!-- Back Face -->
          <div class="face back-face card">
            <div class="face-top">
              <span class="face-hint">Định nghĩa kỹ thuật</span>
              <button 
                class="mastery-star"
                :class="{ active: store.masteredVocab.has(currentCard.term) }"
                @click.stop="store.toggleVocabMastered(currentCard.term)"
              >
                <CheckCircle2 v-if="store.masteredVocab.has(currentCard.term)" :size="20" />
                <Circle v-else :size="20" />
                <span>{{ store.masteredVocab.has(currentCard.term) ? 'Đã nhớ' : 'Chưa nhớ' }}</span>
              </button>
            </div>

            <div class="back-center">
              <h3 class="back-term">{{ currentCard.term }}</h3>
              <p class="term-definition">{{ currentCard.definition }}</p>
            </div>

            <div class="face-bottom">
              <span class="flip-prompt">
                <Rotate3d :size="16" />
                <span>Nhấp để quay lại mặt trước</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Arrows -->
      <div class="card-nav-btns">
        <button class="btn btn-secondary btn-lg" @click="prevCard">
          <ChevronLeft :size="20" />
          <span>Thẻ trước</span>
        </button>
        <button 
          class="btn btn-primary btn-lg"
          @click="store.toggleVocabMastered(currentCard.term)"
        >
          <CheckCircle2 :size="18" />
          <span>{{ store.masteredVocab.has(currentCard.term) ? 'Đã nắm vững từ này' : 'Đánh dấu đã thuộc' }}</span>
        </button>
        <button class="btn btn-secondary btn-lg" @click="nextCard">
          <span>Thẻ kế tiếp</span>
          <ChevronRight :size="20" />
        </button>
      </div>
    </div>

    <!-- 2. GRID / LIST MODE -->
    <div v-else-if="viewMode === 'grid'" class="vocab-grid">
      <div 
        v-for="v in filteredVocab" 
        :key="v.term"
        class="vocab-card card"
        :class="{ mastered: store.masteredVocab.has(v.term) }"
      >
        <div class="v-top">
          <span class="badge badge-blue">{{ v.category }}</span>
          <button 
            class="v-mastered-btn"
            :class="{ active: store.masteredVocab.has(v.term) }"
            @click="store.toggleVocabMastered(v.term)"
          >
            <CheckCircle2 v-if="store.masteredVocab.has(v.term)" :size="16" />
            <Circle v-else :size="16" />
            <span>{{ store.masteredVocab.has(v.term) ? 'Đã thuộc' : 'Chưa thuộc' }}</span>
          </button>
        </div>

        <h3 class="v-term">{{ v.term }}</h3>
        <p class="v-def">{{ v.definition }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vocab-page {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px 20px 60px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.vocab-hero {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vocab-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.vocab-desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
  max-width: 800px;
}

.vocab-controls {
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

.control-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.cat-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.cat-pill {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background: var(--bg-surface-elevated);
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cat-pill:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.cat-pill.active {
  background: var(--azure-blue);
  color: #ffffff;
  border-color: var(--azure-blue);
}

.mode-switch {
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.mode-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: var(--bg-surface);
  border: none;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn.active {
  background: var(--azure-blue);
  color: #ffffff;
}

/* Flashcard 3D */
.flashcard-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 12px;
}

.card-counter {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.flashcard-3d-box {
  width: 100%;
  max-width: 680px;
  height: 380px;
  perspective: 1200px;
  cursor: pointer;
}

.flashcard-flipper {
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.flashcard-flipper.flipped {
  transform: rotateY(180deg);
}

.face {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 32px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.front-face {
  background: linear-gradient(145deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 100%);
  border: 2px solid var(--border-color);
}

.back-face {
  background: linear-gradient(145deg, var(--bg-surface-elevated) 0%, var(--bg-surface) 100%);
  border: 2px solid var(--azure-blue);
  transform: rotateY(180deg);
}

.face-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.face-hint {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.mastery-star {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid var(--border-color);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  color: var(--text-muted);
  cursor: pointer;
}

.mastery-star.active {
  border-color: #107c41;
  color: #4ade80;
  background: rgba(16, 124, 65, 0.15);
}

.front-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.term-title {
  font-size: 2.4rem;
  font-weight: 800;
  text-align: center;
  color: var(--azure-cyan);
}

.flip-prompt {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.back-center {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.back-term {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--azure-cyan);
}

.term-definition {
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--text-primary);
}

.face-bottom {
  display: flex;
  justify-content: center;
}

.card-nav-btns {
  display: flex;
  align-items: center;
  gap: 14px;
}

/* Grid Mode */
.vocab-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.vocab-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.2s ease;
}

.vocab-card.mastered {
  border-color: rgba(16, 124, 65, 0.4);
}

.v-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.v-mastered-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  font-size: 0.75rem;
  color: var(--text-muted);
  cursor: pointer;
}

.v-mastered-btn.active {
  color: #4ade80;
}

.v-term {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--azure-cyan);
}

.v-def {
  font-size: 0.86rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

@media (max-width: 960px) {
  .vocab-grid {
    grid-template-columns: 1fr;
  }
}
</style>
