import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { logger } from '../utils/logging'
import { VSCodeAPI } from '../vscode-api'
import { OllamaService } from '../services/ollamaService'
import { fileOps } from '../utils/file-ops'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<Message[]>([])
  const isLoading = ref(false)
  const models = ref<string[]>([])
  const selectedModel = ref('')
  const currentAssistantMessage = ref('')
  const error = ref<string | null>(null)
  const vscode = VSCodeAPI.getInstance()
  const ollamaService = new OllamaService(vscode)

  // Computed property for all messages including current assistant message
  const allMessages = computed(() => {
    const result = [...messages.value]
    if (currentAssistantMessage.value) {
      result.push({
        role: 'assistant',
        content: currentAssistantMessage.value
      })
    }
    return result
  })

  // Initialize from VSCode state
  const savedState = vscode.getState()
  if (savedState?.models) {
    models.value = savedState.models
  }
  if (savedState?.selectedModel) {
    selectedModel.value = savedState.selectedModel
    ollamaService.setModel(savedState.selectedModel)
  }
  if (savedState?.messages) {
    messages.value = savedState.messages
  }

  const saveState = () => {
    const state = {
      models: models.value,
      selectedModel: selectedModel.value,
      messages: messages.value
    }
    vscode.setState(state)
  }

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    messages.value.push({ role, content })
    saveState()
  }

  const appendToLastAssistantMessage = (content: string) => {
    if (currentAssistantMessage.value === '') {
      currentAssistantMessage.value = content
    } else {
      currentAssistantMessage.value += content
    }
  }

  const finalizeAssistantMessage = async () => {
    if (currentAssistantMessage.value) {
      addMessage('assistant', currentAssistantMessage.value);

      if (currentAssistantMessage.value.includes("[REQUEST_FILE_STRUCTURE]")) {
        addMessage('assistant', '📂 Retrieving file structure...');

        try {
          const fileStructure = await fileOps.listDirectory();
          const continuationResponse = await fetch(
            `${OllamaService.BASE_URL}/generate`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: selectedModel,
                prompt: `Here is the file structure:\n${fileStructure}\n\nHow would you like to proceed?`,
                // system: systemPrompt,
                stream: true,
              }),
            }
          );

          const continuationReader = continuationResponse.body.getReader();
          const continuationDecoder = new TextDecoder("utf-8");
          let continuationBuffer = "";

          while (true) {
            const { done, value } = await continuationReader.read();
            if (done) break;

            continuationBuffer += continuationDecoder.decode(value, { stream: true });
            const continuationLines = continuationBuffer.split("\n");
            continuationBuffer = continuationLines.pop() || "";

            for (const continuationLine of continuationLines) {
              if (!continuationLine.trim()) continue;

              try {
                const continuationData = JSON.parse(continuationLine);
                if (continuationData.response) {
                  addMessage('assistant', continuationData.response);
                }

                if (continuationData.done) {
                  return;
                }
              } catch (error) {
                logger.error("Error parsing continuation response:", error);
                continue;
              }
            }
          }
        } catch (error) {
          logger.error("Error retrieving file structure:", error);
        }
      }

      currentAssistantMessage.value = '';
    }
  };

  const fetchModels = async () => {
    try {
      setLoading(true)
      const fetchedModels = await ollamaService.fetchModels()
      setModels(fetchedModels)
      if (!selectedModel.value && fetchedModels.length > 0) {
        setSelectedModel(fetchedModels[0])
      }
    } catch (error) {
      logger.error('Store: Error fetching models:', error)
    } finally {
      setLoading(false)
    }
  }

  const setModels = (newModels: string[]) => {
    models.value = newModels
    saveState()
  }

  const setSelectedModel = (model: string) => {
    selectedModel.value = model
    ollamaService.setModel(model)
    saveState()
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (msg: string | null) => {
    error.value = msg
  }

  const sendMessage = async (text: string) => {
    
    if (!selectedModel.value) {
      logger.error('Store: No model selected')
      return
    }

    addMessage('user', text)
    setLoading(true)
    currentAssistantMessage.value = ''

    try {
      for await (const chunk of ollamaService.generateStreamResponse(text)) {
        if (chunk.error) {
          logger.error('Store: Error in chunk:', chunk.error)
          throw new Error(chunk.error)
        }
        if (chunk.response) {
          appendToLastAssistantMessage(chunk.response)
        }
        if (chunk.done) {
          finalizeAssistantMessage()
          break
        }
      }
    } catch (error) {
      logger.error('Store: Error in sendMessage:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to Ollama'
      appendToLastAssistantMessage(`Error: ${errorMessage}`)
      finalizeAssistantMessage()
    } finally {
      setLoading(false)
    }
  }

  return {
    messages,
    allMessages,
    isLoading,
    models,
    selectedModel,
    currentAssistantMessage,
    error,
    addMessage,
    appendToLastAssistantMessage,
    finalizeAssistantMessage,
    fetchModels,
    setModels,
    setSelectedModel,
    setLoading,
    setError,
    sendMessage
  }
})
