const textarea = document.getElementById('chat-textarea');
const charCount = document.getElementById('charCount');
const chatWindow = document.getElementById('chat-window');
const chatContainer = document.getElementById('chat-container')
const chatbox = document.getElementById('chat-box')
const chat = document.getElementById('chat')


console.log(chatContainer.clientHeight);
console.log(chat.clientHeight);

chatContainer.setAttribute("style", "height:" + Math.floor(0.8 * chat.clientHeight) + "px !important");
chatbox.setAttribute("style", "height:" + (chat.clientHeight - Math.floor(0.8 * chat.clientHeight)) + "px !important");

var chatHistory = [
]

textarea.addEventListener('input', function () {
    charCount.textContent = textarea.value.length;
});

textarea.addEventListener('keypress', function (event) {
    // Get the key code of the key pressed
    if(event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        console.log("Submit chat!");
        chatHistory.push(
            {
                "id" : chatHistory.length,
                "text" : textarea.value,
                "isUser" : true
            }
        )
        addChatBubble();
        textarea.value = "";
        getChatResponse();
        addChatBubble(); 
    }
});

function addChatBubble(){
    var chat = chatHistory[chatHistory.length -1];
    const chatBubbleContainer = document.createElement("div");
    const chatBubble = document.createElement('div');
    chatBubbleContainer.classList.add("pb-3")
    chatBubble.classList.add('chat-bubble');

    if (chat.isUser) {
        chatBubbleContainer.classList.add('d-flex');
        chatBubbleContainer.classList.add('justify-content-end');
        chatBubble.classList.add("bg-primary")
    } else {
        chatBubbleContainer.classList.add('d-flex');
        chatBubbleContainer.classList.add('justify-content-start');
    }
    chatBubbleContainer.classList.add('align-items-center');


    chatBubble.textContent = chat.text;
    chatBubbleContainer.appendChild(chatBubble);
    chatWindow.appendChild(chatBubbleContainer);
}

function getChatResponse(chat){
    chatHistory.push(
        {
            "id" : chatHistory.length,
            "text" : "chatgpt response",
            "isUser" : false
        }
    )
}