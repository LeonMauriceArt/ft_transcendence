import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { createTextMesh } from './Text.js';
import {Player} from './Player.js'
import * as material from './Materials.js'
import {Wall} from './Arena.js'
import {Ball} from './Ball.js'
import { ScreenShake } from './ScreenShake.js';
import * as constants from './Constants.js';
import { Power_Manager } from './Powerups.js';

var game_running, camera, orbitcontrols, renderer, player_one, 
player_two, ball, scene, 
player_one_score_text, player_two_score_text, droidFont, winning_text,
player_one_goal, player_two_goal
// powerup_manage

const wssurl = 'ws://' + window.location.host + '/ws/game/';
let wss;

const keys = {};

var position = null;

var screenShake = ScreenShake()

game_running = false

const fontlLoader = new FontLoader();
fontlLoader.load(droid,
	function (loadedFont){
		droidFont = loadedFont;
	});
	
var id = null;

function sendMessageToServer(message)
{
	wss.send(JSON.stringify(message));
}

export function start()
{
	initDisplay();
	initArena();
	wss = new WebSocket(wssurl);
	wss.onopen = () => {
		resetGame()
		console.log('Websocket connection established.');
	}
	wss.onmessage = (event) => 
	{
		const data = JSON.parse(event.data);
		if (data.type === 'set_position')
		{
			position = data.value;
			console.log('I am at position', position);
		}
		if (data.type === 'game_start')
		{
			console.log('Starting game . . .');
			game_running = true;
			ball.get_update(0, 0, 1, 0, 0xffffff)
			initControls();
		}
		if (data.type === 'game_state')
		{
			updateGameState(data);
		} 
		if (data.type === 'game_end')
		{
			console.log('GAME IS ENDING AND SOMEONE WON')
			display_winner(data.winner)
		}
		// if (data.type === 'init_game')
		// 	resetGame()
	};
	wss.onclose = () => 
	{
		console.log('Websocket connection closed.');
	};
	if (id !==null)
		cancelAnimationFrame(id);
	animate();
}

export function resetGame(){
	// if (wss && wss.readyState === WebSocket.OPEN){
	// 	wss.close();
	// }
	scene.children.forEach(child => {
		scene.remove(child);
	});
	scene.traverse(obj => {
		if (obj.material) {
			obj.material.dispose();
		}
		if (obj.geometry) {
			obj.geometry.dispose();
		}
		if (obj.texture) {
			obj.texture.dispose();
		}
	});
	initArena();
}

function updateGameState(data)
{
	player_one.mesh.position.y = data.player_one_pos_y
	player_two.mesh.position.y = data.player_two_pos_y
	ball.mesh.position.x = data.ball_x
	ball.mesh.position.y = data.ball_y
	ball.light.position.set(ball.mesh.position.x, ball.mesh.position.y)
	if (ball.color != data.ball_color)
		ball.setcolor(data.ball_color)
	if (data.player_one_score != player_one.score)
	{
		player_one.score += 1
		handle_scores('player_one')
	}
	if (data.player_two_score != player_two.score)
	{
		player_two.score += 1
		handle_scores('player_two')
	}
	ball.get_update(data.ball_x, data.ball_y, data.ball_x_vel, data.ball_y_vel, data.ball_color)
}

function initDisplay()
{
	renderer = new THREE.WebGLRenderer({alpha: false, antialias: false});
	renderer.setPixelRatio(devicePixelRatio / 2);

	var container = document.getElementById('canvas');
	var w = container.offsetWidth;
	var h = container.offsetHeight;
	renderer.setSize(w, h);
	container.appendChild(renderer.domElement);
	
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x00000, 5, 300 );
	
	camera = new THREE.PerspectiveCamera(
		45, 
		constants.WIN_WIDTH / constants.WIN_HEIGHT,
		0.1,
		1000
	);
	camera.position.z = constants.CAMERA_STARTPOS_Z
}

function initArena()
{
	player_one = new Player(1, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.PLAYER_1_COLOR)
	player_two = new Player(2, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.PLAYER_2_COLOR)
	scene.add(player_one.mesh, player_two.mesh)
	
	ball = new Ball()
	scene.add(ball.mesh, ball.light)
	
	orbitcontrols = new OrbitControls( camera, renderer.domElement );
	orbitcontrols.enableDamping = true;
	orbitcontrols.dampingFactor = 0.05;
	orbitcontrols.enabled = false
	orbitcontrols.screenSpacePanning = true;
	
	var upper_wall = new Wall(constants.GAME_AREA_HEIGHT, 300, material.wallMaterial)
	var lower_wall = new Wall(constants.GAME_AREA_HEIGHT * -1, 300, material.wallMaterial)
	scene.add(upper_wall.mesh, lower_wall.mesh)
	
	player_one_goal = new THREE.Mesh(
		new THREE.PlaneGeometry(20, constants.GAME_AREA_HEIGHT * 2, 1, 4),
		material.wallMaterial)
	player_one_goal.rotation.y = Math.PI / 2
	player_one_goal.position.x = constants.GAME_AREA_WIDTH * -1
	player_two_goal = new THREE.Mesh(
		new THREE.PlaneGeometry(20, constants.GAME_AREA_HEIGHT * 2, 1, 4),
		material.wallMaterial)
	player_two_goal.rotation.y = (Math.PI / 2) * -1
	player_two_goal.position.x = constants.GAME_AREA_WIDTH
	scene.add(player_one_goal, player_two_goal)
	
	player_one_score_text = createTextMesh(droidFont, player_one.score.toString(), player_one_score_text, (constants.GAME_AREA_WIDTH / 2) * -1, 0,-80, constants.PLAYER_1_COLOR, 50);
	player_two_score_text = createTextMesh(droidFont, player_two.score.toString(), player_two_score_text, constants.GAME_AREA_WIDTH / 2, 0,-80, constants.PLAYER_2_COLOR, 50);
	scene.add(player_one_score_text, player_two_score_text)
}

