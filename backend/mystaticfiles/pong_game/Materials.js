import * as THREE from 'three'

export const pointsMaterial = new THREE.PointsMaterial({
    size: 2,
    sizeAttenuation: true
});

export const lineMaterial = new THREE.LineBasicMaterial({
	 color: 0xffffff 
});

export const ballMaterial = new THREE.MeshPhongMaterial({
	emissive: 0xffffff,
	color: 0xffffff,
	side: THREE.BackSide
})

export const wallMaterial = new THREE.MeshPhongMaterial({
	emissive: 0xffffff,
	emissiveIntensity: 0.1,
	wireframe: true,
})

export const powerWallMaterial = new THREE.MeshPhongMaterial({
	emissive: 0xff00ff,
	color: 0xff00ff,
	emissiveIntensity: 3,
	wireframe: false,
})


export const powerReverseMaterial = new THREE.MeshPhongMaterial({
	emissive: 0x00ff00,
	emissiveIntensity: 0.1,
	wireframe: true,
})

export const powerCurseMaterial = new THREE.MeshPhongMaterial({
	emissive: 0xffff00,
	emissiveIntensity: 0.1,
	wireframe: true,
})