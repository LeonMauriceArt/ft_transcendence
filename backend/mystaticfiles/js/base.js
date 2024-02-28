function attachEventListeners() {
    // Attach existing event listeners
    attachFriendRequestEventListeners();
    attachFriendAcceptEventListeners();
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', submitProfileForm);
    }
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(this);
            fetch('/user/change_password/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                },
            })
            .then(response => {
                if (response.ok) {
                    // Le mot de passe a été changé avec succès, affichez un message de succès
                    document.getElementById('changePasswordForm').style.display = 'none';
                    document.getElementById('passwordChangeSuccessMessage').style.display = 'block';
                } else {
                    // Il y a eu une erreur (peut-être des erreurs de validation), traitez cela
                    response.text().then(text => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(text, 'text/html');
                        // Extraire et afficher les messages d'erreur du formulaire
                        const errors = doc.querySelectorAll('.errorlist');
                        if (errors.length > 0) {
                            errors.forEach(error => {
                                changePasswordForm.prepend(error);
                            });
                        }
                    });
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }
}

function changePassword(formData) {
    fetch('/user/change_password/', { // Assurez-vous que l'URL est correcte
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': getCookie('csrftoken'), // Utilisez getCookie pour obtenir le CSRFToken
        },
    })
    .then(response => {
        if (response.ok) {
            // Cachez le formulaire et affichez le message de succès
            document.getElementById('changePasswordForm').style.display = 'none';
            document.getElementById('passwordChangeSuccessMessage').style.display = 'block';
        } else {
            // Gérez le cas d'erreur, par exemple en affichant un message d'erreur
            alert('Failed to change password. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

function submitProfileForm(event) {
    event.preventDefault(); // Empêche la soumission normale du formulaire

    const form = document.getElementById('editProfileForm'); // Assurez-vous que cet ID correspond à votre formulaire
    const formData = new FormData(form);
    const path = '/user/edit_profile/'; // Remplacez par l'URL correcte de votre vue de modification de profil

    fetch(path, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': getCookie('csrftoken') // Utilisez getCookie pour obtenir le CSRFToken comme dans votre exemple
        },
    })
    .then(response => {
        if (response.ok) {
            // Ici, gérez la réponse en cas de succès, par exemple en affichant un message ou en redirigeant l'utilisateur
            alert('Profile updated successfully');
            // Optionnellement, rechargez les informations de l'utilisateur ou redirigez
            // loadPage('/user/profile/'); // Redirige vers la page du profil
        } else {
            // Gérez le cas où la sauvegarde a échoué
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