const loadContent = (path, elementId) => {
    console.log("Url to fetch =", path);
    console.log("Trying to place it at", elementId);
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

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM CONTENT LOADED !' + document.location.href);

    const buttons = document.getElementById('btnContainer');

    for (let i = 0; i < buttons.children.length; i++)
    {
        const btn = buttons.children[i];
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            loadContent(btn.getAttribute('url'), 'content');
        });
    }

    history.replaceState('/', "", document.location.href);
	window.addEventListener('popstate', (event) => {
        console.log('POPSTATE EVENT FIRED: ', event);
        if (event.state)
        {
		    loadContent(event.state, 'content');
        }
	})

});

const updateHistory = (path) => {
	console.log('updating history with path', path);
	history.pushState(path, '', 'http://0.0.0.0:8000' + path);
}
