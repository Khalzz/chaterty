let chats = [];

const loadContactsPage = () => {
    const template = `
        <div class="main">
            <header>
                <button class="back" id="backButton"><img src="img/BackButon.svg" alt=""></button>
                <button class="profile" id="profile"><img src="img/unpressedProfile.svg" alt=""></button>

            </header>
            <div class="search">
                <h2>search</h2>
                <input type="search" id="search" placeholder="Alejandro">
                <button id="addcontact" class="submit">Add contacts</button>
            </div>
            <ul id="contacts">
            </ul>
        </div>
    `;

    const center = document.getElementsByClassName('center')[0]; // remember that getElementsByClassName give us a array
    loadSurname(false);
    center.innerHTML = template; // al body le entregamos la plantilla
}

// the way the search bar works its that based on a event of type input we search if the string of names includes our value
// based on that we will toggle or not the class of our elements on the html to hide (wich is a class that set their display to none)
const searchBar = () => {
    const searchInput = document.getElementById('search');
    searchInput.addEventListener("input", e => {
        const value = e.target.value.toLowerCase();
        chats.forEach(user => {
            const userHtml = document.getElementsByClassName(user.name)[0];
            const isVisible = user.name.toLowerCase().includes(value);
            userHtml.classList.toggle('hide', !isVisible)
        })
    })
}

const getChats = async () => {
    const chatList = document.getElementById('contacts');
    await fetch('Chats', {
        headers: {
            Authorization: localStorage.getItem('jwt')
        }
    })
    .then(res => res.json())
    .then(data => {
        chats = data.map(user => {
            const chat = document.createElement("li");
            chat.id = "contactNode"
            const template =`<button class="chat">${user.name}</button>`;
            chat.innerHTML = template;
            chat.classList = user.name;
            chatList.append(chat)
            chat.onclick = (e) => {
                chatPage(user);
            }
            return {name: user.name, id: user.id, template: chat} 
        });
    })

    // this is for the message at the end of the contacts list
    const endTemplate = document.createElement("p");
    endTemplate.innerHTML = "This is the end of the list"
    chatList.append(endTemplate);
}

editUserButtonListener = () => {
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
        addPage()
    }
}

const contactsPage = () => {
    loadContactsPage();
    backButtonListener();
    editUserButtonListener();
    addButtonListener();
    getChats()
    searchBar()
}