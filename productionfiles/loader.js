document.addEventListener('DOMContentLoaded', function () {
	navbarLoaded = isnavbarLoaded();

	// function loadApp(appurl) {
    //     fetch(appurl)
    //         .then(response => response.text())
    //         .then(data => {
	// 				document.getElementById('app').innerHTML = data;
	// 			})
    //         .catch(error => console.error('Error:', error));
    // }

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

	function isnavbarLoaded()
	{
		if (document.getElementById('content') == null)
			navbarLoaded = false;
		else
			navbarLoaded = true;
	}

	if (navbarLoaded)
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