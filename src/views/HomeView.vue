<template>
  <div class="home">
    <header class="home-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">信息源门户</h1>
        </div>
        <SourceList />
      </div>
    </header>
  </div>
</template>

<script setup>
import SourceList from '../components/SourceList.vue'
</script>

<style scoped>
.home {
  background-color: #fafafa;
  min-height: 100vh;
}

.header-content {
  max-width: 1600px;
  margin: 0 auto;
  padding: 12px 24px;
}

.title-section {
  display: none;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  background: none;
  -webkit-background-clip: initial;
  -webkit-text-fill-color: initial;
  background-clip: initial;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 16px;
  }
  
  .page-title {
    font-size: 20px;
  }
}
</style>
