(function(){
	'use strict';

	angular
        .module('faceworld')
		.factory('AsteroidsService', Asteroids);

        Asteroids.$inject = ['$q', 'LoadingManagerService'];

        function Asteroids($q, LoadingManagerService) {

            var asteroidsDeferred = $q.defer();
            var asteroids = [];
            var asteroidMaterial = new THREE.MeshPhongMaterial(0xffffff);
            var objLoader;

            // start loading objs as soon as we have a loading manager
            LoadingManagerService.getLoadingManager().then(function(manager) {
                objLoader = new THREE.OBJLoader(manager);
                _createAsteroids(10, 40);
            });


            function _createAsteroid(geometryUrl, size, position) {
                objLoader.load(geometryUrl, function(object) {
                    object.traverse(function(child) {
                        if (child instanceof THREE.Mesh) {
                            child.material = asteroidMaterial;
                        }
                    });
                    object.scale.set(size, size, size);
                    object.position.copy(position);
                    asteroids.push(object);
                });
            }

            function _createAsteroids(number, maxSize) {
                for (var i = 0; i < number; i++) {
                    var x = _getRandomInt(0, maxSize);
                    var y = _getRandomInt(0, maxSize);
                    var z = _getRandomInt(0, maxSize);
                    var position = new THREE.Vector3(x, y, z);

                    var size = _getRandomInt(1, 5);

                    _createAsteroid('assets/asteroids/' + i + '.obj', size, position);
                }

                // resolve asteroids promise with asteroids after creating them
                asteroidsDeferred.resolve(asteroids);
            }

            /* Return a random integer between min (inclusive) and max (inclusive).
            ** Thanks to MDN. */
            function _getRandomInt(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }


            return {
                getAsteroids: function() {
                    return asteroidsDeferred.promise;
                }
            }
        }

})();
