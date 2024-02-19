function loadContent(path, elementId){
    fetch(path)
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
    const baseUrl = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
    const buttons = document.getElementById('btnContainer');

    for (let i = 0; i < buttons.children.length; i++)
    {
        const btn = buttons.children[i];
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            updateHistory(baseUrl + btn.getAttribute('page'));
            loadContent(btn.getAttribute('page'), 'content');
        });
    }

    window.addEventListener('popstate', (event) => {
        const page = window.location.pathname.split('/').pop();

        loadContent(page, 'content');
	})
});

const updateHistory = (url) => {
	history.pushState(null, null, url);
}
