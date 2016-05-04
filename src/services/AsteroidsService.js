(function(){
	'use strict';

	angular
        .module('faceworld')
		.factory('AsteroidsService', Asteroids);

        Asteroids.$inject = ['$q', 'LoadingManagerService'];

        function Asteroids($q, LoadingManagerService) {

            var objLoader;
            var allAsteroidsDeferred = $q.defer();
            var asteroidPromises = [];
            var asteroidMaterial = new THREE.MeshBasicMaterial({
            	color: 0xffffff,
            	side: THREE.BackSide
            });





            // Start loading objs as soon as we have a loading manager
            _startLoading();

            function _startLoading() {
                LoadingManagerService.getLoadingManager().then(function(manager) {
                    objLoader = new THREE.OBJLoader(manager);
                    _createAsteroids(10, 80);
                });
            }

            // Create asteroid and return a promise
            function _createAsteroid(geometryUrl, size, position) {
                var asteroidDeferred = $q.defer();

                objLoader.load(geometryUrl, function(object) {
                    object.traverse(function(child) {
                        if (child instanceof THREE.Mesh) {
                            child.material = asteroidMaterial;
                        }
                    });
                    object.scale.set(size, size, size);
                    object.position.copy(position);

                    asteroidDeferred.resolve(object);
                });

                return asteroidDeferred.promise;
            }

            function _createAsteroids(number, maxSize) {
                for (var i = 0; i < number; i++) {
                    var x = _getRandomInt(-maxSize, maxSize);
                    var y = _getRandomInt(-maxSize, maxSize);
                    var z = _getRandomInt(-maxSize, maxSize);
                    var position = new THREE.Vector3(x, y, z);

                    var size = _getRandomInt(1, 15);

                    var asteroidPromise = _createAsteroid('assets/asteroids/' + i + '.obj', size, position);
                    asteroidPromises.push(asteroidPromise);
                }

                $q.all(asteroidPromises).then(function(resolved) {
                    // Resolve all asteroids promise with asteroids once we're
                    // sure they've all been created
                    allAsteroidsDeferred.resolve(resolved);
                });
            }

            function _rotateAsteroids(asteroids) {
                for (var i = 0; i < asteroids.length; i++) {
                    asteroids[i].rotation.y += (0.005 * i) + 0.005;
                }
            }

            /* Return a random integer between min (inclusive) and max (inclusive).
            ** Thanks to MDN. */
            function _getRandomInt(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            return {
                getAsteroids: function() {
                    return allAsteroidsDeferred.promise;
                },
                rotateAsteroids: _rotateAsteroids
            }



        }

})();
