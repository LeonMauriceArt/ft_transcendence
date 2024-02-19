import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { createTextMesh } from './Text.js';
import {Player} from './Player.js'
import {Ball} from './Ball.js'
import * as constants from './Constants.js';
import PongAI from './PongAI.js';
import { getNextState } from './NextState.js';

var camera, renderer, player_one, 
player_two, ball, scene, 
player_one_score_text, player_two_score_text, droidFont;

let currentStateForAI = [];

const keys = {};
const pongAI1 = new PongAI();
const pongAI2 = new PongAI();

const fontlLoader = new FontLoader();
fontlLoader.load('../node_modules/three/examples/fonts/droid/droid_serif_regular.typeface.json',
function (loadedFont){
	droidFont = loadedFont;
	init()
	initArena()
	initControls()
	updateCurrentStateForAI()
	animate()
});

async function saveModel(model) {
    await model.save('downloads://pong-model');
    console.log('Modèle sauvegardé localement.');
}

function saveMemory(memory) {
    const memoryString = JSON.stringify(memory);
    const blob = new Blob([memoryString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'memory.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    console.log('Mémoire sauvegardée localement.');
}

async function loadModelFromFile(event, aiInstance) {
    const file = event.target.files[0];
    if (file) {
        const model = await tf.loadLayersModel(URL.createObjectURL(file));
        aiInstance.model = model;
        console.log("Modèle chargé avec succès.");
    }
	else
		console.log("Aucun fichier")
}

function loadMemoryFromFile(event, aiInstance) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const memory = JSON.parse(e.target.result);
            aiInstance.memory = memory;
            console.log("Mémoire chargée avec succès.");
        };
        reader.readAsText(file);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("saveModelButton1").addEventListener("click", function() {
        saveModel(pongAI1.model);
    });

    document.getElementById("saveModelButton2").addEventListener("click", function() {
        saveModel(pongAI2.model);
    });

	document.getElementById("saveMemory1").addEventListener("click", function() {
        saveMemory(pongAI1.memory);
    });

	document.getElementById("saveMemory2").addEventListener("click", function() {
        saveMemory(pongAI2.memory);
    });

	document.getElementById("loadModelButton1").addEventListener("click", function() {
        document.getElementById("loadModel1").click();
    });

    document.getElementById("loadModelButton2").addEventListener("click", function() {
        document.getElementById("loadModel2").click();
    });

    document.getElementById("loadMemoryButton1").addEventListener("click", function() {
        document.getElementById("loadMemory1").click();
    });

    document.getElementById("loadMemoryButton2").addEventListener("click", function() {
        document.getElementById("loadMemory2").click();
    });

    document.getElementById("loadModel1").addEventListener("change", function(event) {
        loadModelFromFile(event, pongAI1);
    });

    document.getElementById("loadModel2").addEventListener("change", function(event) {
        loadModelFromFile(event, pongAI2);
    });

    document.getElementById("loadMemory1").addEventListener("change", function(event) {
        loadMemoryFromFile(event, pongAI1);
    });

    document.getElementById("loadMemory2").addEventListener("change", function(event) {
        loadMemoryFromFile(event, pongAI2);
    });
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
		pongAI2.reward(-500);
		scene.remove(player_one_score_text)
		player_one_score_text = createTextMesh(droidFont, player_one.score.toString(), player_one_score_text, (constants.GAME_AREA_WIDTH / 2) * -1, 0,-80, 0xf0f0f0, 10);
		scene.add(player_one_score_text)
	}
	else
	{
		player_two.score_point()
		pongAI1.reward(-500);
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

function sample(memory, batchSize) {
    const sampled = [];
    if (memory.length <= batchSize) {
        return memory; // Retourne toute la mémoire si elle est plus petite que la taille de batch désirée
    } else {
        const indices = new Set(); // Utiliser un Set pour éviter les doublons
        while (indices.size < batchSize) {
            const randomIndex = Math.floor(Math.random() * memory.length);
            indices.add(randomIndex);
        }
        indices.forEach(index => {
            sampled.push(memory[index]);
        });
        return sampled;
    }
}

async function trainModel(aiPong, discountRate = 0.95) {
    if (aiPong.memory.length === 0) {
        return;
    }
	aiPong.updateEpsilon();
	aiPong.displayMemory();
	const miniBatch = sample(aiPong.memory, 64);
	console.log(miniBatch.length);
    const statesTensor = tf.tensor2d(miniBatch.map(item => item.state));
    const actionsTensor = tf.tensor1d(miniBatch.map(item => item.action), 'int32');
    const rewardsTensor = tf.tensor1d(miniBatch.map(item => item.reward));
    const nextStatesTensor = tf.tensor2d(miniBatch.map(item => item.nextState));


	const currentQValues = aiPong.model.predict(statesTensor);
    const nextQValues = aiPong.model.predict(nextStatesTensor);
    const maxNextQValues = nextQValues.max(1).arraySync();
    const qTargets = currentQValues.clone();
    for (let i = 0; i < actionsTensor.shape[0]; i++) {
        const actionIndex = actionsTensor.arraySync()[i];
        const reward = rewardsTensor.arraySync()[i];
        const maxNextQValue = maxNextQValues[i];
        const updatedQValue = reward + discountRate * maxNextQValue;
        qTargets.bufferSync().set(updatedQValue, i, actionIndex);
    }

    await aiPong.model.fit(statesTensor, qTargets, {
        epochs: 25,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                console.log(`Époque ${epoch}: perte = ${logs.loss}`);
            }
        }
    });

    statesTensor.dispose();
    actionsTensor.dispose();
    rewardsTensor.dispose();
    nextStatesTensor.dispose();
    nextQValues.dispose();
    qTargets.dispose();
