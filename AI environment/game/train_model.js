import PongAI from './PongAI.js';
import * as constants from './Constants.js';
import { handle_ball_collision_for_nextState } from './NextState.js';

const P1PaddlePositionYindex = 7;
const P1PaddlePositionXindex = 6;
const P2PaddlePositionYindex = 5;
const P2PaddlePositionXindex = 4;
const ballVelocityYIndex = 3;
const ballVelocityXIndex = 2;
const ballPositionYIndex = 1;
const ballPositionXIndex = 0;

function handle_ball_collision_for_train(player1Position, player2Position, ballPosition, ballVelocity, aiPong, isNext)
{
    if (ballPosition.y + constants.BALL_RADIUS > constants.GAME_AREA_HEIGHT)
    {
        ballPosition.y = constants.GAME_AREA_HEIGHT - constants.BALL_RADIUS
        ballVelocity.y *= -1
    }
    if(ballPosition.y - constants.BALL_RADIUS < constants.GAME_AREA_HEIGHT * -1)
    {
        ballPosition.y = constants.GAME_AREA_HEIGHT * -1 + constants.BALL_RADIUS
        ballVelocity.y *= -1
    }
    if (ballVelocity.x < 0)
    {
        if (ballPosition.y <= player1Position.y + constants.PADDLE_HEIGHT / 2 && ballPosition.y >= player1Position.y - constants.PADDLE_HEIGHT / 2 && ballPosition.x > player1Position.x)
        {
            if(ballPosition.x - constants.BALL_RADIUS <= player1Position.x + constants.PADDLE_WIDTH / 2)
            {
                ballVelocity.x *= -1
                var middle_y = player1Position.y
                var difference_in_y = middle_y - ballPosition.y
                var reduction_factor = (constants.PADDLE_HEIGHT / 2) / constants.BALL_SPEED
                var new_y_vel = difference_in_y / reduction_factor
                ballVelocity.y = -1 * new_y_vel
            }
        }
    }
    else
    {
        if (ballPosition.y <= player2Position.y + constants.PADDLE_HEIGHT / 2 && ballPosition.y >= player2Position.y - constants.PADDLE_HEIGHT / 2 && ballPosition.x < player2Position.x)
        {
            if(ballPosition.x + constants.BALL_RADIUS >= player2Position.x - constants.PADDLE_WIDTH / 2)
            {
                ballVelocity.x *= -1
                var middle_y = player2Position.y
                var difference_in_y = middle_y - ballPosition.y
                var reduction_factor = (constants.PADDLE_HEIGHT / 2) / constants.BALL_SPEED
                var new_y_vel = difference_in_y / reduction_factor
                ballVelocity.y = -1 * new_y_vel
                aiPong.reward(2);
            }
        }
    }
}


function getNextState(currentState, P1action, P2action, paddleSpeed) {
    let nextState = [...currentState];

    switch (P1action) {
        case 0:
            nextState[P1PaddlePositionYindex] += paddleSpeed;
            break;
        case 1:
            nextState[P1PaddlePositionYindex] -= paddleSpeed;
            break;
        case 2:
            break;
    }
    switch (P2action) {
        case 0:
            nextState[P2PaddlePositionYindex] += paddleSpeed;
            break;
        case 1:
            nextState[P2PaddlePositionYindex] -= paddleSpeed;
            break;
        case 2:
            break;
    }
    nextState[P1PaddlePositionYindex] = Math.min(Math.max(nextState[P1PaddlePositionYindex], -constants.GAME_AREA_HEIGHT / 2), constants.GAME_AREA_HEIGHT / 2);
    nextState[P2PaddlePositionYindex] = Math.min(Math.max(nextState[P2PaddlePositionYindex], -constants.GAME_AREA_HEIGHT / 2), constants.GAME_AREA_HEIGHT / 2);

    handle_ball_collision_for_nextState(nextState);
    nextState[ballPositionXIndex] += nextState[ballVelocityXIndex];
    nextState[ballPositionYIndex] += nextState[ballVelocityYIndex];
    return nextState;
}

