// Task Manager
function addTask() {
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    if (taskInput.value.trim()) {
        const li = document.createElement('li');
        li.textContent = taskInput.value;
        taskList.appendChild(li);
        taskInput.value = '';
    }
}

// AI Assistant (using OpenAI API)
async function askAI() {
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const question = userInput.value;

    // Add user question to chat
    chatBox.innerHTML += `<div class="user-msg">You: ${question}</div>`;

    // Call OpenAI API (replace with your API key)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer AIzaSyDqi2N9UFsdTyqXSQUR4we4eQm26faS62c'
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: question }]
        })
    });

    const data = await response.json();
    const aiReply = data.choices[0].message.content;

    // Add AI response to chat
    chatBox.innerHTML += `<div class="ai-msg">AI: ${aiReply}</div>`;
    userInput.value = '';
}
