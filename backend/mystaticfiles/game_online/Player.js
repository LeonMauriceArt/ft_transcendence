import * as THREE from 'three'

import { GAME_AREA_HEIGHT, GAME_AREA_WIDTH, PADDLE_HEIGHT, PLAYER_SPEED, WINNING_SCORE } from './Constants.js'


export class Player
{
	constructor(side, width, height, color) 
	{
		switch (side){
			case 0 :
				this.x = (GAME_AREA_WIDTH * -1) + 10;
			case 1 :
				this.x = GAME_AREA_WIDTH - 10
		}
		this.y = 0;
		this.geometry = new THREE.BoxGeometry(width, height, width, 1, 1, 1);
		this.material = new THREE.MeshStandardMaterial();
		this.material.color.setHex(color);
		this.material.emissive.setHex(color);
		this.material.emissiveIntensity = 2
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.set(this.x, this.y, 0);
		this.score = 0;
		this.powerups = [];
	}
	move(up)
	{
		if (up)
		{
			if ((this.mesh.position.y + PADDLE_HEIGHT / 2) + PLAYER_SPEED <= GAME_AREA_HEIGHT)
				this.mesh.position.y += PLAYER_SPEED;
		}
		else
		{
			if ((this.mesh.position.y - PADDLE_HEIGHT / 2) - PLAYER_SPEED > GAME_AREA_HEIGHT * -1)
				this.mesh.position.y -= PLAYER_SPEED;
		}
	}
	reset()
	{
		this.mesh.position.y = 0
	}
	score_point()
	{
		if (this.score < WINNING_SCORE)
			this.score += 1
	}
	setcolor(newcolor)
	{
		this.material.color.setHex(newcolor)
		this.material.emissive.setHex(newcolor)
	}
	add_power(powertype)
	{
		console.log("Adding powerup", powertype)
		this.powerups.push(powertype);
		console.log(this.powerups.length)
	}
	use_power(player_one, player_two, ball, scene, powermanager)
	{
		console.log("Cannot use power, dont have any...")
		if (this.powerups.length != 0)
		{
			console.log("Using power !")
			powermanager.handle_usage(this.powerups[0].type, player_one, player_two, this, ball, scene)
			this.powerups.pop()
		}
	}
	to_dict(){
		return {
			x: this.x,
			y: this.mesh.position.y,
			color: this.material.color
		}
	}
}