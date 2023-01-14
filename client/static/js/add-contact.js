const loadAddPage = () => {
    const template = `
        <div class="addContact">
                <header>
                    <button class="back" id="backToContacts"><img src="img/BackButon.svg" alt=""></button>
                </header>
                <form id="search-form" class="search">
                    <h2>Add contacts</h2>
                    <input type="text" name="username" placeholder="Username">
                    <h4 id="add-error"></h4>
                    <button id="addcontact-element" class="submit" type="submit">Add</button>
                </form>
        </div>
    `;

    const center = document.getElementsByClassName('center')[0]; // remember that getElementsByClassName give us a array
    loadSurname(false);
    center.innerHTML = template; // al body le entregamos la plantilla
    
}

const createListener = () => {
    const errorLog = document.getElementById('add-error');
    const form = document.getElementById('search-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        openLoadScreen(true);
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        console.log(data)
        socket.emit('createContact', data)
    }
}

const socketAdd = () => {
    socket.on('reload', () => {
        document.location.reload(true);
    })

    socket.on('createLog', (data) => {
        const errorLog = document.getElementById('add-error');
        if (data.status >= 300) {
            errorLog.innerHTML = data.message;
            openLoadScreen(false);  
        } else {
            contactsPage();
            console.log('funcionjo')
        }
    })
}
 
const gotoContactsListener = () => {
    const gotoContacts = document.getElementById('backToContacts');
    gotoContacts.onclick = (e) => {
        contactsPage();
    }
}

const addPage = () => {
    socketAdd();
    loadAddPage();
    gotoContactsListener();
    createListener();
}