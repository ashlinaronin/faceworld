(function(){
	'use strict';

	angular
        .module('faceworld')
		.factory('StarsService', Stars);

        Stars.$inject = ['$q', 'LoadingManagerService'];

        // Judiciously adapted from http://creativejs.com/uploads/tutorials/three/Part1_particles/ThreeParticles.html
        function Stars($q, LoadingManagerService) {

            var allParticlesDeferred = $q.defer();
            var particles;

            var textureLoader = new THREE.TextureLoader();
            var sprite = textureLoader.load("assets/circle.png");
            var scalar = 20;


            function _getParticles() {
                var geometry = new THREE.Geometry();

                // We're gonna move from z position -1000 (far away)
                // to 1000 (where the camera is), well actually my camera is at 300, so maybe we adapted
                // and add a random particle at every pos
                for (var zpos = -2000; zpos < 1000; zpos += 10) {
                    var particleDeferred = $q.defer();

                    var vertex = new THREE.Vector3();
                    vertex.x = Math.random() * 8000 - 4000;
                    vertex.y = Math.random() * 8000 - 4000;
                    vertex.z = zpos;

                    // this is how sprites work - a collection of vertices
                    geometry.vertices.push(vertex);
                }

                var material = new THREE.PointsMaterial({
                    size: 10,
                    map: sprite,
                    blending: THREE.AdditiveBlending,
                    depthTest: false,
                    transparent: true
                });

                particles = new THREE.Points(geometry, material);
                allParticlesDeferred.resolve(particles);

                return allParticlesDeferred.promise;
            }

            function _updateParticles() {

                // // iterate through every particle
                for (var i = 0; i < particles.geometry.vertices.length; i++) {
                    var vertex = particles.geometry.vertices[i];

                    // and move it forward dependent on scalar (mouse pos in example)
                    vertex.z += scalar * 0.1;

                    // if the particle is too close move it to the back
                    if (vertex.z > 1000) {
                        vertex.z -= 3000;
                    }
                }
                particles.geometry.verticesNeedUpdate = true;
            }

            return {
                getParticles: _getParticles,
                updateParticles: _updateParticles
            }

        }

})();
