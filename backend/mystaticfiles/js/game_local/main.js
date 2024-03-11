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
// powerup_manager

const keys = {};

const playerOneWonEvent = {
	player: 'player_one'
}

const playerTwoWonEvent = {
	player: 'player_two'
}

const playerOneWon = new CustomEvent('playerOneWon', {detail: playerOneWonEvent});
const playerTwoWon = new CustomEvent('playerTwoWon', {detail: playerTwoWonEvent});

var screenShake = ScreenShake()

game_running = false

const fontlLoader = new FontLoader();
fontlLoader.load(droid,
function (loadedFont){
	droidFont = loadedFont;
});

function handleKeyDown(event) {
	keys[event.code] = true;
}

function handleKeyUp(event) {
	keys[event.code] = false;
}

var id = null;

export function start()
{
	if (id !==null)
		cancelAnimationFrame(id);
	initGame();
	animate();
}

export function resetLocalGame()
{
	resetArena()
}

function initGame()
{
	//Renderer
	renderer = new THREE.WebGLRenderer({alpha: false, antialias: false});
	renderer.setPixelRatio(devicePixelRatio / 2);
	
	var container = document.getElementById('canvas');
	var w = container.offsetWidth;
	var h = container.offsetHeight;
	renderer.setSize(w, h);
	container.appendChild(renderer.domElement);
	
	//Init Scene
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x00000, 5, 300 );
	
	//Camera
	camera = new THREE.PerspectiveCamera(
		45, 
		constants.WIN_WIDTH / constants.WIN_HEIGHT,
		0.1,
		1000
		);
		camera.position.z = constants.CAMERA_STARTPOS_Z
		
	initArena()
	initControls()
}

function delete_scene_objs(){
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
	delete(player_one, player_two, ball),
	player_one, 
	player_two, ball, 
	player_one_score_text, player_two_score_text, winning_text,
	player_one_goal, player_two_goal = undefined
	
}

function initArena()
{
	//Adding players
	player_one = new Player((constants.GAME_AREA_WIDTH * -1) + 10, 0, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT,constants.PLAYER_1_COLOR)
	player_two = new Player(constants.GAME_AREA_WIDTH - 10, 0, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.PLAYER_2_COLOR)
	scene.add(player_one.mesh, player_two.mesh)

	//Adding the ball
	ball = new Ball()
	scene.add(ball.mesh, ball.light)

	//Adding the powerup_manager
	// powerup_manager = new Power_Manager()

	//Adding the floor and roof
	var upper_wall = new Wall(constants.GAME_AREA_HEIGHT, 300, material.wallMaterial)
	var lower_wall = new Wall(constants.GAME_AREA_HEIGHT * -1, 300, material.wallMaterial)
	scene.add(upper_wall.mesh, lower_wall.mesh)
	
	//Creating and adding the two player goals
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

	//Initiating the score text meshes
	player_one_score_text = createTextMesh(droidFont, player_one.score.toString(), player_one_score_text, (constants.GAME_AREA_WIDTH / 2) * -1, 0,-80, constants.PLAYER_1_COLOR, 50);
	player_two_score_text = createTextMesh(droidFont, player_two.score.toString(), player_two_score_text, constants.GAME_AREA_WIDTH / 2, 0,-80, constants.PLAYER_2_COLOR, 50);
	scene.add(player_one_score_text, player_two_score_text)
}

function resetArena()
{
	delete_scene_objs()
	initArena();
	camera.position.set(0, 0, constants.CAMERA_STARTPOS_Z)
}

function initControls(){
	//Controls
	orbitcontrols = new OrbitControls( camera, renderer.domElement );
	orbitcontrols.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	orbitcontrols.dampingFactor = 0.05;
	orbitcontrols.enabled = false
	orbitcontrols.screenSpacePanning = true;
	window.addEventListener('keydown', handleKeyDown);
	window.addEventListener('keyup', handleKeyUp);
}

