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
								var numSections = 8;
								var roundedNumFaces = Math.floor(mesh.geometry.faces.length/numSections);

								for (var i = 0; i < roundedNumFaces; i++) {
									var pixelColor = _pickPixel(context, i, i);

									for (var sectionNum = 0; sectionNum < numSections; sectionNum++) {
										var roundedFaceIndex = Math.floor(i * sectionNum);
										mesh.geometry.faces[roundedFaceIndex].color.copy(pixelColor);
									}
									// mesh.geometry.faces[i].color.copy(pixelColor);
									// mesh.geometry.faces[i*numSections].color.copy(pixelColor);
								}

								mesh.geometry.colorsNeedUpdate = true;
						}

						function _morph(mesh, timestamp) {
							// debugger;
								for (var i = 0; i < mesh.geometry.vertices.length; i++) {
										var vertex = mesh.geometry.vertices[i];
										vertex.x += (Math.sin((timestamp/400 + vertex.y)) / 80);

								}
								// debugger;
								mesh.geometry.verticesNeedUpdate = true;
						}

						function _pickPixel(context, x, y) {
								var pixel = context.getImageData(x, y, 1, 1);
								var color = new THREE.Color();
								color.setRGB(
									  pixel.data[0] / 255,
									  pixel.data[1] / 255,
									  pixel.data[2] / 255
								);
								return color;
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
								addWebcamColors: _addWebcamColors,
								morph: _morph
						}
        }
})();
