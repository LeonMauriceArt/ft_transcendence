import * as constants from './Constants.js';
import { Population } from './NeatJS/population.js';

export class Game {
    constructor() {
        this.ballPosition = { x: 0, y: 0 };
        this.ballVelocity = { x: constants.BALL_SPEED, y: 0 }; 
        this.player1Position = { x: (constants.GAME_AREA_WIDTH * -1) + 10, y: 0 };
        this.player2Position = { x: constants.GAME_AREA_WIDTH - 10, y: 0 };
        this.hits = 0;
        this.score = 0;
        this.malus = 0;
        this.frameCount = 0;
    }

    handleBallCollision() {
        if (this.ballPosition.y + constants.BALL_RADIUS > constants.GAME_AREA_HEIGHT)
        {
            this.ballPosition.y = constants.GAME_AREA_HEIGHT - constants.BALL_RADIUS
            this.ballVelocity.y *= -1
        }
        if(this.ballPosition.y - constants.BALL_RADIUS < constants.GAME_AREA_HEIGHT * -1)
        {
            this.ballPosition.y = constants.GAME_AREA_HEIGHT * -1 + constants.BALL_RADIUS
            this.ballVelocity.y *= -1
        }
        if (this.ballVelocity.x < 0)
        {
            if (this.ballPosition.y <= this.player1Position.y + constants.PADDLE_HEIGHT / 2 && this.ballPosition.y >= this.player1Position.y - constants.PADDLE_HEIGHT / 2 && this.ballPosition.x > this.player1Position.x)
            {
                if(this.ballPosition.x - constants.BALL_RADIUS <= this.player1Position.x + constants.PADDLE_WIDTH / 2)
                {
                    this.ballVelocity.x *= -1
                    var middle_y = this.player1Position.y
                    var difference_in_y = middle_y - this.ballPosition.y
                    var reduction_factor = (constants.PADDLE_HEIGHT / 2) / constants.BALL_SPEED
                    var new_y_vel = difference_in_y / reduction_factor
                    this.ballVelocity.y = -1 * new_y_vel
                }
            }
        }
        else
        {
            if (this.ballPosition.y <= this.player2Position.y + constants.PADDLE_HEIGHT / 2 && this.ballPosition.y >= this.player2Position.y - constants.PADDLE_HEIGHT / 2 && this.ballPosition.x < this.player2Position.x)
            {
                if(this.ballPosition.x + constants.BALL_RADIUS >= this.player2Position.x - constants.PADDLE_WIDTH / 2)
                {
                    this.ballVelocity.x *= -1
                    var middle_y = this.player2Position.y
                    var difference_in_y = middle_y - this.ballPosition.y
                    var reduction_factor = (constants.PADDLE_HEIGHT / 2) / constants.BALL_SPEED
                    var new_y_vel = difference_in_y / reduction_factor
                    this.ballVelocity.y = -1 * new_y_vel
                    this.hits++
                }
            }
        }
    }

    getCurrentState() {
        const ballPositionY = this.ballPosition.y;
        const AiPaddlePositionY = this.player2Position.y;
        const distanceFromAiPaddle = ballPositionY - this.player2Position.y;
    
        const currentState = [
            ballPositionY, 
            AiPaddlePositionY, distanceFromAiPaddle
        ];
        return currentState;
    }

    movePlayer(up, player, fitness) {
        if (up)
        {
            if ((player.y + constants.PADDLE_HEIGHT / 2) + 1 <= constants.GAME_AREA_HEIGHT)
                player.y += 1;
            else
                this.malus += 0.1;
        }
        else
        {
            if ((player.y - constants.PADDLE_HEIGHT / 2) - 1 > constants.GAME_AREA_HEIGHT * -1)
                player.y -= 1;
            else
                this.malus += 0.1;
        }
    }

    simulateEpisode(playerMove = 0, fitness) {
            if (Math.random() < 0.5){
                this.player1Position.y = this.ballPosition.y + 10;
            } else {
                this.player1Position.y = this.ballPosition.y - 10;
            }
            switch(playerMove) {
                case 0:
                    this.movePlayer(true, this.player2Position, fitness);
                    break;
                case 1:
                    this.movePlayer(false, this.player2Position, fitness);
                    break;
                default:
                    console.error("Action non reconnue pour le joueur 2");
            }
            this.handleBallCollision();
            this.ballPosition.x += this.ballVelocity.x
            this.ballPosition.y += this.ballVelocity.y
            if (this.ballPosition.x < constants.GAME_AREA_WIDTH * -1 || this.ballPosition.x > constants.GAME_AREA_WIDTH) {
                if (this.ballPosition.x < constants.GAME_AREA_WIDTH * -1) {
                    this.score += 1;
                }
                else {
                    this.score -= 1;
                }
                this.ballPosition.x = 0
                this.ballPosition.y = 0
                let angle = Math.random() * 90 - 45;
                angle = angle * Math.PI / 180;
                this.ballVelocity.x = Math.cos(angle) * constants.BALL_SPEED;
                this.ballVelocity.y = Math.sin(angle) * constants.BALL_SPEED;
                if (Math.random() < 0.5) {
                    this.ballVelocity.x *= -1;
                }
                
            }
            this.frameCount++;
        }
    }

export var population = new Population(200);

export async function train() {
    console.log("Début de l'entraînement...");
    for (let i = 0; i < constants.TRAINING_SESSIONS; i++) {
        while (!population.done()){
            population.updateAI();
        }
        population.naturalSelection();
    }
    return population.bestPlayer;
}
