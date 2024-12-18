(function() {
    const vscode = acquireVsCodeApi();
    let selectedModel = '';
    let currentStreamMessageDiv = null;

    // Configure marked options
    marked.setOptions({
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: true,
        gfm: true
    });

    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const modelSelector = document.getElementById('model-selector');
    const loadingIndicator = document.getElementById('loading-indicator');

    // Initialize UI based on selected model
    selectedModel = modelSelector.value;
    messageInput.disabled = !selectedModel;
    sendButton.disabled = !selectedModel;

    // Add initial message
    if (selectedModel) {
        addMessage(`Model "${selectedModel}" selected. Start chatting!`, 'system');
    } else {
        addMessage('Please select a model to begin chatting.', 'system');
    }

    modelSelector.addEventListener('change', (e) => {
        selectedModel = e.target.value;
        messageInput.disabled = !selectedModel;
        sendButton.disabled = !selectedModel;
        vscode.postMessage({ 
            command: 'selectModel', 
            model: selectedModel 
        });
    });

    function addMessage(content, type, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        if (type === 'bot' && !isError) {
            try {
                // Process markdown and syntax highlighting
                const htmlContent = marked.parse(content);
                messageDiv.innerHTML = htmlContent;

                // Apply syntax highlighting to all code blocks
                messageDiv.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            } catch (error) {
                console.error('Error parsing markdown:', error);
                messageDiv.textContent = content;
            }
        } else {
            // For user messages or errors, just escape HTML
            messageDiv.textContent = content;
        }

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function addStreamingMessage(content, done) {
        if (!currentStreamMessageDiv) {
            currentStreamMessageDiv = document.createElement('div');
            currentStreamMessageDiv.className = 'message bot-message';
            messagesContainer.appendChild(currentStreamMessageDiv);
        }

        try {
            // Accumulate the content
            const currentContent = currentStreamMessageDiv.getAttribute('data-content') || '';
            const newContent = currentContent + content;
            currentStreamMessageDiv.setAttribute('data-content', newContent);

            // Process markdown
            const htmlContent = marked.parse(newContent);
            currentStreamMessageDiv.innerHTML = htmlContent;

            // Apply syntax highlighting to code blocks
            currentStreamMessageDiv.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        } catch (error) {
            console.error('Error parsing markdown:', error);
            currentStreamMessageDiv.textContent += content;
        }

        if (done) {
            currentStreamMessageDiv = null;
        }

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function setLoading(loading) {
        loadingIndicator.style.display = loading ? 'block' : 'none';
        messageInput.disabled = loading;
        sendButton.disabled = loading;
    }

    function sendMessage() {
        const message = messageInput.value.trim();
        if (message && selectedModel) {
            addMessage(message, 'user');
            messageInput.value = '';
            setLoading(true);

            vscode.postMessage({
                command: 'sendMessage',
                text: message,
                model: selectedModel
            });
        }
    }

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    sendButton.addEventListener('click', sendMessage);

    // Handle messages from extension
    window.addEventListener('message', event => {
        const message = event.data;

        switch (message.command) {
            case 'addMessage':
                addMessage(message.text, 'bot');
                setLoading(false);
                break;

            case 'error':
                addMessage(message.text, 'bot', true);
                setLoading(false);
                break;

            case 'streamMessage':
                addStreamingMessage(message.text, message.done);
                if (message.done) {
                    setLoading(false);
                }
                break;

            case 'loading':
                setLoading(message.loading);
                break;
        }
    });
})();
