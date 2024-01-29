document.addEventListener('DOMContentLoaded', function () {
	navbarLoaded = isnavbarLoaded();
	console.log(navbarLoaded);

    function loadContent(url) {
        fetch(url)
            .then(response => response.text())
            .then(data => {
					const parser = new DOMParser();
					const htmlDocument = parser.parseFromString(data, 'text/html');
					const extractedContent = htmlDocument.getElementById('content').innerHTML;
					document.getElementById('content').innerHTML = extractedContent;
				})
            .catch(error => console.error('Error:', error));
    }

	function updateHistory(url){
		console.log('updating history with url', url);
		window.history.pushState({}, '', url);
	}

	function isnavbarLoaded()
	{
		if (document.getElementById('content') == null)
			return false;
		else
			return true;
	}

	if (navbarLoaded)
	{
		document.getElementById('navHome').addEventListener('click', function () {
			updateHistory('/welcome/');
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