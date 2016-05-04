(function(){
	'use strict';

	angular
        .module('faceworld')
		.factory('SpheresService', Spheres);

        Spheres.$inject = ['$q', 'LoadingManagerService'];

        function Spheres($q, LoadingManagerService) {

            var allSpheresDeferred = $q.defer();
            var spherePromises = [];
            var sphereMaterial = new THREE.MeshBasicMaterial({
            	color: 0xffffff,
            	side: THREE.BackSide
            });

            // start on load
            _createSpheres();

            // Create sphere and return a promise
            function _createSphere(radius, position) {
                var sphereDeferred = $q.defer();

                var sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
                var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

                sphere.position.copy(position);

                sphereDeferred.resolve(sphere);

                return sphereDeferred.promise;
            }

            function _createSpheres(number, maxSize) {
                for (var i = 0; i < number; i++) {
                    var x = _getRandomInt(-maxSize, maxSize);
                    var y = _getRandomInt(-maxSize, maxSize);
                    var z = _getRandomInt(-maxSize, maxSize);
                    var position = new THREE.Vector3(x, y, z);

                    var radius = _getRandomInt(1, 15);

                    var spherePromise = _createSphere(radius, position);
                    spherePromises.push(spherePromise);
                }

                $q.all(spherePromises).then(function(resolved) {
                    // Resolve all spheres promise with spheres once we're
                    // sure they've all been created
                    allSpheresDeferred.resolve(resolved);
                });
            }

            /* Return a random integer between min (inclusive) and max (inclusive).
            ** Thanks to MDN. */
            function _getRandomInt(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }


            return {
                getSpheres: function() {
                    return allSpheresDeferred.promise;
                }
            }
        }

})();
