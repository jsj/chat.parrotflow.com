const promptElement = document.getElementById("prompt");
const messagesElement = document.getElementById("messages");
const keyboardShortcutElement = document.getElementById("keyboard-shortcuts");

let promptBuffer = [];
let promptBufferIndex = -1;
let messages = [];
let controller = null;

const generate = async () => {

  const promptEncoded = encodeURIComponent(promptElement.value)
  history.pushState(null, "", `/?p=${promptEncoded}`);
  
  controller = new AbortController();
  const signal = controller.signal;
  
  var message = document.createElement("div");
  message.classList.add("message");
  message.classList.add("user");
  message.textContent = promptElement.value;
  messages.push({'role': 'user', content: promptElement.value});
  messagesElement.appendChild(message);
  messagesElement.scrollTop = messagesElement.scrollHeight;

  promptElement.value = "";
  
  var message = document.createElement("div");
  message.classList.add("message");
  message.classList.add("assistant");
  messagesElement.appendChild(message);
  message.textContent = " ";

  const response = await fetch('/chat', {
    method: "POST",
    body: JSON.stringify({
      messages: messages
    }),
    signal
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulatedChunk = '';
  message.textContent = "";
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      messages.push({'role': 'assistant', content:message.textContent});
      return;
    }
    const chunk = decoder.decode(value);
    accumulatedChunk += chunk;
    const lines = accumulatedChunk.split("\n");
    accumulatedChunk = lines.pop();
    for (const line of lines) {
      const trimmedLine = line.replace(/^data: /, "").trim();
      if (trimmedLine.length > 0 && trimmedLine != "[DONE]") {
          try {
            const json = JSON.parse(trimmedLine);
            const content = json.choices[0].delta.content;
            if (content) {
              message.textContent += content;
            }
        } catch (error) {
          console.error(error);
        }
      }
    }
  }
};

promptElement.addEventListener("keyup", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    if (promptElement.value.trim().length == 0) {
      alert("Please enter a prompt.");
      return;
    }
    promptBuffer.push(promptElement.value.trim());
    promptBufferIndex = promptBuffer.length - 1;
    generate();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "k" && event.metaKey && event.shiftKey) {
    messages = [];
    messagesElement.innerText = "";
    history.pushState(null, "", '/');
    promptElement.focus();
    promptBuffer = []
    promptBufferIndex = -1
  } else if (event.key === "k" && event.metaKey) {
    messages = [];
    messagesElement.innerText = "";
    promptElement.focus();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (promptBufferIndex >= 0) {
      promptElement.value = promptBuffer[promptBufferIndex];
      promptBufferIndex--;
    }
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (promptBufferIndex < promptBuffer.length - 1) {
      promptBufferIndex++;
      promptElement.value = promptBuffer[promptBufferIndex];
    } else {
      promptElement.value = "";
    }
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "c" && event.ctrlKey) {
    if (controller) {
      controller.abort();
      controller = null;
    }
  }
  if (event.key === "u" && event.ctrlKey) {
    promptElement.value = "";   
  }
});

keyboardShortcutElement.addEventListener("click", (event) => {
  const title = "Keyboard Shortcuts";
  const shorcuts = `
  ⌘C: Clear
  ⌘⇧C: Reset
  ⌃C: Stop Generating
  ↑↓: Cycle Through Prompts
  ⌃U: Clear Prompt
  ⇧⏎: Newline
  `
  const message = `${shorcuts}`
  alert(`${title} \n ${message}`);
});

window.onload = function () {
  const urlComponents = document.URL.split("?p=");
  if (urlComponents.length > 1) {
    const contextParameter = decodeURIComponent(urlComponents[1]);
    const decodedParameter = contextParameter.replace(/\+/g, ' ').trim();
    promptElement.value = decodedParameter;
  }
  promptElement.focus();
}

promptElement.addEventListener('input', (event) => {
  promptElement.style.height = 'auto';
  promptElement.style.height = promptElement.scrollHeight + 'px';
});

window.onload = function () {
  var isChrome = /Chrome/.test(navigator.userAgent);
  if (isChrome) {
    var element = document.getElementById("safari-extension");
    element.style.display = 'none';
  } else {
    var element = document.getElementById("chrome-extension");
    element.style.display = 'none';
  }
}