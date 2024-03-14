function loadForm(url, elementId){
    fetch(url)
        .then(response => response.text())
        .then(htmlContent => {
            document.getElementById(elementId).innerHTML = htmlContent;
            attachEventListeners();
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
