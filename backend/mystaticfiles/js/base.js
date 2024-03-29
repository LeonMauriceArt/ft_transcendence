const page_change = new Event('page_change')

function attachEventListeners() {
    // Attach existing event listeners
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', submitProfileForm);
    }
    const form = document.getElementById('changePasswordForm');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(this);
            changePassword(formData);
        });
    }
}

function logoutUser() {
    fetch('/user/logout/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
        },
    })
    .then(response => {
        if (response.ok) {
            updateNavbar();
        } else {
            console.error('Logout failed.');
        }
    })
    .then(() => {
        loadPage('/');
    })
    .catch(error => console.error('Error:', error));
}

function changePassword(event) {
    event.preventDefault(); 
    const form = document.getElementById('changePasswordForm');
    const formData = new FormData(form);
    const path = '/user/change_password/'; 
    fetch(path, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'), 
        },
        body: formData
    })
    .then(response => {
        if (response.ok) {
            updateNavbar();
            return response.text();
        } else {
            throw new Error('Password change failed')
        }
    })
    .then(htmlContent => {
        const tempElement = document.createElement('div');
        tempElement.innerHTML = htmlContent;

        const newContent = tempElement.querySelector('#content').innerHTML;
        document.getElementById('content').innerHTML = newContent;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}


function submitProfileForm(event) {
    event.preventDefault();

    const form = document.getElementById('editProfileForm');
    const formData = new FormData(form);
    const path = '/user/edit_profile/';

    fetch(path, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
    })
    .then(response => {
        if (response.ok) {
            alert('Profile updated successfully');
        } else {
            throw new Error('Failed to update profile');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

function attachProfileLinkEventListeners() {
    document.querySelectorAll('.user-profile-link').forEach(button => {
        button.addEventListener('click', function() {
            console.log("click detected");
        });
    });
}

const loadPage = (page) => {
    const baseUrl = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');

    window.dispatchEvent(page_change)
    
    updateHistory(baseUrl + page);
    loadContent(page, 'content');
    const customEvent = new Event('page_change');
    window.dispatchEvent(customEvent)
}

function loadContent(path, elementId){
    return fetch(path)
        .then(response => response.text())
        .then(htmlContent => {
            const tempElement = document.createElement('div');
            tempElement.innerHTML = htmlContent;

            const newContent = tempElement.querySelector('#content').innerHTML;
            document.getElementById(elementId).innerHTML = newContent;
            attachEventListeners();
        })
        .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('popstate', (event) => {
        const page = window.location.pathname.split('/').pop();
        loadContent(page, 'content');
	})
});

const updateHistory = (url) => {
	history.pushState(null, null, url);
}

function updateNavbar()
{
    fetch('/navbar/')
        .then(response => response.json())
        .then(data => {
                document.getElementById('navbar').innerHTML = data.navbar_html
        })
        .catch(error => console.error('Error:', error));
}

window.addEventListener('load', function() {
    console.log('SETTING PAGERELOAD');
    sessionStorage.setItem('pageReload', 'true');
});

window.addEventListener('unload', function(event) {
    if (sessionStorage.getItem('pageReload') === 'true') {
        console.log('Page is being refreshed');
        sessionStorage.removeItem('pageReload');
    } else {
        console.log('Browser is being closed');
        logoutUser();
        updateNavbar();
    }
});
