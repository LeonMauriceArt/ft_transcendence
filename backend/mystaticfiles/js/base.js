const loadPage = (page) => {
    const baseUrl = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');

    updateHistory(baseUrl + page);
    loadContent(page, 'content');
}

function loadContent(path, elementId){
    return fetch(path)
        .then(response => response.text())
        .then(htmlContent => {
            const tempElement = document.createElement('div');
            tempElement.innerHTML = htmlContent;

            const newContent = tempElement.querySelector('#content').innerHTML;
            document.getElementById(elementId).innerHTML = newContent;
        })
        .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('popstate', (event) => {
        const page = window.location.pathname.split('/').pop();
        loadContent(page, 'content');
	})
});

const updateHistory = (url) => {
	history.pushState(null, null, url);
}

function updateNavbar()
{
    fetch('/navbar/')
        .then(response => response.json())
        .then(data => {
                document.getElementById('navbar').innerHTML = data.navbar_html
        })
        .catch(error => console.error('Error:', error));
}