import { loadContent, updateHistory } from "./loadcontentSPA";

document.addEventListener('DOMContentLoaded', function () {

	document.getElementById('navQuickmatch').addEventListener('click', function () {
		updateHistory('/lobby/');
		loadContent('/lobby/', 'app');
	});

	document.getElementById('navJoingame').addEventListener('click', function () {
		updateHistory('/lobby/');
		loadContent('/lobby/', 'app');
	});

	document.getElementById('navCreategame').addEventListener('click', function () {
		updateHistory('/gameoptions/');
		console.log("je veux creer une game");
		loadContent('/gameoptions/', 'content');
	});

	document.getElementById('navPractice').addEventListener('click', function () {
		updateHistory('/pong_game_practice/');
		loadContent('/pong_game_practice/', 'app');
	});

	window.addEventListener('popstate', function(event){
		loadContent(window.location.pathname, 'content');
	})
});