//	saveMemory(aiPong.memory);
//	saveModel(aiPong.model);
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
	trainModel(pongAI1);
	trainModel(pongAI2);
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
	const nextState = [];

    const currentState = [
        ballPositionX, ballPositionY, 
        ballVelocityX, ballVelocityY, 
        playerPaddlePositionX, playerPaddlePositionY,
		AiPaddlePositionX, AiPaddlePositionY,
		nextState
    ];
    return currentState;
}


function updateCurrentStateForAI() {
    setInterval(() => {
        currentStateForAI = getCurrentState(ball, player_one, player_two);
    }, 1000);
}

async function decideAndApplyAction(aiPaddle, aiPong) {
    const now = Date.now();

    // Utilisez la propriété lastDecisionTime de l'instance de PongAI
    if (now - aiPong.lastDecisionTime >= 1000 && currentStateForAI.length > 0) {
        aiPong.lastDecisionTime = now;	
        aiPong.decideAction(currentStateForAI).then(action => {
			aiPong.currentAction = action;
			var nextState = [];
			if(aiPong === pongAI1)
				nextState = getNextState(currentStateForAI, action, pongAI2.currentAction, constants.PLAYER_SPEED);
			else if (aiPong === pongAI2)
				nextState = getNextState(currentStateForAI, action,  pongAI1.currentAction, constants.PLAYER_SPEED);
            aiPong.remember(currentStateForAI, action, 0, nextState);
            checkForRewards(aiPong);
        }).catch(error => {
            console.error("Erreur lors de la décision de l'action:", error);
        });
    }
}

function checkForRewards(aiPong) {
    // Assurez-vous qu'il y a au moins deux états enregistrés pour la comparaison
    if (aiPong.memory.length >= 2) {
        const lastIndex = aiPong.memory.length - 1;
        const lastState = aiPong.memory[lastIndex].state;
        const secondLastState = aiPong.memory[lastIndex - 1].state;
		const lastAction = aiPong.memory[lastIndex].action; // Supposons que l'action est stockée ici

        // Utiliser les indices basés sur la structure de lastState
        const aiPaddleYPosLast = lastState[7];

		if ((aiPaddleYPosLast >= 40 && lastAction === 0) || (aiPaddleYPosLast <= -39 && lastAction === 1)) {
            aiPong.reward(-500);
        }

		if (lastState != secondLastState) {
        	const ballYPosLast = lastState[1];
        	const aiPaddleYPosLast = lastState[7];
        	const ballYPosSecondLast = secondLastState[1];
        	const aiPaddleYPosSecondLast = secondLastState[7];

        	const distanceLast = Math.abs(ballYPosLast - aiPaddleYPosLast);
        	const distanceSecondLast = Math.abs(ballYPosSecondLast - aiPaddleYPosSecondLast);

        	if (distanceLast < distanceSecondLast || (distanceLast == distanceSecondLast && distanceLast <= 10)) {
        	    aiPong.reward(500);
        	}
			else if (distanceLast >= distanceSecondLast && distanceLast > 10){
				aiPong.reward(-500);
			}
		}

    }
}

//GameLoop
function animate() {
	
	requestAnimationFrame( animate );
	switch(pongAI1.currentAction) {
		case 0:
			player_one.move(true);
			break;
		case 1:
			player_one.move(false);
			break;
		case 2:
			break;
		default:
			console.error("Action non reconnue pour le joueur 1");
	}
	switch(pongAI2.currentAction) {
		case 0:
			player_two.move(true);
			break;
		case 1:
			player_two.move(false);
			break;
		case 2:
			break;
		default:
			console.error("Action non reconnue pour le joueur 2");
	}
	ball.update(player_one, player_two, pongAI1, pongAI2);
	if (ball.mesh.position.x < constants.GAME_AREA_WIDTH * -1 || ball.mesh.position.x > constants.GAME_AREA_WIDTH)
		handle_scores()
	decideAndApplyAction(player_two, pongAI2);
	decideAndApplyAction(player_one, pongAI1);
	render();
}

function render(){

	renderer.render( scene, camera );
}