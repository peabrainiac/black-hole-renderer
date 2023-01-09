import Camera from "./Camera.js";
import InputHandler from "./InputHandler.js";
import Renderer from "./Renderer.js";
import FpsCounter from "./ui/FpsCounter.js";

(async()=>{
	const fpsCounter = new FpsCounter();
	document.body.appendChild(fpsCounter);

	const canvas = document.body.querySelector("canvas");
	const renderer = new Renderer(canvas);
	const inputHandler = new InputHandler(canvas);
	document.body.addEventListener("click",e=>{
		inputHandler.requestPointerLock();
	});
	const camera = new Camera(inputHandler);
	//camera.position.z = 15;
	//camera.position.x = 1;
	//camera._rotation.rotateExp(0,0,Math.PI/2);
	let prevT;
	let inGameTime = 0; // time this script has been running in seconds, not counting times when execution was paused by being in another tab etc.
	while (true){
		// waits for the next repaint of the browser window - JS equivalent of vsync, basically.
		let t = await new Promise(requestAnimationFrame);//await new Promise(resolve=>setTimeout(()=>resolve(Date.now()),5));
		/** time since the last frame in seconds, capped at 0.25. */
		let deltaT = Math.min(0.25,(prevT?t-prevT:0)/1000);
		prevT = t;
		inGameTime += deltaT;
		camera.update(deltaT);
		renderer.resize(window.innerWidth,window.innerHeight);
		renderer.render(camera,inGameTime);
		fpsCounter.update();
	}
})();