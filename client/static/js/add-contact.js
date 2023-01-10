const loadAddPage = () => {
    const template = `
        <div class="addContact">
                <header>
                    <button class="back" id="backToContacts"><img src="img/BackButon.svg" alt=""></button>
                </header>
                <form id="search-form" class="search">
                    <div id="loading">
                        <div id="inner-animation">
                            <div id="ball1"></div>
                            <div id="ball2"></div>
                            <div id="ball3"></div>
                        </div>
                    </div>
                    <h2>Add contacts</h2>
                    <input type="text" name="username" placeholder="Username">
                    <button id="addcontact" class="submit" type="submit">Add</button>
                </form>
        </div>
    `;

    const center = document.getElementsByClassName('center')[0]; // remember that getElementsByClassName give us a array
    loadSurname(false);
    center.innerHTML = template; // al body le entregamos la plantilla
    const loadScreen = document.getElementById('loading');
    loadScreen.id = "hide"
}

const openLoadScreen = (value) => {
    if (value == true) {
        const loadScreen = document.getElementById('hide')
        loadScreen.id = 'loading';
    } else if (value == false) {
        const loadScreen = document.getElementById('loading')
        loadScreen.id = 'hide';
    }
}

const createListener = () => {
    const form = document.getElementById('search-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        openLoadScreen(true);
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const add = await fetch('Chat', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 
                'Content-Type': 'application/json',
                Authorization: localStorage.getItem('jwt')
            }
        });

        const responseData = await add.text();
        if (add.status >= 300) { // if we get a status of 300 or more we show a error on the template
            openLoadScreen(false);        
            alert(responseData)
        } else {
            contactsPage();
        }
    }
}
 
const gotoContactsListener = () => {
    const gotoContacts = document.getElementById('backToContacts');
    gotoContacts.onclick = (e) => {
        contactsPage();
    }
}

const addPage = () => {
    loadAddPage();
    gotoContactsListener();
    createListener();
}