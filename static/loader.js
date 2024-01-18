// document.addEventListener('DOMContentLoaded', function () {
//     // Function to load content dynamically
//     function loadContent(url) {
//         fetch(url)
//             .then(response => response.text())
//             .then(data => {
//                 document.getElementById('content').innerHTML = data;
//             })
//             .catch(error => console.error('Error:', error));
//     }

//     // Initial content load
//     loadContent('/');

//     // Event listener for navigation
//     document.getElementById('navHome').addEventListener('click', function () {
//         loadContent('/');
//     });

//     document.getElementById('navGame').addEventListener('click', function () {
//         loadContent('/game/');
//     });
// });

document.addEventListener('DOMContentLoaded', function () {
    // Function to load content dynamically
    function loadContent(url) {
        fetch(url)
            .then(response => response.text())
            .then(data => {
                document.getElementById('content').innerHTML = data;
            })
            .catch(error => console.error('Error:', error));
    }

    // Event listener for navigation
    const navHome = document.getElementById('navHome');
    const navGame = document.getElementById('navGame');

    if (navHome && navGame) {
        navHome.addEventListener('click', function () {
            loadContent('/');
        });

        navGame.addEventListener('click', function () {
            loadContent('/game/');
        });
    } else {
        console.error('Navigation buttons not found');
    }
});