function handleKeyDown(event) {
	if(game_running)
	{
		if (!keys[event.code] && (event.code == 'KeyW' || event.code == 'KeyS'))
		{
			var up = false;
			if (event.code == 'KeyW')
				up = true;
			keys[event.code] = true;
			sendMessageToServer({type: 'player_key_down', player: position,  direction: up})
		}
	}
}

function handleKeyUp(event) {
	if (game_running)
	{
		if (event.code == 'KeyW' || event.code == 'KeyS')
		{
			keys[event.code] = false;
			sendMessageToServer({type: 'player_key_up', player: position})
		}
	}
}

function initControls(){
	window.addEventListener('keydown', handleKeyDown);
	window.addEventListener('keyup', handleKeyUp);
}

function handle_scores(player_scoring)
{
	if (player_scoring == 'player_one')
	{
		screenShake.shake( camera, new THREE.Vector3(-5, -5, 20), constants.BALL_RESPAWN_TIME * 1000/* ms */ );
		scene.remove(player_one_score_text)
		player_one_score_text = createTextMesh(droidFont, player_one.score.toString(), player_one_score_text, (constants.GAME_AREA_WIDTH / 2) * -1, 0,-80, constants.PLAYER_1_COLOR, 50);
		scene.add(player_one_score_text)
	}
	else
	{
		screenShake.shake( camera, new THREE.Vector3(5, 5, 20), constants.BALL_RESPAWN_TIME * 1000 /* ms */ );
		scene.remove(player_two_score_text)
		player_two_score_text = createTextMesh(droidFont, player_two.score.toString(), player_two_score_text, constants.GAME_AREA_WIDTH / 2, 0,-80, constants.PLAYER_2_COLOR, 50);
		scene.add(player_two_score_text)
	}
}

function display_winner(winning_player)
{
	orbitcontrols.autoRotate = true;
	ball.stop();
	scene.children.forEach(child => {
		scene.remove(child);
	});
	scene.traverse(obj => {
		if (obj.material) {
			obj.material.dispose();
		}
		if (obj.geometry) {
			obj.geometry.dispose();
		}
		if (obj.texture) {
			obj.texture.dispose();
		}
	});
	// scene.remove(player_one_score_text)
	// scene.remove(player_two_score_text)
	// scene.remove(player_one.mesh, player_two.mesh, player_one_goal, player_two_goal)
	// var light1;
	// var light2;
	// if (winning_player == 'player_one')
	// {
	// 	winning_text = createTextMesh(droidFont, "PLAYER 1 WIN", player_one_score_text, 0, 0, 0, 0xffffff, 13)
	// 	winning_text.material.emissiveIntensity = 0.5
	// 	light1 = new THREE.PointLight(constants.PLAYER_1_COLOR, 20000, 300);
	// 	light1.position.set(constants.GAME_AREA_WIDTH / 3, constants.GAME_AREA_HEIGHT / 3)
	// 	light2 = new THREE.PointLight(constants.PLAYER_1_COLOR, 20000, 300);
	// 	light2.position.set(constants.GAME_AREA_WIDTH * -1 / 3, constants.GAME_AREA_HEIGHT * -1 / 3)
	// }
	// else
	// {
	// 	winning_text = createTextMesh(droidFont, "PLAYER 2 WIN", player_two_score_text, 0, 0, 0, 0xffffff, 13)
	// 	winning_text.material.emissiveIntensity = 0.5
	// 	light1 = new THREE.PointLight(constants.PLAYER_2_COLOR, 20000, 300);
	// 	light1.position.set(constants.GAME_AREA_WIDTH / 3, constants.GAME_AREA_HEIGHT / 3)
	// 	light2 = new THREE.PointLight(constants.PLAYER_2_COLOR, 20000, 300);
	// 	light2.position.set(constants.GAME_AREA_WIDTH * -1 / 3, constants.GAME_AREA_HEIGHT * -1 / 3)
	// }
	// scene.add(winning_text, light1, light2)
	wss.close()
	// game_running = false
}


//GameLoop
function animate() {
	screenShake.update(camera);
	orbitcontrols.update();
	if (winning_text)
		winning_text.lookAt(camera.position)
	render();
	id = requestAnimationFrame( animate );
}

function render(){
	renderer.render( scene, camera );
}

window.addEventListener('unload', function(){
	if (game_running)
		sendMessageToServer({type: 'player_left', player: position})
	resetGame();
})

function handlePageReload()
{
	if (game_running)
		sendMessageToServer({type: 'player_left', player: position})
	if (scene)
		resetGame();
}

window.addEventListener('beforeunload', function(){
	handlePageReload();
})