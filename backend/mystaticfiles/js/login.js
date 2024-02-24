function loadForm(url, elementId){
    fetch(url)
        .then(response => response.text())
        .then(htmlContent => {
            document.getElementById(elementId).innerHTML = htmlContent;
        })
        .catch(error => console.error('Error:', error));
}

function submitLoginForm(event){
    event.preventDefault();

    const formData= new FormData(document.getElementById('login-form'), document.getElementById('submit_login'));
    const elementId = 'content';

    loginUser(elementId, formData);
}


function loginUser(elementId, formData){
    const path = '/user/login/'
    fetch(path, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: formData
    })
    .then(response => {
        if (response.ok) {
            updateNavbar();
            return response.text();
        } else {
            throw new Error('Login failed');
        }
    })
    .then(htmlContent => {
        const tempElement = document.createElement('div');
        tempElement.innerHTML = htmlContent;

        const newContent = tempElement.querySelector('#content').innerHTML;
        document.getElementById(elementId).innerHTML = newContent;
    })
    .catch(error => console.error('Error:', error));
}
// function submitLoginForm(){
//     var csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
//     var login = document.getElementById("login").value;
//     var password = document.getElementById("password").value;
//     data = {
//         login: login,
//         password: password
//     }

//     var xml = new XMLHttpRequest();
//     xml.open("POST", "/user/submit_login/", true);
//     xml.setRequestHeader("Login-Cred", "json;charset=UTF-8");
//     xml.setRequestHeader("X-CSRFToken", csrfToken);
//     xml.send(JSON.stringify(data));

//     xml.onload = function(){
//         if (xml.status === 200){
//             displayErrorMessage();
//             alert("Login succesfull");
//         }
//     else if (xml.status === 401)
//         displayErrorMessage("Incorrect credentials. Please try again.");
//     else
//         displayErrorMessage("An unexpected error occured. Please try again.");
//     }
// }

// function submitRegistrationForm(){
//     var csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
//     var firstName = document.getElementById("FirstName").value;
//     var lastName = document.getElementById("LastName").value;
//     var login = document.getElementById("NickName").value;
//     var password = document.getElementById("password").value;
//     var repassword = document.getElementById("repassword").value;

//     let messages = []
//     if (firstName === '' || firstName == null)
//         messages.push('First name is required');
//     if (lastName === '' || lastName == null)
//         messages.push('Last name is required');
//     if (login.length < 4)
//         messages.push('The nickname(login) has to be longer than 4 characters');
//     if (password.length < 6)
//         messages.push('The password has to be at least 6 characters');
//     if (!hasSpecialorNumber(password))
//         messages.push('The password has to contain at least one number, one special character and a letter');
//     if (password != repassword)
//         messages.push('Passwords do not match');
//     if (messages.length > 0){
//         var message = messages.join(', ');
//         displayErrorMessage(message);
//         return;
//     }
//     check_if_in_db(login, csrfToken, function (result) {
//         if (result) {
//             displayErrorMessage('Login already in use');
//         } else {
//             var data = {
//                 firstName: firstName,
//                 lastName: lastName,
//                 login: login,
//                 password: password
//             };

//             var xml = new XMLHttpRequest();
//             xml.open("POST", "/user/submit_register/", true);
//             xml.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//             xml.setRequestHeader("X-CSRFToken", csrfToken);

//             xml.onload = function () {
//                 if (xml.status === 201) {
//                     displayErrorMessage();
//                     alert("Registration successful");
//                 } else if (xml.status === 401) {
//                     displayErrorMessage("Could not create user account.");
//                 } else {
//                     displayErrorMessage("An unexpected error has occurred.");
//                 }
//             };

//             xml.send(JSON.stringify(data));
//         }
//     });
// }

// function displayErrorMessage(message){
//     var errorMessage = document.getElementById("errorMessage");
//     if (!message)
//         errorMessage.textContent = "";
//     else
//         errorMessage.textContent = message;
// }

// function hasSpecialorNumber(input){
//     const specialCharRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;
//     const numberRegex = /\d/;
//     const letterRegex = /[a-zA-Z]/;

//     const hasSpecialChar = specialCharRegex.test(input);
//     const hasNumber = numberRegex.test(input);
//     const hasLetter = letterRegex.test(input);

//     return hasSpecialChar && hasNumber && hasLetter;
// }

// function check_if_in_db(login, csrfToken, callback){
//     var xml = new XMLHttpRequest();
//     xml.open("POST", "/user/register_form/check_login/", true);
//     xml.setRequestHeader("Check-login", "json;charset=UTF-8");
//     xml.setRequestHeader("X-CSRFToken", csrfToken);
//     xml.onload = function(){
//         if (xml.status == 409)
//             callback(true);
//         else
//             callback(false);
//         }
//     xml.send(JSON.stringify(login));
// }
