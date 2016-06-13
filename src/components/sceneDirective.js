(function() {
    'use strict';

    angular
        .module('faceworld')
        .directive('scene', sceneDirective);

    sceneDirective.$inject = [
        '$q', 'CameraService', 'PhotosphereService',
        'RendererService', 'WebcamService', 'AsteroidsService',
        'LightsService', 'SpheresService', 'CactusesService',
        'StarsService', 'SynthPadService'
    ];

    function sceneDirective($q, CameraService, PhotosphereService,
        RendererService, WebcamService, AsteroidsService,
        LightsService, SpheresService, CactusesService,
        StarsService, SynthPadService) {

        var directive = {
            link: link,
            restrict: 'EA'
        }

        var components = {
            scene: new THREE.Scene()
        }

				var streamer = new MeshSenderHTTP("ashlin", "cactus", null, "http://172.16.0.115:8080");

        return directive;

        function link(scope, element, attrs) {
            $q.all({
                camera: CameraService.getCamera(),
                renderer: RendererService.getRenderer(),
                webcamVideoTexture: WebcamService.getVideoTexture(),
                webcamVideoContext: WebcamService.getVideoContext(),
                bigCactus: CactusesService.getOneBigCactus()
            }).then(function(resolved) {
                // Add all the new resolved components to the components object
                angular.extend(components, resolved);

                components.scene.add(components.camera);
                components.scene.add(components.bigCactus);

                animate(0);

                SynthPadService.init();
            });
        }

        function addTexturedObject(scene, object, texture) {
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.material.map = texture;
                    child.material.needsUpdate = true;
                }
            });
            scene.add(object);
        }

        function animate(timestamp) {
						updateStatus();
            window.requestAnimationFrame(animate);
            WebcamService.drawVideoFrame();
            CactusesService.addWebcamColors(components.webcamVideoContext, components.bigCactus);
            CactusesService.morph(components.bigCactus, timestamp);
            components.renderer.render(components.scene, components.camera);
            streamer.update(components.bigCactus.geometry);
        }

				function updateStatus() {
					var status = streamer.getDebugStatus();
					var statusText = [];
					for(var itm in status) {
						statusText.push(itm + ": " + status[itm]);
					}
					document.getElementById("status").innerHTML = statusText.join("<br>");
				}

        function addMouseMoveListener(renderer, camera, cactus) {
            renderer.domElement.addEventListener('mousemove', function(e) {
                camera.rotation.x = Math.tan((window.innerHeight - e.x) / (window.innerHeight * 2));
                camera.position.z = 20 * Math.tan((window.innerHeight / 2 + e.x) / (window.innerHeight));
            }, false);
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

})();
