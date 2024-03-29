import * as THREE from 'three'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

export function createTextMesh(font, text, textMesh, x, y, z, fontcolor, fontsize) {
	// Create TextGeometry
	var textGeometry = new TextGeometry(text, {
		font: font,
		size: fontsize,
		height: 1,
		curveSegments: 1,
		bevelEnabled: true,
		bevelThickness: 0.5,
		bevelSize: 1,
		bevelOffset: 0,
		bevelSegments: 1
	});
	
	// Material
	var textMaterial = new THREE.MeshPhongMaterial({
		emissive: fontcolor,
		emissiveIntensity: 5
	});
	textGeometry.center();
	
	// Create mesh
	var textMesh = new THREE.Mesh(textGeometry, textMaterial);
	
	// Position and add to scene
	textMesh.position.set(x, y, z);

	return textMesh
}