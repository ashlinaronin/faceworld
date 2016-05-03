(function(){
	'use strict';

	angular
        .module('faceworld')
		.factory('LoadingManagerService', LoadingManager);

        LoadingManager.$inject = ['$q'];

        function LoadingManager($q) {

            var loadingManagerDeferred = $q.defer();
            var loadingManager = new THREE.LoadingManager();
            loadingManager.onProgress = _onLoadingManagerProgress;
            loadingManagerDeferred.resolve(loadingManager);

            function _onLoadingManagerProgress (item, loaded, total) {
                console.log(item, loaded, total);
            }

            return {
                getLoadingManager: function() {
                    return loadingManagerDeferred.promise;
                }
            }
        }

})();
