(function() {
	'use strict';

  	angular
		.module('faceworld')
		.factory('RendererService', Renderer);

        Renderer.$inject = ['$q', 'WebcamService', 'PhotosphereService', 'CameraService'];

		function Renderer($q, WebcamService, PhotosphereService, CameraService) {
            var rendererDeferred = $q.defer();
			_init();

            function _init() {
                var renderer = new THREE.WebGLRenderer();
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.domElement.setAttribute('id', 'renderer');
                document.body.appendChild(renderer.domElement);

                rendererDeferred.resolve(renderer);

				_addResizeListener();
            }

            function _addResizeListener() {
				$q.all({
					rd: rendererDeferred.promise,
					camera: CameraService.getCamera()
				}).then(function(resolved) {
					window.addEventListener('resize', function() {
						resolved.rd.domElement.width = window.innerWidth;
						resolved.rd.domElement.height = window.innerHeight;
						resolved.rd.setSize(window.innerWidth, window.innerHeight);
						resolved.camera.aspect = window.innerWidth / window.innerHeight;
  						resolved.camera.updateProjectionMatrix();
					});
				});
            }

			return {
                getRenderer: function() {
                    return rendererDeferred.promise;
                }
            }
		}

})();
