(function(){
	'use strict';

	angular
        .module('faceworld')
        .directive('scene', sceneDirective);

        sceneDirective.$inject = [
            '$q', 'CameraService', 'PhotosphereService',
            'RendererService', 'WebcamService'
        ];

        function sceneDirective($q, CameraService, PhotosphereService,
                    RendererService, WebcamService) {

            var directive = {
                link: link,
                restrict: 'EA'
            }

            var components = {
                scene: new THREE.Scene()
            }

            return directive;

            function link(scope, element, attrs) {

                $q.all({
                    camera: CameraService.getCamera(),
                    photosphere: PhotosphereService.getPhotosphere(),
                    renderer: RendererService.getRenderer(),
                    videoTexture: WebcamService.getVideoTexture()
                }).then(function(resolved) {
                    // Add all the new resolved components to the components object
                    angular.extend(components, resolved);

                    addMouseMoveListener(components.renderer, components.camera, components.photosphere);
                    components.photosphere.material.map = components.videoTexture;

                    components.scene.add(components.photosphere);
                    components.scene.add(components.camera);

                    animate();
                });
            }

            function animate() {
                window.requestAnimationFrame(animate);
                WebcamService.drawVideoFrame();
                components.renderer.render(components.scene, components.camera);
            }

            function addMouseMoveListener(renderer, camera, photosphere) {
                renderer.domElement.addEventListener('mousemove', function(e){
                    camera.rotation.x = Math.tan((window.innerHeight/2 - e.y)/(window.innerHeight/2));
                    photosphere.rotation.y = 4*Math.tan(e.x/window.innerWidth);
                }, false);
            }
        }

})();
