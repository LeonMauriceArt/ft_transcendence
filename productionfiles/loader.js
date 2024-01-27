document.addEventListener('DOMContentLoaded', function () {
	indexLoaded = isIndexLoaded();
	console.log(window.location.pathname);

    function loadContent(url) {
        fetch(url)
            .then(response => response.text())
            .then(data => {
				const contentElement = document.getElementById('content');
				if (contentElement){
					indexLoaded = true;
					contentElement.innerHTML = data;
				}
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
		console.log("loading content...")
        loadContent(window.location.pathname);

    } else {
        // Page is not being refreshed, load the initial content ('/welcome/')
        loadContent('/welcome/');
    }


	function isIndexLoaded(){
		if (window.location.pathname == '')
			return true;
		else
			return false;
	}

	if (indexLoaded)
	{
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
	}

});

