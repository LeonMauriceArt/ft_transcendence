//The Connection Class
//Is where all the weights are stored
//Mostly used for a cleaner and more readable code.
export class Connection {
	constructor(from, to, weight){
		this.fromNode = from; //type: Node
		this.toNode = to; //type: Node
		this.weight = weight; //type: Number
		this.enabled = true;
	}

	randomGaussian(mean = 0, sd = 1) {
		let u = 0, v = 0;
		while (u === 0) u = Math.random(); // Convertir [0,1) en (0,1)
		while (v === 0) v = Math.random();
		let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
		return num * sd + mean; // Ajustement pour la moyenne et l'écart type
	}

	mutateWeight(){ //Randomly mutate the weight of this connection
		let rand = Math.random();
		if (rand < 0.05) //5% chance of being assigned a new random value
			this.weight = Math.random() * 2 - 1;
		else //95% chance of being uniformly perturbed
			this.weight += this.randomGaussian() / 50;
	}

	clone(){ //Returns a copy of this connection
		let clone = new Connection(this.fromNode, this.toNode, this.weight);
		clone.enabled = this.enabled;
		return clone;
	}

	getInnovationNumber(){ //Using https://en.wikipedia.org/wiki/Pairing_function#Cantor_pairing_function
		return (1/2)*(this.fromNode.number + this.toNode.number)*(this.fromNode.number + this.toNode.number + 1) + this.toNode.number;
	}
}