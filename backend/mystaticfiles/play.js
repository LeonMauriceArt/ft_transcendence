
function updateValue(value, elementId){
	var element = document.getElementById(elementId);
	element.innerHTML = value;
}

function loadPractice()
{
	fetch('/play/practice')
    .then(response => response.text())
    .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const navbarContent = doc.querySelector('#content');
        const navbarContainer = document.getElementById('content');
        navbarContainer.innerHTML = navbarContent.innerHTML;
        startPong();
    })
    .catch(error => {
        console.error('Error fetching page content:', error);
    });
}