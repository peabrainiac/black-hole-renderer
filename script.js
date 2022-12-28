import Camera from "./Camera.js";
import Matrix3f from "./gl/Matrix3f.js";
import Matrix4f from "./gl/Matrix4f.js";
import Vector3f from "./gl/Vector3f.js";
import InputHandler from "./InputHandler.js";
import Renderer from "./Renderer.js";

(async()=>{
	const canvas = document.body.querySelector("canvas");
	const renderer = new Renderer(canvas);
	const inputHandler = new InputHandler(canvas);
	document.body.addEventListener("click",e=>{
		inputHandler.requestPointerLock();
	});
	const camera = new Camera(inputHandler);
	while (true){
		let t = await new Promise(requestAnimationFrame);
		let deltaT = 0.02; // time since the last frame, in seconds. todo: actually calculate
		camera.update(deltaT);
		renderer.resize(window.innerWidth,window.innerHeight);
		renderer.render(camera.viewMatrix);
	}
})();