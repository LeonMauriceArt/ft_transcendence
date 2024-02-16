import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { createTextMesh } from './Text.js';
import {Player} from './Player.js'
import {Ball} from './Ball.js'
import * as constants from './Constants.js';
import PongAI from './PongAI.js';

var camera, renderer, player_one, 
player_two, ball, scene, 
player_one_score_text, player_two_score_text, droidFont;

let currentStateForAI = [];

const keys = {};
const pongAI = new PongAI();
const fontlLoader = new FontLoader();
fontlLoader.load('../node_modules/three/examples/fonts/droid/droid_serif_regular.typeface.json',
function (loadedFont){
	droidFont = loadedFont;
	init()
	initArena()
	initControls()
	getCurrentStatePeriodically()
	updateCurrentStateForAI()
	animate()
});

function handleKeyDown(event) {
	keys[event.code] = true;
}

function handleKeyUp(event) {
	keys[event.code] = false;
}

function init()
{
	//Renderer
	renderer = new THREE.WebGLRenderer({alpha: false, antialias: false});
	renderer.setPixelRatio(devicePixelRatio / 2);
	renderer.setSize(constants.WIN_WIDTH, constants.WIN_HEIGHT);
	
	document.body.appendChild(renderer.domElement);
	
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
}

function initArena()
{
	//Adding players
	player_one = new Player((constants.GAME_AREA_WIDTH * -1) + 10, 0, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, 0xffffff)
	player_two = new Player(constants.GAME_AREA_WIDTH - 10, 0, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT, 0xffffff)
	scene.add(player_one.mesh, player_two.mesh)

	//Adding the ball
	ball = new Ball()
	scene.add(ball.mesh)
	
	//Creating and adding the two player goals
	var player_one_goal = new THREE.Mesh(new THREE.PlaneGeometry(20, constants.GAME_AREA_HEIGHT * 2, 1, 4))
	player_one_goal.rotation.y = Math.PI / 2
	player_one_goal.position.x = constants.GAME_AREA_WIDTH * -1
	var player_two_goal = new THREE.Mesh(new THREE.PlaneGeometry(20, constants.GAME_AREA_HEIGHT * 2, 1, 4))
	player_two_goal.rotation.y = (Math.PI / 2) * -1
	player_two_goal.position.x = constants.GAME_AREA_WIDTH
	scene.add(player_one_goal, player_two_goal)

	//Initiating the score text meshes
	player_one_score_text = createTextMesh(droidFont, player_one.score.toString(), player_one_score_text, (constants.GAME_AREA_WIDTH / 2) * -1, 0,-80, 0xf0f0f0, 10);
	player_two_score_text = createTextMesh(droidFont, player_two.score.toString(), player_two_score_text, constants.GAME_AREA_WIDTH / 2, 0,-80, 0xf0f0f0, 10);
	scene.add(player_one_score_text, player_two_score_text)
}

function initControls(){
	window.addEventListener('keydown', handleKeyDown);
	window.addEventListener('keyup', handleKeyUp);
}

function handle_scores()
{
	if (ball.mesh.position.x > constants.GAME_AREA_WIDTH)
	{
		player_one.score_point()
		scene.remove(player_one_score_text)
		player_one_score_text = createTextMesh(droidFont, player_one.score.toString(), player_one_score_text, (constants.GAME_AREA_WIDTH / 2) * -1, 0,-80, 0xf0f0f0, 10);
		scene.add(player_one_score_text)
	}
	else
	{
		player_two.score_point()
		scene.remove(player_two_score_text)
		player_two_score_text = createTextMesh(droidFont, player_two.score.toString(), player_two_score_text, constants.GAME_AREA_WIDTH / 2, 0,-80, 0xf0f0f0, 10);
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
	ball.reset()
	player_one.score = 0
	player_two.score = 0
	scene.remove(player_two_score_text)
	player_two_score_text = createTextMesh(droidFont, player_two.score.toString(), player_two_score_text, constants.GAME_AREA_WIDTH / 2, 0,-80, 0xf0f0f0, 10);
	scene.add(player_two_score_text)
	scene.remove(player_one_score_text)
	player_one_score_text = createTextMesh(droidFont, player_one.score.toString(), player_one_score_text, (constants.GAME_AREA_WIDTH / 2) * -1, 0,-80, 0xf0f0f0, 10);
	scene.add(player_one_score_text)
	player_one.reset()
	player_two.reset()
}

function getCurrentStatePeriodically() {
    setInterval(() => {
        const currentState = getCurrentState(ball, player_one, player_two);
        console.log(currentState);
    }, 2000);
}

function getCurrentState(ball, playerPaddle, AiPaddle) {
    // Extrait les informations de la balle
    const ballPositionX = ball.mesh.position.x;
    const ballPositionY = ball.mesh.position.y;
    const ballVelocityX = ball.x_vel;
    const ballVelocityY = ball.y_vel;
    const playerPaddlePositionX = playerPaddle.mesh.position.x;
    const playerPaddlePositionY = playerPaddle.mesh.position.y;
	const AiPaddlePositionX = AiPaddle.mesh.position.x;
	const AiPaddlePositionY = AiPaddle.mesh.position.y;

    const currentState = [
        ballPositionX, ballPositionY, 
        ballVelocityX, ballVelocityY, 
        playerPaddlePositionX, playerPaddlePositionY,
		AiPaddlePositionX, AiPaddlePositionY
    ];
    return currentState;
}

function updateCurrentStateForAI() {
    setInterval(() => {
        currentStateForAI = getCurrentState(ball, player_one, player_two);
    }, 1000);
}

async function decideAndApplyAction() {
    if (currentStateForAI.length > 0) {
        pongAI.decideAction(currentStateForAI).then(action => {
            console.log("Action décidée par l'IA:", action);
        }).catch(error => {
            console.error("Erreur lors de la décision de l'action:", error);
        });
    }
}
//GameLoop
function animate() {
	
	requestAnimationFrame( animate );

	ball.update(player_one, player_two);
	if (ball.mesh.position.x < constants.GAME_AREA_WIDTH * -1 || ball.mesh.position.x > constants.GAME_AREA_WIDTH)
		handle_scores()
	if (keys['ArrowUp']) {
		player_two.move(true);
	}
	if (keys['ArrowDown']) {
		player_two.move(false);
	}
	if (keys['KeyW']) {
		player_one.move(true);
	}
	if (keys['KeyS']) {
		player_one.move(false);
	}
	decideAndApplyAction();
	render();
}

function render(){

	renderer.render( scene, camera );
}