function submitRegisterForm(event){
    event.preventDefault();
    
    const formData= new FormData(document.getElementById('registration-form'), document.getElementById('submit_button'));
    const elementId = 'content';
    
    registerUser(elementId, formData);
}

function registerUser(elementId, formData){
    const path = '/user/register/'
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
            throw new Error('Registration failed');
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

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();

            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}