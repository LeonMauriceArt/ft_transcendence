function loadForm(url, elementId){
    fetch(url)
        .then(response => response.text())
        .then(htmlContent => {
            document.getElementById(elementId).innerHTML = htmlContent;
        })
        .catch(error => console.error('Error:', error));
}

function submitLoginForm(){
    var csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
    var login = document.getElementById("login").value;
    var password = document.getElementById("password").value;
    data = {
        login: login,
        password: password
    }

    var xml = new XMLHttpRequest();
    xml.open("POST", "/user/submit_login/", true);
    xml.setRequestHeader("Login-Cred", "json;charset=UTF-8");
    xml.setRequestHeader("X-CSRFToken", csrfToken);
    xml.send(JSON.stringify(data));

    xml.onload = function(){
        if (xml.status === 200){
            displayErrorMessage();
            alert("Login succesfull");
        }
    else if (xml.status === 401)
        displayErrorMessage("Incorrect credentials. Please try again.");
    else
        displayErrorMessage("An unexpected error occured. Please try again.");
}
}

function submitRegistrationForm(){
    var csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
    var firstName = document.getElementById("FirstName").value;
    var lastName = document.getElementById("LastName").value;
    var login = document.getElementById("NickName").value;
    var password = document.getElementById("password").value;
    data = {
        firstName: firstName,
        lastName: lastName,
        login: login,
        password: password
    }
    var xml = new XMLHttpRequest();
    xml.open("POST", "/user/submit_register/", true);
    xml.setRequestHeader("Register-Cred", "json;charset=UTF-8");
    xml.setRequestHeader("X-CSRFToken", csrfToken);
    xml.send(JSON.stringify(data));
}

function displayErrorMessage(message){
    var errorMessage = document.getElementById("errorMessage");
    if (!message)
        errorMessage.textContent = "";
    else
        errorMessage.textContent = message;
}