function handle_scores()
{
	if (ball.mesh.position.x > constants.GAME_AREA_WIDTH)
	{
		screenShake.shake( camera, new THREE.Vector3(-5, -5, 20), constants.BALL_RESPAWN_TIME * 1000/* ms */ );
		player_one.score_point()
		scene.remove(player_one_score_text)
		player_one_score_text = createTextMesh(droidFont, player_one.score.toString(), player_one_score_text, (constants.GAME_AREA_WIDTH / 2) * -1, 0,-80, constants.PLAYER_1_COLOR, 50);
		scene.add(player_one_score_text)
	}
	else
	{
		screenShake.shake( camera, new THREE.Vector3(5, 5, 20), constants.BALL_RESPAWN_TIME * 1000 /* ms */ );
		player_two.score_point()
		scene.remove(player_two_score_text)
		player_two_score_text = createTextMesh(droidFont, player_two.score.toString(), player_two_score_text, constants.GAME_AREA_WIDTH / 2, 0,-80, constants.PLAYER_2_COLOR, 50);
		scene.add(player_two_score_text)
	}
	ball.reset()
	player_one.reset()
	player_two.reset()
	if (player_one.score == constants.WINNING_SCORE || player_two.score == constants.WINNING_SCORE)
		winning()
}

function winning()
{
	orbitcontrols.autoRotate = true;
	ball.stop();
	scene.remove(player_one_score_text)
	scene.remove(player_two_score_text)
	var light1;
	var light2;
	if (player_one.score == constants.WINNING_SCORE)
	{
		window.dispatchEvent(playerOneWon);
		winning_text = createTextMesh(droidFont, "PLAYER 1 WIN", player_one_score_text, 0, 0, 0, 0xffffff, 13)
		winning_text.material.emissiveIntensity = 0.5
		light1 = new THREE.PointLight(constants.PLAYER_1_COLOR, 20000, 300);
		light1.position.set(constants.GAME_AREA_WIDTH / 3, constants.GAME_AREA_HEIGHT / 3)
		light2 = new THREE.PointLight(constants.PLAYER_1_COLOR, 20000, 300);
		light2.position.set(constants.GAME_AREA_WIDTH * -1 / 3, constants.GAME_AREA_HEIGHT * -1 / 3)
	}
	else
	{
		window.dispatchEvent(playerTwoWon);
		winning_text = createTextMesh(droidFont, "PLAYER 2 WIN", player_two_score_text, 0, 0, 0, 0xffffff, 13)
		winning_text.material.emissiveIntensity = 0.5
		light1 = new THREE.PointLight(constants.PLAYER_2_COLOR, 20000, 300);
		light1.position.set(constants.GAME_AREA_WIDTH / 3, constants.GAME_AREA_HEIGHT / 3)
		light2 = new THREE.PointLight(constants.PLAYER_2_COLOR, 20000, 300);
		light2.position.set(constants.GAME_AREA_WIDTH * -1 / 3, constants.GAME_AREA_HEIGHT * -1 / 3)
	}
	scene.add(winning_text, light1, light2)
	game_running = true
}

function handle_input(player_one, player_two)
{
	if (keys['ArrowUp'])
		player_two.move(true);
	if (keys['ArrowDown'])
		player_two.move(false);
	if (keys['KeyW'])
		player_one.move(true);
	if (keys['KeyS'])
		player_one.move(false);
}

//GameLoop
function animate() {
	
	screenShake.update(camera);
	orbitcontrols.update();
	
	if (!game_running)
	{
		// powerup_manager.update(player_one, player_two, ball, scene)
		ball.update(player_one, player_two);
		if (ball.mesh.position.x < constants.GAME_AREA_WIDTH * -1 || ball.mesh.position.x > constants.GAME_AREA_WIDTH)
		handle_scores()
		handle_input(player_one, player_two);
	}
	else
	{
		winning_text.lookAt(camera.position)
		scene.remove(player_one.mesh, player_two.mesh, player_one_goal, player_two_goal)
	}
	render();
	id = requestAnimationFrame( animate );
}

function render(){

	renderer.render( scene, camera );

}
