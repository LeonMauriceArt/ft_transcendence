import { Player } from './player.mjs';

let showBest = true;

//The Population Class
//Here is where the power of all the classes
//comes together to destroy the game score records
export class Population{
	constructor(size){
		this.population = [];
		this.bestPlayer;
		this.bestFitness = 0;
		this.fitness = 0;
		this.generation = 0;
		this.matingPool = [];

		for(let i = 0; i < size; i++){
			this.population.push(new Player(i));
			this.population[i].brain.generateNetwork();
			this.population[i].brain.mutate();
		}
	}

	updateAlive(){
		for(let i = 0; i < this.population.length; i++){
			if(!this.population[i].done()){
				this.population[i].look();
				this.population[i].think();
				let decisionIndex = this.population[i].decisions.indexOf(Math.max(...this.population[i].decisions));
				this.population[i].game.simulateEpisode(decisionIndex, this.population[i].fitness);
			}
		}

		if(showBest && this.bestPlayer && !this.bestPlayer.dead) {
			this.bestPlayer.look();
			this.bestPlayer.think();
		}
	}
	
	naturalSelection(){
		this.calculateFitness();
		console.log("Best Fitness: " + this.bestFitness);
		let children = [];
		
		this.fillMatingPool();
		for(let i = 0; i < this.population.length; i++){
			let parent1 = this.selectPlayer();
			let parent2 = this.selectPlayer();
			if(parent1 && parent2) {
				if(parent1.fitness > parent2.fitness)
					children.push(parent1.crossover(parent2));
				else
					children.push(parent2.crossover(parent1));
			}
		}
		
		this.population.splice(0, this.population.length);
		this.population = children.slice(0);
		this.generation++;
		this.population.forEach((element) => { 
			element.brain.generateNetwork();
		});	

		console.log("Generation " + this.generation);

		for(let i = 0; i < this.population.length; i++){
			this.population[i].game.hits = 0;
			this.population[i].game.score = 0;
		}
	}

	calculateFitness(){
		let currentMax = 0;
		this.population.forEach((element) => { 
			element.calculateFitness();
			if(element.fitness > this.bestFitness){
				this.bestFitness = element.fitness;
				this.bestPlayer = element.clone();
			}

			if(element.fitness > currentMax)
				currentMax = element.fitness;
		});

		//Normalize
		this.population.forEach((element, elementN) => { 
			element.fitness /= currentMax;
		});
	}

	fillMatingPool(){
		this.matingPool.splice(0, this.matingPool.length);
		this.population.forEach((element, elementN) => { 
			let n = element.fitness * 100;
			for(let i = 0; i < n; i++)
				this.matingPool.push(elementN);
		});
	}

	selectPlayer(){
		let rand = Math.floor(Math.random() *  this.matingPool.length);
		return this.population[this.matingPool[rand]];
	}

	done(){
		for (let i = 0; i < this.population.length; i++) {
			if (!this.population[i].done()) {
				return false;
			}
		}

		return true;
	}
}
