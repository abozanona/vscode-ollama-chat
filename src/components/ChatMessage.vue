<script setup lang="ts">
import { computed } from "vue";
import { Marked } from "marked";
import { logger } from '../utils/logging';

const marked = new Marked();

const props = defineProps<{
  role: "user" | "assistant";
  content: string;
}>();

const formattedContent = computed(() => {
  try {
    const formatted = marked.parse(props.content);
    return formatted;
  } catch (error) {
    logger.error('ChatMessage: Error formatting content:', error);
    return props.content;
  }
});
</script>

<template>
  <div class="message" :class="role">
    <div class="message-content" v-html="formattedContent"></div>
  </div>
</template>

<style lang="scss" scoped>
.message {
  padding: 0.75rem;
  border-radius: 6px;
  max-width: 100%;
  overflow-wrap: break-word;

  &.user {
    background-color: var(--vscode-editor-background);
    border: 1px solid var(--vscode-panel-border);
    margin-left: 2rem;
  }

  &.assistant {
    background-color: var(--vscode-sideBar-background);
    border: 1px solid var(--vscode-panel-border);
    margin-right: 2rem;
  }
}

.message-content {
  font-size: 0.95em;
  line-height: 1.5;

  :deep(p) {
    margin: 0.5em 0;

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(code) {
    background-color: var(--vscode-textCodeBlock-background);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: var(--vscode-editor-font-family);
    font-size: 0.9em;
  }

  :deep(pre) {
    background-color: var(--vscode-textCodeBlock-background);
    padding: 1em;
    border-radius: 4px;
    overflow-x: auto;
    margin: 0.75em 0;

    code {
      background-color: transparent;
      padding: 0;
      border-radius: 0;
    }
  }

  :deep(ul), :deep(ol) {
    margin: 0.5em 0;
    padding-left: 1.5em;
  }

  :deep(li) {
    margin: 0.25em 0;
  }
}
</style>
