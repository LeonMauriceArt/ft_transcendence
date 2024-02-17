import PongAI from './PongAI.js';
import {Player} from './Player.js'
import {Ball} from './Ball.js'
import * as constants from './Constants.js';


move(up, paddlePositionY)
{
    if (up)
    {
        if ((paddlePositionY + PADDLE_HEIGHT / 2) + PLAYER_SPEED <= GAME_AREA_HEIGHT)
            paddlePositionY += PLAYER_SPEED;
    }
    else
    {
        if ((paddlePositionY - PADDLE_HEIGHT / 2) - PLAYER_SPEED > GAME_AREA_HEIGHT * -1)
            paddlePositionY -= PLAYER_SPEED;
    }
}

function getNextState(currentState, action, paddleSpeed) {
    let nextState = [...currentState];

    const aiPaddlePositionYIndex = 7;
    const aiPaddlePositionXIndex = 6;
    const playerPaddlePositionYIndex = 5;
    const playerPaddlePositionXIndex = 4;
    const ballVelocityYIndex = 3;
    const ballVelocityXIndex = 2;
    const ballPositionYIndex = 1;
    const ballPositionXIndex = 0;

    if (action === 0) {
        move(true, nextState[aiPaddlePositionYIndex]);
    } else if (action === 1) {
        move(false, nextState[aiPaddlePositionYIndex]);
    }
    nextState[aiPaddlePositionYIndex] = Math.min(Math.max(nextState[aiPaddlePositionYIndex], -constants.GAME_AREA_HEIGHT / 2), constants.GAME_AREA_HEIGHT / 2);

    return nextState;
}