document.addEventListener('DOMContentLoaded', function() {
    attachEventListeners();
});

function attachEventListeners() {
    const sendFriendRequestButtons = document.querySelectorAll('.send-friend-request');
    sendFriendRequestButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            sendFriendRequest(userId);
        });
    });

    const acceptFriendRequestButtons = document.querySelectorAll('.accept-friend-request');
    acceptFriendRequestButtons.forEach(button => {
        button.addEventListener('click', function() {
            const friendshipId = this.getAttribute('data-friendship-id');
            acceptFriendRequest(friendshipId);
        });
    });

    const userProfileLinks = document.querySelectorAll('.user-profile-link');
    userProfileLinks.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            loadPage(`/user/user_profile/${userId}/`);
        });
    });
}

function sendFriendRequest(userId) {
    fetch(`/user/send_friend_request/${userId}/`, {method: 'GET'})
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        alert(data.message);
    })
    .catch(error => console.error('Error:', error));
}

function acceptFriendRequest(friendshipId) {
    const csrfToken = getCookie('csrftoken');
    fetch(`/user/accept_friend_request/${friendshipId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const messageContainer = document.getElementById('message-container');
        messageContainer.innerHTML = `<p>${data.message}</p>`;
        messageContainer.style.display = 'block';
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 5000);
    })
    .catch(error => console.error('Error:', error));
}

function getCSRFToken() {
    let csrftoken = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, 10) === ('csrftoken=')) {
                csrftoken = decodeURIComponent(cookie.substring(10));
                break;
            }
        }
    }
    return csrftoken;
}