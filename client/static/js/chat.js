// const socket = io(`http://localhost:3000`, { // here i have to put the url of the hosted app.
const socket = io(`https://chaterty.up.railway.app/`, { // here i have to put the url of the hosted app.
    auth: {
        token: localStorage.getItem('jwt').split(' ')[1]
    } 
});

let messageList = [];
let user;
let lastChat = null;

const loadMessagesSocket = (chat, chatData) => {
    socket.on('listed-messages', (data) => {
        messageList = data;
        loadMessages(chat);
    })

    socket.on('update', () => {
        socket.emit('loadMessages', chatData);
    })

    socket.on('reload', () => {
        document.location.reload(true);
    })
}

const loadChatPage = (chatData) => {
    socket.emit('joinChat', {
        id: chatData.id,
        lastChat: lastChat
    });

    const template = `
        <div class="main">
            <div id="alert-closed">
                <div class="inner-alert">
                    <h4 id="inner-text">This option will delete the chat from all users!!!</h4>
                    <button id="action" class="alert-delete">Delete chat</button>
                    <button id="cancel" class="alert-cancel">Cancel</button>
                </div>
            </div>
            <div class="dropdown">
                <div class="dropdown-data">
                    <button id="delete" class="dropdown-button">Delete chat</button>
                    <button id="clean" class="dropdown-button">Clean chat</button>
                </div>
            </div>
            <header id="chatHeader">
                <button class="back" id="backButton"><img src="img/BackButon.svg" alt=""></button>
                <h2 id="chatName">${chatData.name}</h2>
                <button class="chat-settings" id="chat-settings"><img src="img/ChatSettings.svg" alt=""></button>
            </header>
            <div class="chat-space">
                <ul id="messages" class="messages">
                    
                </ul>
            </div>
            <form id="write-space" class="write-space">
                <input type="text" name="message" id="writer">
                <button id="send" class="send"><img id="sendImg" src="img/SendBlack.svg"></button>
            </form>
        </div>
    `;

    const center = document.getElementsByClassName('center')[0]; // remember that getElementsByClassName give us a array
    loadSurname(true);
    center.innerHTML = template; // al body le entregamos la plantilla
}

const sendMessageListener = (chat, chatData) => {
    const listOfMessages = document.getElementById('messages');
    const messageForm = document.getElementById('write-space');
    const messageSpace = document.getElementById('writer');
    messageForm.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(messageForm);
        const data = Object.fromEntries(formData.entries());
        const d = new Date();

        let hour = `${d.getHours()}:${d.getMinutes()}`;
        if (d.getMinutes().toString().length == 1) {
            hour = `${d.getHours()}:0${d.getMinutes()}`;
        }

        const message = {
            chatId: chat._id,
            text: data.message,
            hour: hour
        };
        messageList.push({
            text: message.text,
            hour: message.hour,
            sender: 'you'
        });
        loadMessages();
        messageSpace.value = '';
        socket.emit('sendMessage', message);
    }
}

const loadChat = async (chatData) => {
    const response = await fetch('ThisChat', {
        method: 'POST',
        body: JSON.stringify(chatData),
        headers: { 
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('jwt')
        }
    }).then(data => data.json());

    user = await fetch('User', {
        method: 'GET',
        headers: { 
            Authorization: localStorage.getItem('jwt')
        }
    }).then(data => data.json());

    chat = response;
    chat['user'] = user.id;
    return chat;
}

const loadMessages = async (chat) => {
    const listOfMessages = document.getElementById('messages');
    const fixedMessages = messageList.map((message) => {
        if (message.sender == user.id || message.sender == 'you') {
            return {
                text: message.text,
                hour: message.hour,
                sender: 'you'
            }
        }
        return message;
    });

    listOfMessages.innerHTML = ""; // i did this because when we are loading new messages we add the past list + actual list
    fixedMessages.forEach(message => {
        const messageNode = document.createElement("li");
        if (message.sender == 'you') {
            messageNode.id = 'my-message';
        } else {
            messageNode.id = 'his-message';
        }
        messageNode.innerHTML = `<p class="text">${message.text}</p><p id="hour">${message.hour}</p>`;
        listOfMessages.append(messageNode);
    })  
}

const backContactListener = (chatData) => { 
    const gotoLogin = document.getElementById('backButton');
    gotoLogin.onclick = (e) => {
        socket.emit('leaveChat', chatData)
        contactsPage();
    }
}

const dropdownButtonListener = () => {
    const openDropdown = document.getElementById('chat-settings');
    const dropdown = document.getElementsByClassName('dropdown')[0];
    openDropdown.onclick = (e) => {
        console.log(dropdown);
        dropdown.classList.toggle("dropdown-open");
    }

}

const onClearListener = (chatData) => {
    const clearButton = document.getElementById('clean');
    clearButton.onclick = (e) => {
        const alert = document.getElementById('alert-closed');
        const alertText = document.getElementById('inner-text');
        alert.id = 'alert';
        alertText.innerHTML = "This option will clear the chat from both users!!!";
        openAlert('clean', chatData);
    }
}

const onDeleteListener = (chatData) => {
    const deleteButton = document.getElementById('delete');
    deleteButton.onclick = (e) => {
        const alert = document.getElementById('alert-closed');
        const alertText = document.getElementById('inner-text');
        alert.id = 'alert';
        alertText.innerHTML = "This option will delete the chat from all users!!!";
        openAlert('delete', chatData);
    }
}

const onCancelListener = () => {
    const cancel = document.getElementById('cancel');
    const alert = document.getElementById('alert');
    cancel.onclick = (e) => {
        alert.id = 'alert-closed';
    }
}

const openAlert = (action, chatData) => {
    onCancelListener();
    const alert = document.getElementById('alert');
    const button = document.getElementById('action');
    if (action == 'clean') {
        button.innerHTML = 'Clean';
        button.onclick = (e) => {
            console.log(chatData)
            socket.emit('clearChats', chatData);
            alert.id = 'alert-closed';
            const dropdown = document.getElementsByClassName('dropdown')[0];
            dropdown.classList.toggle("dropdown-open");  
        }
    } else if (action == 'delete') {
        button.innerHTML = 'Delete';
        button.onclick = (e) => {
            alert.id = 'alert-closed';
            const dropdown = document.getElementsByClassName('dropdown')[0];
            dropdown.classList.toggle("dropdown-open");
            socket.emit('deleteChat', chatData);
        }
    }
}

const chatPage = async (chatData) => {
    loadChatPage(chatData);
    const chat = await loadChat(chatData);
    socket.emit('loadMessages', chatData);
    loadMessagesSocket(chat, chatData);
    sendMessageListener(chat, chatData);
    backContactListener(chat, chatData);
    dropdownButtonListener();
    onDeleteListener(chat);
    onClearListener(chatData);
    lastChat = chatData.id;
}