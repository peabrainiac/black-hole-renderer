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
	let prevT;
	let inGameTime = 0; // time this script has been running in seconds, not counting times when execution was paused by being in another tab etc.
	while (true){
		// waits for the next repaint of the browser window - JS equivalent of vsync, basically.
		let t = await new Promise(requestAnimationFrame);
		/** time since the last frame in seconds, capped at 0.25. */
		let deltaT = Math.min(0.25,(prevT?t-prevT:0)/1000);
		prevT = t;
		inGameTime += deltaT;
		camera.update(deltaT);
		renderer.resize(window.innerWidth,window.innerHeight);
		renderer.render(camera,inGameTime);
	}
})();