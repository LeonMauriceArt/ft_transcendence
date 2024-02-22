import {Genome} from './genome.js';
import { Game } from '../train.js';

let genomeInputsN = 3;
let genomeOutputN = 2;

export class Player{
	constructor(id){
		this.brain = new Genome(genomeInputsN, genomeOutputN, id);
		this.game = new Game();
		this.fitness = 0;
		this.startTime = Date.now();
		this.survivalTime = 0;
		this.maxHits = 150;
		this.lastDecisionTime = 0;
		this.lastDesicion = 0;

		this.decisions = []; //Current Output values
		this.vision = []; //Current input values
	}

	clone() { //Returns a copy of this player
		let clone = new Player();
		clone.brain = this.brain.clone();
		return clone;
	}

	crossover(parent){ //Produce a child
		let child = new Player();
		if(parent.fitness < this.fitness)
			child.brain = this.brain.crossover(parent.brain);
		else
			child.brain = parent.brain.crossover(this.brain);

		child.brain.mutate()
		return child;
	}

	done(){
		if (this.game.score > 5 || this.game.score < -5 || this.game.hits > this.maxHits) {
			let endTime = Date.now();
			this.survivalTime = (endTime - this.startTime);
			return true;
		}
		else return false;
	}

	//Game stuff
	look(){
		const currenState = this.game.getCurrentState();
		this.vision = currenState;
	}

	think(){
		this.decisions = this.brain.feedForward(this.vision);
	}

	calculateFitness(){
		this.fitness = this.game.hits;
		this.fitness += this.survivalTime;
		this.fitness -= this.game.malus;
	}

	setInputs(currentState){
		this.vision = currentState;
	}
}