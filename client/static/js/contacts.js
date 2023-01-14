let chats = [];

const loadContactsPage = () => {
    const template = `
        <div class="main">
            <header>
                <button class="back" id="backButton"><img src="img/BackButon.svg" alt=""></button>
                <h2 id="username"></h2>
                <button class="profile" id="profile"><img src="img/unpressedProfile.svg" alt=""></button>
            </header>
            <div class="search">
                <button id="addcontact" class="submit">Add contacts</button>
                <h2>search</h2>
                <input type="search" id="search" placeholder="Alejandro">
            </div>
            <ul id="contacts">
            </ul>
        </div>      
    `;
        
    const center = document.getElementsByClassName('center')[0]; // remember that getElementsByClassName give us a array
    loadSurname(false);
    center.innerHTML = template; // al body le entregamos la plantilla
    openLoadScreen(true);     
}

// the way the search bar works its that based on a event of type input we search if the string of names includes our value
// based on that we will toggle or not the class of our elements on the html to hide (wich is a class that set their display to none)
const searchBar = () => {
    const searchInput = document.getElementById('search');
    searchInput.addEventListener("input", e => {
        const value = e.target.value;
        chats.forEach(user => {
            const userHtml = document.getElementsByClassName(user.name)[0];
            const isVisible = user.name.includes(value);
            userHtml.classList.toggle('hide', !isVisible)
            
            console.log(userHtml)
        });
    });
}

const loadUser = async () => {
    return await fetch('User', {
        method: 'GET',
        headers: { 
            Authorization: localStorage.getItem('jwt')
        }
    }).then(data => data.json());
}

const loadChats = async () => {
        
    socket.emit('getContacts')

    socket.on('reloadContacts', () => {
        socket.emit('getContacts')
    })

    socket.on('loadContacts', (data) => {
        
        const chatList = document.getElementById('contacts');
        chatList.innerHTML = ''; // first you have to clear this list you Dumb ass
        chats = data.map(user => {
            const chat = document.createElement("li");
            chat.id = "contactNode"
            const template =`<button class="chat">${user.name}</button><div id="hiddenRead"></div>`;
            chat.innerHTML = template;
            chat.classList = user.name;
            chatList.append(chat)
            const read = chat.childNodes[1];
            if (!user.readed) {
                read.id = 'read';
            }
            chat.onclick = (e) => {
                chatPage(user);
            }
            return {name: user.name, id: user.id, template: chat} 
        });
        const endTemplate = document.createElement("p");
        endTemplate.innerHTML = "This is the end of the list";
        chatList.append(endTemplate);
        openLoadScreen(false);     
    }) 
}

const editUserButtonListener = () => {
    const gotoEdit = document.getElementById('profile');
    gotoEdit.onclick = (e) => {
        loadProfilePage();
    }
}

const backButtonListener = () => { 
    const gotoLogin = document.getElementById('backButton');
    gotoLogin.onclick = (e) => {
        localStorage.removeItem('jwt');
        loginPage();
    }
}

const addButtonListener = () => {
    const gotoAdd = document.getElementById('addcontact');
    gotoAdd.onclick = (e) => {
        addPage();
    }
}

const loadUsername = async () => {
    const response = await fetch('User', {
        headers: {
            Authorization: localStorage.getItem('jwt')
        }
    }).then((data) => data.json());

    const headerUsername = document.getElementById('username');
    headerUsername.innerHTML = response.username;
}

const contactsPage = () => {
    loadContactsPage();
    backButtonListener();
    editUserButtonListener();
    addButtonListener();
    socket.emit('joinGlobal')
    loadChats();
    searchBar()
    loadUsername();
}