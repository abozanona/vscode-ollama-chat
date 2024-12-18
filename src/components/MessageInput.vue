<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useChatStore } from "../store/chat";
import { logger } from "../utils/logging";

const store = useChatStore();
const messageInput = ref("");
const inputEl = ref<HTMLTextAreaElement | null>(null);

const sendMessage = async () => {
  if (!messageInput.value.trim()) {
    return;
  }
  if (!store.selectedModel) {
    return;
  }
  if (store.isLoading) {
    return;
  }

  try {
    await store.sendMessage(messageInput.value);
  } catch (error) {
    logger.error("MessageInput: Error sending message:", error);
  }

  messageInput.value = "";
  inputEl.value?.focus();
};

const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    sendMessage();
  }
};

onMounted(() => {
  inputEl.value?.focus();
});
</script>

<template>
  <div class="input-container">
    <textarea
      ref="inputEl"
      v-model="messageInput"
      :disabled="store.isLoading || !store.selectedModel"
      @keyup.enter="sendMessage"
      @keydown="handleKeydown"
      placeholder="Type your message... (Ctrl/Cmd + Enter to send)"
      rows="1"
    />
    <div class="loading-indicator" :class="{ active: store.isLoading }"></div>
    <button
      @click="sendMessage"
      :disabled="store.isLoading || !store.selectedModel || !messageInput.trim()"
      :title="!store.selectedModel ? 'Please select a model first' : ''"
      class="send-button"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
      </svg>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.input-container {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  position: relative;
  min-height: 40px;

  textarea {
    flex: 1;
    min-height: 40px;
    max-height: 200px;
    padding: 0.5rem 2.5rem 0.5rem 0.75rem;
    background-color: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border);
    border-radius: 4px;
    font-family: inherit;
    font-size: 0.9em;
    line-height: 1.4;
    resize: none;
    overflow-y: auto;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &:focus {
      outline: none;
      border-color: var(--vscode-focusBorder);
    }
  }
}

.send-button {
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: none;
  border: none;
  color: var(--vscode-button-foreground);
  cursor: pointer;
  transition: opacity 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    opacity: 0.8;
  }
}

.loading-indicator {
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  width: 24px;
  height: 24px;
  border: 2px solid transparent;
  border-top-color: var(--vscode-button-foreground);
  border-radius: 50%;
  opacity: 0;
  visibility: hidden;

  &.active {
    opacity: 1;
    visibility: visible;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to { 
    transform: rotate(360deg); 
  }
}
</style>
