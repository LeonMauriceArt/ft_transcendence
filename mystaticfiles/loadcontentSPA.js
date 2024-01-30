export function loadContent(url, elementID) {
	fetch(url)
		.then(response => response.text())
		.then(data => {
				const parser = new DOMParser();
				const htmlDocument = parser.parseFromString(data, 'text/html');
				const extractedContent = htmlDocument.getElementById(elementID).innerHTML;
				document.getElementById(elementID).innerHTML = extractedContent;
			})
		.catch(error => console.error('Error:', error));
}

export function updateHistory(url){
	console.log('updating history with url', url);
	window.history.pushState({}, '', url);
}
