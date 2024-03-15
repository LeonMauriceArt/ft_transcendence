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

var game_running, camera, orbitcontrols, renderer, player_one,
player_two, ball, scene,
player_one_score_text, player_two_score_text, droidFont, winning_text,
player_one_goal, player_two_goal
var firstLaunch = true
let container

const keys = {};
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
	if (firstLaunch)
	{
		initDisplay();
		firstLaunch = false;		
	}
	else
	{
		resetLocalGame();
	}
	if (id !==null)
		cancelAnimationFrame(id);
	animate();
}

export function resetLocalGame()
{
	resetArena()
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

function resetArena()
{
	delete_scene_objs()
	initArena();
	camera.position.set(0, 0, constants.CAMERA_STARTPOS_Z)
}


function initDisplay()
{
	renderer = new THREE.WebGLRenderer({alpha: false, antialias: false});
	renderer.setPixelRatio(devicePixelRatio / 2);
	
	container = document.createElement('div');
	
	container.id = 'canvas';
	container.style.width = '800px';
    container.style.height = '600px';
    container.style.imageRendering = 'pixelated';
    container.style.boxSizing = 'border-box';
    container.style.border = '2px solid grey';
	container.style.display = 'inline-block'
	
	document.body.appendChild(container);
	var w = container.offsetWidth;
	var h = container.offsetHeight;
	renderer.setSize(w, h);
	container.appendChild(renderer.domElement);

	initArena()
	initControls()
}

function initArena()
{
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x00000, 5, 300 );
	
	camera = new THREE.PerspectiveCamera(
		45, 
		constants.WIN_WIDTH / constants.WIN_HEIGHT,
		0.1,
		1000
		);
		camera.position.z = constants.CAMERA_STARTPOS_Z
	player_one = new Player((constants.GAME_AREA_WIDTH * -1) + 10, 0, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT,constants.PLAYER_1_COLOR)
	player_two = new Player(constants.GAME_AREA_WIDTH - 10, 0, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, constants.PLAYER_2_COLOR)
	scene.add(player_one.mesh, player_two.mesh)

	ball = new Ball()
	scene.add(ball.mesh, ball.light)

	orbitcontrols = new OrbitControls( camera, renderer.domElement );
	orbitcontrols.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
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

	//Initiating the score text meshes
	player_one_score_text = createTextMesh(droidFont, player_one.score.toString(), player_one_score_text, (constants.GAME_AREA_WIDTH / 2) * -1, 0,-80, constants.PLAYER_1_COLOR, 50);
	player_two_score_text = createTextMesh(droidFont, player_two.score.toString(), player_two_score_text, constants.GAME_AREA_WIDTH / 2, 0,-80, constants.PLAYER_2_COLOR, 50);
	scene.add(player_one_score_text, player_two_score_text)
}


