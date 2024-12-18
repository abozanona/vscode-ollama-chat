<script setup lang="ts">
import { useChatStore } from '../store/chat'
import { logger } from '../utils/logging'

const store = useChatStore()

const handleModelChange = (event: Event) => {
  const model = (event.target as HTMLSelectElement).value
  store.setSelectedModel(model)
}
</script>

<template>
  <div class="model-selector">
    <label for="model-select">Model:</label>
    <select
      id="model-select"
      :value="store.selectedModel"
      @change="handleModelChange"
      :disabled="store.isLoading"
    >
      <option value="" disabled>Select a model</option>
      <option v-for="model in store.models" :key="model" :value="model">
        {{ model }}
      </option>
    </select>
  </div>
</template>

<style lang="scss" scoped>
.model-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  label {
    font-size: 0.9em;
    color: var(--vscode-foreground);
    font-weight: 500;
  }

  select {
    flex: 1;
    padding: 0.4rem 0.75rem;
    font-size: 0.9em;
    background-color: var(--vscode-dropdown-background);
    color: var(--vscode-dropdown-foreground);
    border: 1px solid var(--vscode-dropdown-border);
    border-radius: 4px;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23888'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 1.5em;
    padding-right: 2rem;

    &:focus {
      outline: none;
      border-color: var(--vscode-focusBorder);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  option {
    background-color: var(--vscode-dropdown-listBackground);
    color: var(--vscode-dropdown-foreground);
    padding: 0.5rem;
  }
}
</style>
