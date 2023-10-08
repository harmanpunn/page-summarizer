var chatHistory = [];

var summary = "";

function addChatBubble() {
  var chat = chatHistory[chatHistory.length - 1];
  const chatBubbleContainer = document.createElement("div");
  const chatBubble = document.createElement("div");
  const chatWindow = document.getElementById("chat-window");
  chatBubbleContainer.classList.add("pb-3");
  chatBubble.classList.add("chat-bubble");

  if (chat.isUser) {
    chatBubbleContainer.classList.add("d-flex");
    chatBubbleContainer.classList.add("justify-content-end");
    chatBubble.classList.add("bg-primary");
  } else {
    chatBubbleContainer.classList.add("d-flex");
    chatBubbleContainer.classList.add("justify-content-start");
  }
  chatBubbleContainer.classList.add("align-items-center");

  chatBubble.textContent = chat.text;
  chatBubbleContainer.appendChild(chatBubble);
  chatWindow.appendChild(chatBubbleContainer);
}

function getChatResponse(chat) {
  const apiUrl = `http://localhost:3000/chat`;

  return fetch(`http://localhost:3000/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: summary,
      history: chatHistory,
    }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Error getting chat! Status: ${response.status}`);
    }
    return response.json();
  });
}

function fetchSummary() {
  const currentPageUrl = encodeURIComponent(window.location.href);
  // const currentPageUrl = window.location.href;

  const apiUrl = `http://localhost:3000/summarize?url=${currentPageUrl}`;

  return fetch(apiUrl).then((response) => {
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  });
}

function injectPane(htmlContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const pane = doc.querySelector("#container");
  document.body.appendChild(pane);

  const chatContainer = document.getElementById("chat-container");
  const chatbox = document.getElementById("chat-box");
  const chat = document.getElementById("chat");

  chatContainer.setAttribute(
    "style",
    "height:" + Math.floor(0.8 * chat.clientHeight) + "px !important"
  );
  chatbox.setAttribute(
    "style",
    "height:" +
      (chat.clientHeight - Math.floor(0.8 * chat.clientHeight)) +
      "px !important"
  );

  const textarea = document.querySelector("#chat-textarea");
  textarea.addEventListener("input", function () {
    charCount.textContent = textarea.value.length;
  });

  textarea.addEventListener("keypress",async function (event) {
    // Get the key code of the key pressed

    if (event.key === "Enter" && !event.shiftKey) {
      try {
        document.getElementById("loader-chat").style.display = "block";
        document.getElementById("chat-arrow").style.display = "none";
        event.preventDefault();
        console.log("Submit chat!");
        chatHistory.push({
          id: chatHistory.length,
          text: textarea.value,
          isUser: true,
        });
        addChatBubble();
        textarea.value = "";
        var response = await getChatResponse();
        response["id"] = chatHistory.length
        chatHistory.push(response)
        addChatBubble();
      } catch(error) {
        console.error("Error fetching chat:", error);
      } finally {
        document.getElementById("loader-chat").style.display = "none";
        document.getElementById("chat-arrow").style.display = "block";
      }
      
    }
  });

  // Event listeners
  document.querySelector("#closeIcon").addEventListener("click", function () {
    pane.style.display = "none";
  });

  document.getElementById("summarizeBtn").addEventListener("click", async function() {
    document.getElementById("summarizeBtn").style.display = "none";
    document.getElementById("loader").style.display = "block";

    try {
        const data = await fetchSummary();
        const summaryText = data.summary || "Summary not available.";
        summary = summaryText;
        document.querySelector("#summary p").innerText = summaryText;
        document.getElementById("summary").classList.remove("invisible");
        document.getElementById("chat-textarea").disabled = false;
    } catch (error) {
        console.error("Error fetching summary:", error);
        document.querySelector("#summary p").innerText = "Error fetching summary.";
    } finally {
        document.getElementById("loader").style.display = "none";
    }
  });

}

console.log(!document.getElementById("container"));
if (!document.getElementById("container")) {
  fetch(chrome.runtime.getURL("pane.html"))
    .then((response) => response.text())
    .then(injectPane);
} else {
  const pane = document.getElementById("container");
  pane.style.display = pane.style.display === "none" ? "block" : "none";
}
