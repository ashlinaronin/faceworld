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
                    _createBigCactus(2);
                });
            }

            function _createBigCactus(size) {
                objLoader.load('assets/cactus.obj', function(object) {

										var parentGeometry = new THREE.Geometry();
										object.children.forEach(function(childMesh) {
											var childGeo = new THREE.Geometry().fromBufferGeometry(childMesh.geometry);
											parentGeometry.merge(childGeo, childMesh.matrix);
										});

										parentGeometry.scale(size, size, size);
										parentGeometry = _colorBigCactus(parentGeometry);

										var material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });
										var mesh = new THREE.Mesh(parentGeometry, material);

                    bigCactusDeferred.resolve(mesh);
                });
            }

						function _colorBigCactus(cactus) {
							cactus.faces.forEach(function(face) {
								var color = new THREE.Color(0xffffff);
								color.setHSL(Math.random(), Math.random(), Math.random());
								face.color = color;
							});

							cactus.colorsNeedUpdate = true;
							return cactus;
						}


            /* Return a random integer between min (inclusive) and max (inclusive).
            ** Thanks to MDN. */
            function _getRandomInt(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            return {
                getOneBigCactus: function() {
                    return bigCactusDeferred.promise;
                }
						}
        }
})();