function getCurrentStateTrain(ballPosition, ballVelocity, player1Position, player2Position) {
    const ballPositionX = ballPosition.x;
    const ballPositionY = ballPosition.y;
    const ballVelocityX = ballVelocity.x;
    const ballVelocityY = ballVelocity.y;
    const playerPaddlePositionX = player1Position.x;
    const playerPaddlePositionY = player1Position.y;
	const AiPaddlePositionX = player2Position.x;
	const AiPaddlePositionY = player2Position.y;
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

function handle_scores_for_train(aiPong, ballPosition, player1Position, player2Position)
{
	if (ballPosition.x > constants.GAME_AREA_WIDTH)
		aiPong.reward(-1);
	ballPosition.x = 0
    ballPosition.y = 0
	player1Position.x = (constants.GAME_AREA_WIDTH * -1) + 10
    player1Position.y = 0
	player2Position.x = constants.GAME_AREA_WIDTH - 10
    player2Position.y = 0
}

function checkForRewards(aiPong) {
    // Assurez-vous qu'il y a au moins deux états enregistrés pour la comparaison
    if (aiPong.memory.length >= 2) {
        const lastIndex = aiPong.memory.length - 1;
        const lastState = aiPong.memory[lastIndex].state;
        const secondLastState = aiPong.memory[lastIndex - 1].state;

		if (lastState != secondLastState) {
        	const ballYPosLast = lastState[1];
        	const aiPaddleYPosLast = lastState[7];
        	const ballYPosSecondLast = secondLastState[1];
        	const aiPaddleYPosSecondLast = secondLastState[7];

        	const distanceLast = Math.abs(ballYPosLast - aiPaddleYPosLast);
        	const distanceSecondLast = Math.abs(ballYPosSecondLast - aiPaddleYPosSecondLast);

        	if (distanceLast < distanceSecondLast || (distanceLast == distanceSecondLast && distanceLast <= 10)) {
        	    aiPong.reward(0.5);
        	}
			else if (distanceLast >= distanceSecondLast && distanceLast > 10){
				aiPong.reward(-0.5);
			}
		}

    }
}

function move(up, player)
{
    if (up)
    {
        if ((player.y + constants.PADDLE_HEIGHT / 2) + 1 <= constants.GAME_AREA_HEIGHT)
            player.y += 1;
    }
    else
    {
        if ((player.y - constants.PADDLE_HEIGHT / 2) - 1 > constants.GAME_AREA_HEIGHT * -1)
            player.y -= 1;
    }
}

export async function simulateEpisode(aiPong, ballPosition, ballVelocity, player1Position, player2Position, numberOfActions = 1000) {
    for (let i = 0; i < numberOfActions; i++) {
        // Générez un état aléatoire ou suivez une logique spécifique pour simuler un état de jeu
        const currentState = getCurrentStateTrain(ballPosition, ballVelocity, player1Position, player2Position);
        const action = await aiPong.decideAction(currentState);
        const action2 = Math.floor(Math.random() * 3);
        const nextState = getNextState(currentState, action, action2, constants.PLAYER_SPEED, player1Position, player2Position, ballPosition, ballVelocity);
        aiPong.remember(currentState, action, 0, nextState);
        checkForRewards(aiPong);
        switch(action2) {
            case 0:
                move(true, player1Position);
                break;
            case 1:
                move(false, player1Position);
                break;
            case 2:
                break;
            default:
                console.error("Action non reconnue pour le joueur 1");
        }
        switch(action) {
            case 0:
                move(true, player2Position);
                break;
            case 1:
                move(false, player2Position);
                break;
            case 2:
                break;
            default:
                console.error("Action non reconnue pour le joueur 2");
        }
        handle_ball_collision_for_train(player1Position, player2Position, ballPosition, ballVelocity, aiPong, false);
        ballPosition.x += ballVelocity.x
        ballPosition.y += ballVelocity.y
        if (ballPosition.x < constants.GAME_AREA_WIDTH * -1 || ballPosition.x > constants.GAME_AREA_WIDTH)
		    handle_scores_for_train(aiPong, ballPosition, player1Position, player2Position);
    }
}