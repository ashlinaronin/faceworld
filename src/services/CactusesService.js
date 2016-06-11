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
            });

						var numFaces = 552; // we know this to be true

            // Start loading objs as soon as we have a loading manager
            _startLoading();

            function _startLoading() {
                LoadingManagerService.getLoadingManager().then(function(manager) {
                    objLoader = new THREE.OBJLoader(manager);
                    _createBigCactus(1.7);
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

						function _addWebcamColors(context, mesh) {
								for (var i = 0; i < mesh.geometry.faces.length; i++) {
									mesh.geometry.faces[i].color.copy(_pickPixel(context, i, i));
								}

								mesh.geometry.colorsNeedUpdate = true;
						}

						function _pickPixel(context, x, y) {
								var pixel = context.getImageData(x, y, 1, 1);
								var color = new THREE.Color();
								color.setRGB(
									convertRGBRange(pixel.data[0]),
									convertRGBRange(pixel.data[1]),
									convertRGBRange(pixel.data[2])
								);
								return color;
						}

						// http://stackoverflow.com/questions/14224535/scaling-between-two-number-ranges
						function convertRGBRange( value ) {
								var r1 = [0, 255];
								var r2 = [0, 1];
    						return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
						}


            /* Return a random integer between min (inclusive) and max (inclusive).
            ** Thanks to MDN. */
            function _getRandomInt(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            return {
                getOneBigCactus: function() {
                    return bigCactusDeferred.promise;
                },
								addWebcamColors: _addWebcamColors
						}
        }
})();
