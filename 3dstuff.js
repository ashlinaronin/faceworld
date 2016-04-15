/*global THREE */

'use strict';

//renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.setAttribute('id','renderer');
document.body.appendChild(renderer.domElement);
var scene = new THREE.Scene();
var sphereTex, photosphere;

var loader = new THREE.TextureLoader();

function updateSphereMap(dataUrl) {
    loader.load(dataUrl, function(texture) {
        photosphere.material.map = texture;
        photosphere.material.needsUpdate = true;
        console.log('set sphere map to ' + dataUrl);
    })
}


//camera
var camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);


/////Sphere


var sphereGeo = new THREE.SphereGeometry(400,32,32);
sphereTex = new THREE.MeshBasicMaterial({
	color: 0xffffff,
	side: THREE.BackSide
});
photosphere = new THREE.Mesh(sphereGeo, sphereTex);

var initialDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAArklEQVQ4T5WT0RHDMAhDzXbtGulc7RrNdvQUGyob7HP8lUvEQ6BYyt7RJpNRHl4kPFWt9SKXvKuZAbjjBTg/pTxfLo8P1LnraN3xnSD7ABQaBACc5iTOU7XVPYtXLsYdBIB1ZPDMgRezg1uA71vL4/ivMxtjTMNG8KhQbpAZgBcJQDo3IKtFGmQJaH+ez5Ql1AFm8ZkTG4+dpQDExNkzeBztNoAvGxp5Cnu3OqjkB1Y8lQzqi2O7AAAAAElFTkSuQmCC';
updateSphereMap(initialDataUrl);
scene.add(photosphere);


animate();

window.addEventListener('resize', function(){
	renderer.domElement.width = window.innerWidth;
	renderer.domElement.height = window.innerHeight;
}, false);


renderer.domElement.addEventListener('mousemove', function(e){
	camera.rotation.x = Math.tan((window.innerHeight/2 - e.y)/(window.innerHeight/2));
	photosphere.rotation.y = 4*Math.tan(e.x/window.innerWidth);
}, false);


scene.add(camera);


/////Animation loop
function animate(){
	window.requestAnimationFrame(animate);
	renderer.render( scene, camera );
}
