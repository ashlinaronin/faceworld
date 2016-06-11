(function(){
	'use strict';

	angular
        .module('faceworld')
		.factory('CactusesService', Cactuses);

        Cactuses.$inject = ['$q', 'LoadingManagerService'];

        function Cactuses($q, LoadingManagerService) {

            var objLoader;
            var allCactusesDeferred = $q.defer();
            var bigCactusDeferred = $q.defer();
            var cactusPromises = [];
            var cactusMaterial = new THREE.MeshBasicMaterial({
            	color: 0xffffff
            	// side: THREE.BackSide
            });

            // Start loading objs as soon as we have a loading manager
            _startLoading();

            function _startLoading() {
                LoadingManagerService.getLoadingManager().then(function(manager) {
                    objLoader = new THREE.OBJLoader(manager);
                    _createBigCactus(160);
                });
            }

            // Create cactus and return a promise
            // TODO: SLOW RIGHT NOW WE DONT NEED TO LOAD THIS THING MILLION TIMES
            function _createCactus(size, position) {
                var cactusDeferred = $q.defer();

                objLoader.load('assets/cactus.obj', function(object) {
                    object.traverse(function(child) {
                        if (child instanceof THREE.Mesh) {
                            child.material = cactusMaterial;
                        }
                    });
                    object.scale.set(size, size, size);
                    object.position.copy(position);

                    cactusDeferred.resolve(object);
                });

                return cactusDeferred.promise;
            }

            function _createBigCactus(size) {
                objLoader.load('assets/cactus.obj', function(object) {

										var parentGeometry = new THREE.Geometry();
										object.children.forEach(function(childMesh) {
											var childGeo = new THREE.Geometry().fromBufferGeometry(childMesh.geometry);
											parentGeometry.merge(childGeo, childMesh.matrix);
										});

										var material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });
										var mesh = new THREE.Mesh(parentGeometry, material);

                    bigCactusDeferred.resolve(mesh);
                });
            }

            function _createCactuses(number, maxSize) {
                for (var i = 0; i < number; i++) {
                    var x = _getRandomInt(-maxSize, maxSize);
                    var y = _getRandomInt(-maxSize, maxSize);
                    var z = _getRandomInt(-maxSize, maxSize);
                    var position = new THREE.Vector3(x, y, z);

                    var size = _getRandomInt(1, 15);

                    var cactusPromise = _createCactus(size, position);
                    cactusPromises.push(cactusPromise);
                }

                $q.all(cactusPromises).then(function(resolved) {
                    // Resolve all cactuses promise with cactuses once we're
                    // sure they've all been created
                    allCactusesDeferred.resolve(resolved);
                });
            }

            function _rotateCactuses(cactuses) {
                for (var i = 0; i < cactuses.length; i++) {
                    cactuses[i].rotation.y += (0.005 * i) + 0.005;
                }
            }

            /* Return a random integer between min (inclusive) and max (inclusive).
            ** Thanks to MDN. */
            function _getRandomInt(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            return {
                getCactuses: function() {
                    return allCactusesDeferred.promise;
                },
                getOneBigCactus: function() {
                    return bigCactusDeferred.promise;
                },
                rotateCactuses: _rotateCactuses
            }



        }

})();
