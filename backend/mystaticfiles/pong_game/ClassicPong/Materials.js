import * as THREE from 'three'

export const pointsMaterial = new THREE.PointsMaterial({
    size: 2,
    sizeAttenuation: true
});

export const lineMaterial = new THREE.LineBasicMaterial({
	 color: 0xffffff 
});

export const ballMaterial = new THREE.MeshPhongMaterial({
	color: 0xffffff,
	wireframe: false,
	emissive: 0xffffff,
	side: THREE.BackSide
})

export const wallMaterial = new THREE.MeshPhongMaterial({
	color: 0xffffff,
	emissive: 0xffffff,
	emissiveIntensity: 0.1,
	wireframe: true,
})