function initControls(){
	//Controls

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
		winning_text = createTextMesh(droidFont, "PLAYER 1 WIN", player_one_score_text, 0, 0, 0, 0xffffff, 13)
		winning_text.material.emissiveIntensity = 0.5
		light1 = new THREE.PointLight(constants.PLAYER_1_COLOR, 20000, 300);
		light1.position.set(constants.GAME_AREA_WIDTH / 3, constants.GAME_AREA_HEIGHT / 3)
		light2 = new THREE.PointLight(constants.PLAYER_1_COLOR, 20000, 300);
		light2.position.set(constants.GAME_AREA_WIDTH * -1 / 3, constants.GAME_AREA_HEIGHT * -1 / 3)
	}
	else
	{
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
let lastAImove = 2;

function farestPointFromOpponent(oppenentPosition){
    if (oppenentPosition.y > 0)
        return -constants.GAME_AREA_HEIGHT + constants.BALL_RADIUS; 
    else if (oppenentPosition.y < 0)
        return constants.GAME_AREA_HEIGHT - constants.BALL_RADIUS; 
	else
		return constants.GAME_AREA_HEIGHT - constants.BALL_RADIUS; 

}


function newVelToReachPoint(farestPointFromOpponent, projectedPosition) {
	let time = constants.GAME_AREA_WIDTH / constants.BALL_SPEED
	let new_y_vel = (farestPointFromOpponent - projectedPosition.y) / time
	console.log("new_y_vel", new_y_vel)
	return new_y_vel
}

function calculateDesiredPaddleY(projectedBallY, new_y_vel) {
    var reduction_factor = (constants.PADDLE_HEIGHT / 2) / constants.BALL_SPEED;
	var desiredPaddleY = projectedBallY - (new_y_vel * reduction_factor);

	if (desiredPaddleY > (constants.GAME_AREA_HEIGHT - constants.PADDLE_HEIGHT / 2) || desiredPaddleY < ((constants.GAME_AREA_HEIGHT * -1) + constants.PADDLE_HEIGHT / 2)){
		if (desiredPaddleY > (constants.GAME_AREA_HEIGHT - constants.PADDLE_HEIGHT / 2))
			desiredPaddleY = constants.GAME_AREA_HEIGHT - constants.PADDLE_HEIGHT / 2
		else
			desiredPaddleY = ((constants.GAME_AREA_HEIGHT * -1) + constants.PADDLE_HEIGHT / 2)
	}
    return desiredPaddleY;
}

function predictPaddlePosition()
{
	let projectedPosition = {x : ball.mesh.position.x, y : ball.mesh.position.y};
	let velocity = { x: ball.x_vel, y: ball.y_vel };
	let oppenentPosition = player_one.mesh.position;
	while(projectedPosition.x < (constants.GAME_AREA_WIDTH - 10)) {
		projectedPosition.y += velocity.y;
		projectedPosition.x += velocity.x;
		if (projectedPosition.y + constants.BALL_RADIUS > constants.GAME_AREA_HEIGHT)
		{
			projectedPosition.y = constants.GAME_AREA_HEIGHT - constants.BALL_RADIUS
			velocity.y *= -1
		}
		if(projectedPosition.y - constants.BALL_RADIUS < constants.GAME_AREA_HEIGHT * -1)
		{
			projectedPosition.y = constants.GAME_AREA_HEIGHT * -1 + constants.BALL_RADIUS
			velocity.y *= -1
		}
	}
	let farestPoint = farestPointFromOpponent(oppenentPosition)
	let paddlePrediction = {x: player_one.mesh.position.x, y: calculateDesiredPaddleY(projectedPosition.y, newVelToReachPoint(farestPoint, projectedPosition))};
	return paddlePrediction;
}

function AIplayer1(player_two, projectedPosition)
{
	const projectedPaddlePosition = projectedPosition.y;
	const AiPaddlePositionY = player_two.mesh.position.y;
	const distanceFromAiPaddle = projectedPaddlePosition - AiPaddlePositionY;

	if(Math.abs(distanceFromAiPaddle) == 0) {
		lastAImove = 2;
	}
    else if (distanceFromAiPaddle > 0) {
        lastAImove = 0;
    } else {
        lastAImove = 1;
    }
}

let predictedPaddlePosition = null

function handle_input(player_one, player_two)
{
	if (ball.shouldPredict == true){
		predictedPaddlePosition = predictPaddlePosition();
		ball.shouldPredict = false
	}
	if (predictedPaddlePosition)
		AIplayer1(player_two, predictedPaddlePosition)
	switch(lastAImove) {
		case 0:
			player_two.move(true);
			break;
		case 1:
			player_two.move(false);
			break;
		case 2:
			break;
		default:
			console.error("Action non reconnue pour le joueur 1");
	}
	if (keys['KeyW'])
		player_one.move(true);
	if (keys['KeyS'])
		player_one.move(false);
}

//GameLoop
function animate() {

	screenShake.update(camera);
	orbitcontrols.update();

	if (winning_text)
		winning_text.lookAt(camera.position)
	if (!game_running)
	{
		ball.update(player_one, player_two);
		if (ball.mesh.position.x < constants.GAME_AREA_WIDTH * -1 || ball.mesh.position.x > constants.GAME_AREA_WIDTH)
			handle_scores()
		handle_input(player_one, player_two);
	}
	else
	{
		scene.remove(player_one.mesh, player_two.mesh, player_one_goal, player_two_goal)
		game_running = false
	}
	render();
	id = requestAnimationFrame( animate );
}

function render(){

	renderer.render( scene, camera );

}

function removeContainer(container) {
    if (container && container.parentNode) {
        container.parentNode.removeChild(container);
    }
}

window.addEventListener('page_change', function(event) {

	removeContainer(container)
	firstLaunch = true
});