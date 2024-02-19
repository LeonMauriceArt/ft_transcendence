import * as THREE from 'three'

export class Wall
{
	constructor(y, size, Material)
	{
		this.plane = new THREE.PlaneGeometry(size, size, 15, 15)
		this.material = Material
		this.mesh = new THREE.Mesh(this.plane, this.material)
		this.mesh.position.y = y
		if (y < 0)
			this.mesh.rotation.x = (Math.PI / 2) * -1;
		else
			this.mesh.rotation.x = (Math.PI / 2);
	}
}
