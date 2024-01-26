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

	function updateHistory(url){
		console.log('updating history with url', url);
		window.history.pushState({}, '', url);
	}

    if (performance.getEntriesByType('navigation')[0].type === 'reload') {
        // Page is being refreshed, load the initial content ('')
		console.log("refreshing...")
		console.log("loading index...")
        loadContent('');
    } else {
        // Page is not being refreshed, load the initial content ('/welcome/')
        loadContent('/welcome/');
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

