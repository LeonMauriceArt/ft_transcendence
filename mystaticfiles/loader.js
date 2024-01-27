document.addEventListener('DOMContentLoaded', function () {
	indexLoaded = isIndexLoaded();
	console.log(window.location.pathname);
	if (!indexLoaded)
	{
		contentToLoad = window.location.pathname;
		console.log('contentto load = ', contentToLoad);
		window.location.pathname = '/';
		loadContent(contentToLoad);
	}

    function loadContent(url) {
        fetch(url)
            .then(response => response.text())
            .then(data => {
				contentElement = document.getElementById('content');
				console.log(contentElement);
				if (!contentElement){
					console.log('can laod !!!!!!!');
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

	function isIndexLoaded(){
		if (window.location.pathname == '/'){
			console.log('index is loaded');
			return true;
		}
		else{
			console.log('index is not loaded');
			return false;
		}
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

