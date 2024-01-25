document.addEventListener('DOMContentLoaded', function () {
    // Function to load content dynamically
    function loadContent(url) {
        fetch(url)
            .then(response => response.text())
            .then(data => {
                document.getElementById('content').innerHTML = data;
				updateHistory(url);
            })
            .catch(error => console.error('Error:', error));
    }

	function updateHistory(url){
		window.history.pushState({}, '', url);
		console.log("hello");
	}

	loadContent('/welcome/');
	console.log("init load");

    document.getElementById('navHome').addEventListener('click', function () {
        loadContent('/welcome/');
    });

    document.getElementById('navGame').addEventListener('click', function () {
        loadContent('/game/');
    });

    document.getElementById('navUser').addEventListener('click', function () {
        loadContent('/user/');
    });

	window.addEventListener('popstate', function(event){
		loadContent(window.location.pathname);
	})
});