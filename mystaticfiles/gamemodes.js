import { loadContent, updateHistory } from "./loadcontentSPA";

document.addEventListener('DOMContentLoaded', function () {

	// document.getElementById('navQuickmatch').addEventListener('click', function () {
	// 	updateHistory('/welcome/');
	// 	loadContent('/welcome/', 'content');
	// });

	// document.getElementById('navJoingame').addEventListener('click', function () {
	// 	updateHistory('/game/');
	// 	loadContent('/game/', 'content');
	// });

	// document.getElementById('navCreategame').addEventListener('click', function () {
	// 	updateHistory('/user/');
	// 	loadContent('/user/', 'content');
	// });

	// document.getElementById('navPractice').addEventListener('click', function () {
	// 	updateHistory('/user/');
	// 	loadContent('/user/', 'content');
	// });

	window.addEventListener('popstate', function(event){
		loadContent(window.location.pathname);
	})
});