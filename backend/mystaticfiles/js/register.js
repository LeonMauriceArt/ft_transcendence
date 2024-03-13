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
    

// Function to get CSRF token from cookie
// function getCookie(name) {
//     let cookieValue = null;
//     if (document.cookie && document.cookie !== '') {
//         const cookies = document.cookie.split(';');
//         for (let i = 0; i < cookies.length; i++) {
//             const cookie = cookies[i].trim();
//             if (cookie.substring(0, name.length + 1) === (name + '=')) {
//                 cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                 break;
//             }
//         }
//     }
//     return cookieValue;
// }

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        console.log('All Cookies:', cookies); // Log all cookies

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            console.log('Current Cookie:', cookie); // Log current cookie

            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                console.log('Found Cookie Value:', cookieValue); // Log found cookie value
                break;
            }
        }
    }
    return cookieValue;
}