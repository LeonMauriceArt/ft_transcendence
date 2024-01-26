document.addEventListener('DOMContentLoaded', function () {
	let indexLoaded = false;

    // Function to load content dynamically
    function loadContent(url) {
        fetch(url)
            .then(response => response.text())
            .then(data => {
                document.getElementById('content').innerHTML = data;
				if (url == ''){
					indexLoaded = true;
				}
            })
            .catch(error => console.error('Error:', error));
    }

	function updateHistory(url){
		console.log('updating history with url', url);
		window.history.pushState({}, '', url);
	}

    if (!indexLoaded) {
        loadContent('');
        indexLoaded = true;
    }

    document.getElementById('navHome').addEventListener('click', function () {
		updateHistory('/welcome');
        loadContent('/welcome/');
    });

    document.getElementById('navGame').addEventListener('click', function () {
		updateHistory('/game/');
        loadContent('/game/');
    });

    document.getElementById('navUser').addEventListener('click', function () {
		updateHistory('/user/');
        loadContent('/user/');
    });

	window.addEventListener('popstate', function(event){
		loadContent(window.location.pathname);
	})
});