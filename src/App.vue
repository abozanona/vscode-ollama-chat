<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useChatStore } from "./store/chat";
import ChatMessage from "./components/ChatMessage.vue";
import ModelSelector from "./components/ModelSelector.vue";
import MessageInput from "./components/MessageInput.vue";
import { logger } from "./utils/webviewLogging";

const store = useChatStore();
const messagesContainer = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// Watch both messages array and current assistant message
watch(
  () => store.allMessages,
  () => {
    scrollToBottom();
  },
  { deep: true }
);

// Also watch the current assistant message
watch(
  () => store.currentAssistantMessage,
  () => {
    scrollToBottom();
  }
);

logger.log("9999999999");
onMounted(async () => {
  try {
    await store.fetchModels();
  } catch (error) {
    logger.error("App.vue: Error fetching models:", error);
  }
  scrollToBottom();
});
</script>

<template>
  <div class="chat-container">
    <ModelSelector class="model-selector-container" />
    <div class="messages" ref="messagesContainer">
      <template v-if="store.allMessages.length > 0">
        <ChatMessage
          v-for="msg in store.allMessages"
          :key="msg.id || Math.random()"
          :role="msg.role"
          :content="msg.content"
        />
      </template>
      <div v-if="store.isLoading" class="loading-indicator">
        <span>Loading...</span>
      </div>
    </div>
    <MessageInput class="message-input-container" />
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  gap: 0.75rem;
  background-color: var(--vscode-editor-background);
  color: var(--vscode-editor-foreground);
}

.model-selector-container {
  flex: 0 0 auto;
  padding: 0.75rem 1rem;
  background-color: var(--vscode-sideBar-background);
  border-bottom: 1px solid var(--vscode-panel-border);
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-input-container {
  flex: 0 0 auto;
  padding: 0.75rem 1rem;
  background-color: var(--vscode-sideBar-background);
  border-top: 1px solid var(--vscode-panel-border);
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  color: var(--vscode-descriptionForeground);
  font-size: 0.9em;
}

.loading-indicator span {
  animation: pulse 1.5s infinite;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-indicator span::before {
  content: "";
  width: 0.75rem;
  height: 0.75rem;
  border: 2px solid var(--vscode-descriptionForeground);
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
