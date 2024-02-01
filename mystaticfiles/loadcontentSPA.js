export function loadContent(url, elementID) {
	console.log("Trying to load content with url", url, "at elementID", elementID)
	fetch(url)
		.then(response => response.text())
		.then(data => {
				const parser = new DOMParser();
				const htmlDocument = parser.parseFromString(data, 'text/html');
				// console.log("htmldoc = ", htmlDocument);
				const extractedContent = htmlDocument.getElementById(elementID).innerHTML;
				// console.log("extracted content = ", extractedContent);
				document.getElementById(elementID).innerHTML = extractedContent;
			})
		.catch(error => console.error('Error:', error));
}

export function updateHistory(url){
	console.log('updating history with url', url);
	window.history.pushState({}, '', url);
}
