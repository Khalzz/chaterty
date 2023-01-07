window.onload = () => {
    const isLoggedIn = checkLogin();
    if (isLoggedIn) {
        contactsPage();      
    } else {
        loginPage();
    }
}

const loadSurname = (value) => {
    const surname = document.getElementsByClassName('name')[0]; // remember that getElementsByClassName give us a array
    surname.classList.toggle('hide', value)
}