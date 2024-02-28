document.addEventListener('DOMContentLoaded', function() {
    // Attache les événements aux boutons ou liens appropriés
    attachEventListeners();
});

function attachEventListeners() {
    // Attache l'événement d'envoi de demande d'ami
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
}

function sendFriendRequest(userId) {
    // Assurez-vous que l'URL est correctement formée
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
    fetch(`/user/accept_friend_request/${friendshipId}/`, {method: 'POST'})
        .then(response =>{
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

function getCSRFToken() {
    // Récupère le token CSRF depuis le cookie
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