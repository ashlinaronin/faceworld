(function(){
	'use strict';

	angular
        .module('faceworld')
		.factory('CameraService', Camera);

        Camera.$inject = ['$q'];

        function Camera($q) {

            var cameraDeferred = $q.defer();
            var camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 100000);
			camera.position.z = 300;
            cameraDeferred.resolve(camera);

            return {
                getCamera: function() {
                    return cameraDeferred.promise;
                }
            }
        }

})();
