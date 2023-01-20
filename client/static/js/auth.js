

const loadLoginTemplate = () => {
    openLoadScreen(false);
    const template = `
    <img class="logo" src="img/logo.svg" alt="please, blame Rodrigo">
    <div class="login">
        <form id="login-form" class="form">    
            <input type="text" name="username" placeholder="username">
            <input type="password" name="password" placeholder="password">
            <div id="error"></div>    
            <button class="submit" type="submit">Log in</button>
        </form>
    </div>

    <div class="register"><p >You dont have an account? <a class="link" href="#" id="register">Sign up</a></p></div>
    `;
    const center = document.getElementsByClassName('center')[0]; // remember that getElementsByClassName give us a array
    loadSurname(false);
    center.innerHTML = template; // al body le entregamos la plantilla
}

const loadRegisterTemplate = () => {
    openLoadScreen(false);
    const template = `
    <img class="logo" src="img/logo.svg" alt="please, blame Rodrigo">
    <div class="login">
        <form id="register-form" class="form">    
            <input type="text" name="username" placeholder="username">
            <input type="password" id="password" name="password" placeholder="password">
            <div id="error"></div>
            <button class="submit" type="submit">Sign up</button>
        </form>
    </div>
    <div class="register"><p >You already have an account? <a class="link" href="#" id="login">Log in</a></p></div>
    `;
    const center = document.getElementsByClassName('center')[0]; // remember that getElementsByClassName give us a array
    loadSurname(false);
    center.innerHTML = template; 
}

// i did this so we can use one function for login and register
const authListener = action => () => {
    const form = document.getElementById(`${action}-form`);
    form.onsubmit = async (e) => { 
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const response = await fetch(`/${action}`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 
                'Content-Type': 'application/json',
            }
        })

        // error handling
        const responseData = await response.text();
        if (response.status >= 300) { // if we get a status of 300 or more we show a error on the template
            const errorNode = document.getElementById('error');
            errorNode.innerHTML = responseData;
        } else {
            if (action == 'login') {
                localStorage.setItem('jwt', `Bearer ${responseData}`);
                location.reload();
            } else if (action == 'register') {
                loginPage();
            }
            // chatsPage();
        }
    }
}

const addLoginListener = authListener('login')
const addRegisterListener = authListener('register');

const gotoRegisterListener = () => {
    const gotoRegister = document.getElementById('register');
    gotoRegister.onclick = (e) => {
        e.preventDefault();
        registerPage();
    }
}

const gotoLoginListener = () => {
    const gotoRegister = document.getElementById('login');
    gotoRegister.onclick = (e) => {
        e.preventDefault();
        loginPage();
    }
}

const loginPage = () => {
    loadLoginTemplate();
    addLoginListener();
    gotoRegisterListener();
}

const registerPage = () => {
    loadRegisterTemplate();
    addRegisterListener();
    gotoLoginListener();
} 