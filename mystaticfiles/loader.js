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

	loadContent('/welcome/');

    document.getElementById('navHome').addEventListener('click', function () {
        loadContent('/welcome/');
    });

    document.getElementById('navGame').addEventListener('click', function () {
        loadContent('/game/');
    });

    document.getElementById('navUser').addEventListener('click', function () {
        loadContent('/user/');
    });
});