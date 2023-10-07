const textarea = document.getElementById('chat-textarea');
const charCount = document.getElementById('charCount');

textarea.addEventListener('input', function () {
    charCount.textContent = textarea.value.length;
});