import { loadContent, updateHistory } from "./loadcontentSPA.js";

document.addEventListener('DOMContentLoaded', function () {

	document.getElementById('navHome').addEventListener('click', function () {
		updateHistory('/welcome/');
		loadContent('/welcome/', 'content');
	});

	document.getElementById('navGame').addEventListener('click', function () {
		updateHistory('/game/');
		loadContent('/game/', 'content');
	});

	document.getElementById('navUser').addEventListener('click', function () {
		updateHistory('/user/');
		loadContent('/user/', 'content');
	});

	window.addEventListener('popstate', function(event){
		loadContent(window.location.pathname, 'content');
	})

});