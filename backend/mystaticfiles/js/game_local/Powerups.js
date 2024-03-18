import * as THREE from 'three'

import { powerWallMaterial, powerCurseMaterial, powerReverseMaterial } from './Materials.js';
import * as constants from './Constants.js';

export class Power_Manager
{
	constructor()
	{
		this.array = [];
		this.timer = new THREE.Clock();
	}
	spawn_power(scene)
	{
		var powertospawn = 0;
		// var powertospawn = Math.floor(Math.random() * 3);
		switch(powertospawn){
			case 0:
				this.array[0] = new WallPowerup(getRandomPos());
				scene.add(this.array[0].mesh, this.array[0].light)
				break;
			case 1:
				this.array[0] = new ReversePowerup(getRandomPos());
				scene.add(this.array[0].mesh, this.array[0].mesh.light)
				break;
			case 2:
				this.array[0] = new CursePowerup(getRandomPos());
				scene.add(this.array[0].mesh, this.array[0].mesh.light)
				break;
		}
	}
	remove_power(scene)
	{
		this.array[0].destroy(scene)
		this.array.pop()
	}
	update(player_one, player_two, ball, scene)
	{
		if (this.array.length == 0 && !this.timer.running)
			this.timer.start()
		else
		{
			this.timer.getElapsedTime()
			if (this.timer.elapsedTime >= constants.POWER_RESPAWN_TIME && this.array.length == 0)
			{
				this.timer.stop();
				this.spawn_power(scene);
			}
			else if (this.array.length == 1)
			{
				if (this.array[0].update(player_one, player_two, ball, scene) == 1)
					this.remove_power(scene);
			}
		}
	}
	handle_usage(powertype, player_one, player_two, caster, ball, scene)
	{
		switch (powertype){
			case 'wall':

			case 'reverse':

			case 'curse':
				
		}
	}
	// power_wall_effect(scene)
	// {

	// }
	// power_reverse_effect(ball)
	// {

	// }
	// power_curse_effect(player_one, player_two, player_casting)
	// {

	// }
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function getRandomPos()
{
	var x = getRandomInt(constants.POWER_SPAWNAREA_WIDTH * -1, constants.POWER_SPAWNAREA_WIDTH);
	var y = getRandomInt(constants.POWER_SPAWNAREA_HEIGHT * -1, constants.POWER_SPAWNAREA_HEIGHT);
	return new THREE.Vector3(x, y, 0);
}

function handle_power_collision(power, player_one, player_two, ball)
{
	var distance = Math.sqrt((ball.mesh.position.x - power.mesh.position.x)**2 + (ball.mesh.position.y - power.mesh.position.y)**2)
	if (distance <= (constants.BALL_RADIUS + constants.POWER_RADIUS) && ball.material.emissive != 0xffffff)
	{
		if (ball.color == constants.PLAYER_1_COLOR && player_one.powerups.length != 1)
		{
			player_one.add_power(power.type)
			return 1;
		}
		else if (ball.color == constants.PLAYER_2_COLOR && player_two.powerups.length != 1)
		{
			player_two.add_power(power.type)
			return 1;
		}
	}
	return 0;
}

export class WallPowerup
{
	constructor(vector)
	{
		this.geometry = new THREE.SphereGeometry(constants.POWER_RADIUS, 10, 10);
		this.material = powerWallMaterial
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.copy(vector);
		this.light = new THREE.PointLight(0xff00ff, 10000 ,100)
		this.light.castShadow = false
		this.type = "wall"
	}
	update(player_one, player_two, ball)
	{
		if (handle_power_collision(this, player_one, player_two, ball) == 1)
			return 1;
		this.light.position.set(this.mesh.position.x, this.mesh.position.y)
	}
	destroy(scene)
	{
		scene.remove(this.mesh, this.light);
	}
}


export class ReversePowerup
{
	constructor()
	{
		this.geometry = new THREE.SphereGeometry(constants.POWER_RADIUS, 10, 10);
		this.material = powerWallMaterial
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.set(0, 0, 0);
		this.light = new THREE.PointLight(0xffffff, 10000 ,100)
		this.light.castShadow = false
	}
	update(player_one, player_two)
	{
		if (this.handle_power_collision(player_one, player_two) == 1)
			return 1;
		this.light.position.set(this.mesh.position.x, this.mesh.position.y)
	}
	handle_power_collision(ball, player_one, player_two)
	{
		var distance = Math.sqrt((ball.mesh.position.x - this.mesh.position.x)**2 + (ball.mesh.position.y - this.mesh.position.y)**2)
		if (distance <= (constants.BALL_RADIUS + constants.POWER_RADIUS))
		{
			if (ball.material.emissive == constants.PLAYER_1_COLOR)
				player_one.add_powerup(powerup)
			else if (ball.material.emissive == constants.PLAYER_2_COLOR)
				player_two.add_powerup(powerup)
			return 1;
		}
	}
}

export class CursePowerup
{
	constructor()
	{
		this.geometry = new THREE.SphereGeometry(constants.POWER_RADIUS, 10, 10);
		this.material = powerWallMaterial
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.set(0, 0, 0);
		this.light = new THREE.PointLight(0xffffff, 10000 ,100)
		this.light.castShadow = false
	}
	update(player_one, player_two)
	{
		this.handle_power_collision(player_one, player_two)
		this.light.position.set(this.mesh.position.x, this.mesh.position.y)
	}
	handle_power_collision(ball, player_one, player_two)
	{
		var distance = Math.sqrt((ball.mesh.position.x - this.mesh.position.x)**2 + (ball.mesh.position.y - this.mesh.position.y)**2)
		if (distance <= (constants.BALL_RADIUS + constants.POWER_RADIUS))
		{
			if (ball.material.emissive == constants.PLAYER_1_COLOR)
				player_one.add_powerup(powerup)
			else if (ball.material.emissive == constants.PLAYER_2_COLOR)
				player_two.add_powerup(powerup)
		}
	}
}