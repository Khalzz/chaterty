const checkLogin = async () => {
    try {    
        const getUser = await fetch('User', {
            method: 'GET',
            headers: { 
                Authorization: localStorage.getItem('jwt')
            }
        }).then(data => data.json());

        console.log(getUser)

        if (getUser) {
            return localStorage.getItem('jwt')
        }
    
    } catch (e) {    
        return false
    }
}


window.onload = async () => {
    const isLoggedIn = await checkLogin();
    if (isLoggedIn) {
        contactsPage();      
    } else {
        loginPage();
        openLoadScreen(false)
    }
}

const loadSurname = (value) => {
    const surname = document.getElementsByClassName('name')[0]; // remember that getElementsByClassName give us a array
    surname.classList.toggle('hide', value);
}

const openLoadScreen = (value) => {
    const loadScreen = document.getElementById('loading')
    if (value == true) {
        loadScreen.style.display = 'flex';
    } else if (value == false) {
        loadScreen.style.display = 'none';
    }
}

    

