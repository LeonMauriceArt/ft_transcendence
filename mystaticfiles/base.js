function loadContent(path, elementId){
    fetch(path)
        .then(response => response.text())
        .then(htmlContent => {
            const tempElement = document.createElement('div');
            tempElement.innerHTML = htmlContent;

            const newContent = tempElement.querySelector('#content').innerHTML;
			updateHistory(path);
            document.getElementById(elementId).innerHTML = newContent;
        })
        .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', function () {
	window.addEventListener('popstate', function(event){
		loadContent(window.location.pathname, 'content');
	})

});

function updateHistory(path){
	console.log('updating history with path', path);
	history.pushState({}, '', path);
}
