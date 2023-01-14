const loadProfilePage = async () => {
    const response = await fetch('User', {
        headers: {
            Authorization: localStorage.getItem('jwt')
        }
    }).then((data) => data.json())

    const template = `
        <div class="profile-page">
            <header>
                <button class="back" id="backToContacts"><img src="img/BackButon.svg" alt=""></button>
            </header>
            <div class="login">
                <form id="update-form" class="form">   
                    <h4>Username</h4> 
                    <input type="text" name="username" placeholder="${response.username}">
                    <div id="error"></div>    
                    <button class="submit" type="submit">Update user</button>
                </form>
            </div>
        </div>
    `;

    const center = document.getElementsByClassName('center')[0]; // remember that getElementsByClassName give us a array
    loadSurname(false);
    center.innerHTML = template; // al body le entregamos la plantilla
    onUpdateListener();
    backToChatsListener();
}

const onUpdateListener = () => {
    const update = document.getElementById('update-form');
    update.onsubmit = async (e) => {
        openLoadScreen(true);
        const formData = new FormData(update);
        const data = Object.fromEntries(formData.entries());
        console.log(data);
        e.preventDefault();
        
        const edit = await fetch('Edit', {
            method: 'PATCH',
            body: JSON.stringify(data),
            headers: { 
                'Content-Type': 'application/json',
                Authorization: localStorage.getItem('jwt')
            }
        })

        const responseData = await edit.text();
        if (edit.status >= 300) {
            openLoadScreen(false);
            alert(responseData);
        } else {
            contactsPage();
        }
    }
}

backToChatsListener = () => {
    const gotoChats = document.getElementById('backToContacts');
    gotoChats.onclick = (e) => {
        console.log('ekisde');
        contactsPage();
    }
}

const profilePage = () => {
    loadProfilePage();
}