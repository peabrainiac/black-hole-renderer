import { KerrNewmanBlackHole } from "./BlackHoleNumerics.js";
import Camera from "./Camera.js";
import Vector3f from "./gl/Vector3f.js";
import InputHandler from "./InputHandler.js";
import Renderer from "./Renderer.js";
import FpsCounter from "./ui/FpsCounter.js";
import OptionsMenu from "./ui/OptionsMenu.js";

(async()=>{
	const canvas = document.body.querySelector("canvas");
	const inputHandler = new InputHandler(canvas);
	const fpsCounter = new FpsCounter();
	const optionsMenu = new OptionsMenu();
	document.body.appendChild(fpsCounter);
	document.body.appendChild(optionsMenu);
	canvas.addEventListener("click",e=>{
		inputHandler.requestPointerLock();
	});
	inputHandler.onPointerLock(()=>{
		optionsMenu.hidden = true;
	});
	inputHandler.onExitPointerLock(()=>{
		optionsMenu.hidden = false;
	});
	optionsMenu.mass = 0.25;
	optionsMenu.steps = 250;
	optionsMenu.stepSize = 1;

	const renderer = new Renderer(canvas);
	const blackHole = new KerrNewmanBlackHole(new Vector3f(2,0,15));
	optionsMenu.onMassChange(mass=>{
		blackHole.mass = mass;
	});
	optionsMenu.onStepsChange(steps=>{
		renderer.steps = steps;
	});
	optionsMenu.onStepSizeChange(stepSize=>{
		renderer.stepSize = stepSize;
	});

	const camera = new Camera(inputHandler);
	camera.position.z = 12;
	camera.position.y = 0.25;
	camera.position.x = 1;
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
		optionsMenu.currentDistance = camera.position.distanceTo(blackHole.position);
		renderer.resize(window.innerWidth,window.innerHeight);
		renderer.render(camera,blackHole,inGameTime);
		fpsCounter.update();
	}
})();