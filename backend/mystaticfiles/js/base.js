const page_change = new Event('page_change')

function attachEventListeners() {
    // Attach existing event listeners
    attachFriendRequestEventListeners();
    attachFriendAcceptEventListeners();
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

function attachFriendRequestEventListeners() {
    document.querySelectorAll('.send-friend-request').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            sendFriendRequest(userId);
        });
    });
}

function attachFriendAcceptEventListeners() {
    document.querySelectorAll('.accept-friend-request').forEach(button => {
        button.addEventListener('click', function() {
            const friendshipId = this.getAttribute('data-friendship-id');
            acceptFriendRequest(friendshipId);
        });
    });
}

const loadPage = (page) => {
    const baseUrl = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');

    window.dispatchEvent(page_change)
    
    updateHistory(baseUrl + page);
    loadContent(page, 'content');
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