import * as constants from './Constants.js';

const P1PaddlePositionYindex = 7;
const P1PaddlePositionXindex = 6;
const P2PaddlePositionYindex = 5;
const P2PaddlePositionXindex = 4;
const ballVelocityYIndex = 3;
const ballVelocityXIndex = 2;
const ballPositionYIndex = 1;
const ballPositionXIndex = 0;

export function handle_ball_collision_for_nextState(nextState)
{
    if (nextState[ballPositionYIndex] + constants.BALL_RADIUS > constants.GAME_AREA_HEIGHT)
    {
        nextState[ballPositionYIndex] = constants.GAME_AREA_HEIGHT - constants.BALL_RADIUS
        nextState[ballVelocityYIndex] *= -1
    }
    if(nextState[ballPositionYIndex] - constants.BALL_RADIUS < constants.GAME_AREA_HEIGHT * -1)
    {
        nextState[ballPositionYIndex] = constants.GAME_AREA_HEIGHT * -1 + constants.BALL_RADIUS
        nextState[ballVelocityYIndex] *= -1
    }
    if (nextState[ballVelocityXIndex] < 0)
    {
        if (nextState[ballPositionYIndex] <= nextState[P1PaddlePositionYindex] + constants.PADDLE_HEIGHT / 2 && nextState[ballPositionYIndex] >= nextState[P1PaddlePositionYindex] - constants.PADDLE_HEIGHT / 2 && nextState[ballPositionXIndex] > nextState[P1PaddlePositionXindex])
        {
            if(nextState[ballPositionXIndex] - constants.BALL_RADIUS <= nextState[P1PaddlePositionXindex] + constants.PADDLE_WIDTH / 2)
            {
                nextState[ballVelocityXIndex] *= -1
                var middle_y = nextState[P1PaddlePositionYindex]
                var difference_in_y = middle_y - nextState[ballPositionYIndex]
                var reduction_factor = (constants.PADDLE_HEIGHT / 2) / constants.BALL_SPEED
                var new_y_vel = difference_in_y / reduction_factor
                nextState[ballVelocityYIndex] = -1 * new_y_vel
            }
        }
    }
    else
    {
        if (nextState[ballPositionYIndex] <= nextState[P2PaddlePositionYindex] + constants.PADDLE_HEIGHT / 2 && nextState[ballPositionYIndex] >= nextState[P2PaddlePositionYindex] - constants.PADDLE_HEIGHT / 2 && nextState[ballPositionXIndex] <nextState[P2PaddlePositionXindex])
        {
            if(nextState[ballPositionXIndex] + constants.BALL_RADIUS >= nextState[P2PaddlePositionXindex] - constants.PADDLE_WIDTH / 2)
            {
                nextState[ballVelocityXIndex] *= -1
                var middle_y = nextState[P2PaddlePositionYindex]
                var difference_in_y = middle_y - nextState[ballPositionYIndex]
                var reduction_factor = (constants.PADDLE_HEIGHT / 2) / constants.BALL_SPEED
                var new_y_vel = difference_in_y / reduction_factor
                nextState[ballVelocityYIndex] = -1 * new_y_vel
            }
        }
    }
}


export function getNextState(currentState, P1action, P2action, paddleSpeed) {
    let nextState = [...currentState];

    handle_ball_collision_for_nextState(nextState);
    const movementAmount = paddleSpeed * 5;
    switch (P1action) {
        case 0:
            nextState[P1PaddlePositionYindex] += movementAmount;
            break;
        case 1:
            nextState[P1PaddlePositionYindex] -= movementAmount;
            break;
        case 2:
            break;
    }
    switch (P2action) {
        case 0:
            nextState[P2PaddlePositionYindex] += movementAmount;
            break;
        case 1:
            nextState[P2PaddlePositionYindex] -= movementAmount;
            break;
        case 2:
            break;
    }
    nextState[P1PaddlePositionYindex] = Math.min(Math.max(nextState[P1PaddlePositionYindex], -constants.GAME_AREA_HEIGHT / 2), constants.GAME_AREA_HEIGHT / 2);
    nextState[P2PaddlePositionYindex] = Math.min(Math.max(nextState[P2PaddlePositionYindex], -constants.GAME_AREA_HEIGHT / 2), constants.GAME_AREA_HEIGHT / 2);

    nextState[ballPositionXIndex] += nextState[ballVelocityXIndex] * 5;
    nextState[ballPositionYIndex] += nextState[ballVelocityYIndex] * 5;
    handle_ball_collision_for_nextState(nextState);
    return nextState;
}