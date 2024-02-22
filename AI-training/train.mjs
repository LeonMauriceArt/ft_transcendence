import * as constants from './Constants.mjs';
import { Population } from './NeatJS/src/population.mjs';

export class Game {
    constructor() {
        this.ballPosition = { x: 0, y: 0 };
        this.ballVelocity = { x: constants.BALL_SPEED, y: 0 }; 
        this.player1Position = { x: (constants.GAME_AREA_WIDTH * -1) + 10, y: 0 };
        this.player2Position = { x: constants.GAME_AREA_WIDTH - 10, y: 0 };
        this.hits = 0;
        this.score = 0;
        this.malus = 0;
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

    simulateEpisode(playerMove, fitness) {
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
                case 2:
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
                let angle = Math.random() * 90 - 45; // Cela crée un angle entre -45 et +45 degrés

                // Convertir l'angle en radians pour l'utilisation dans Math.sin() et Math.cos()
                angle = angle * Math.PI / 180;

                // Utiliser Math.cos() et Math.sin() pour générer des vélocités x et y basées sur l'angle
                // Vous pouvez ajuster la vitesse de la balle en multipliant par un facteur de vitesse
                this.ballVelocity.x = Math.cos(angle) * constants.BALL_SPEED;
                this.ballVelocity.y = Math.sin(angle) * constants.BALL_SPEED;

                // Inverser aléatoirement la direction horizontale pour permettre à la balle de partir vers la gauche ou la droite
                if (Math.random() < 0.5) {
                    this.ballVelocity.x *= -1;
                }
                
            }
        }
    }


import express from 'express';
import http from 'http';
import { Server as socketIo } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new socketIo(server);

app.use(express.static('public')); // Servir les fichiers statiques depuis le dossier 'public'

function sendGameState() {
    // Extrait les informations depuis l'objet game de bestPlayer
    const { ballPosition, ballVelocity, player1Position, player2Position } = population.bestPlayer.game;
    
    // Crée l'objet gameState
    const gameState = {
        ballPosition: { x: ballPosition.x, y: ballPosition.y },
        ballVelocity: { x: ballVelocity.x, y: ballVelocity.y },
        playerPositions: [
            { x: player1Position.x, y: player1Position.y }, // Position du Joueur 1
            { x: player2Position.x, y: player2Position.y }  // Position du Joueur 2 (IA dans votre cas)
        ]
    };
    
    // Envoie l'état du jeu aux clients connectés
    io.emit('gameState', gameState);
}

function simulateGameStep() {
    if (population.bestPlayer.game.score < 20 && population.bestPlayer.game.score > -20) {
        population.bestPlayer.look();
        population.bestPlayer.think();
        let decisionIndex = population.bestPlayer.decisions.indexOf(Math.max(...population.bestPlayer.decisions));
        population.bestPlayer.game.simulateEpisode(decisionIndex, population.bestPlayer.fitness);
        population.bestPlayer.calculateFitness();
        console.log(population.bestPlayer.fitness);
        sendGameState(); // Assurez-vous que cette fonction envoie l'état actuel aux clients

        setTimeout(simulateGameStep, 25);
    } else {
        // Réinitialiser le score si nécessaire ou effectuer d'autres actions de fin
        population.bestPlayer.game.score = 0;
        console.log("Fin de la simulation");
        // Envoyer un message ou effectuer une action indiquant la fin de la simulation
    }
}

io.on('connection', (socket) => {
    console.log('Un client est connecté');
    console.log('Envoi de l\'état initial du jeu');
    simulateGameStep();
});

server.listen(3000, () => {
    console.log('Serveur écoutant sur port 3000');
});

var population = new Population(150);

async function main() {
    console.log("Début de l'entraînement...");
    for (let i = 0; i < 100; i++) {
        while (!population.done()){
            population.updateAlive();
        }
        population.naturalSelection();
    }
    //test the best player
    console.log(population.bestPlayer.game.hits);
}

main().catch(console.error);