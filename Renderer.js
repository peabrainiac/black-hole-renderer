import Vao from "./gl/VAO.js";
import MainShader from "./MainShader.js";
import Matrix4f from "./gl/Matrix4f.js";
import StarBox from "./StarBox.js";
import Matrix3f from "./gl/Matrix3f.js";
import Camera from "./Camera.js";
import Vector3f from "./gl/Vector3f.js";
import BlackHoleShader from "./BlackHoleShader.js";
import {KerrNewmanBlackHole} from "./BlackHoleNumerics.js";

const teatopModelFile = await (await fetch("./res/teapot.obj")).text()

/**
 * The main class responsible for rendering to the WebGL canvas.
 */
export default class Renderer {
	/**
	 * Initializes the renderer for the given canvas.
	 * @param {HTMLCanvasElement} canvas
	 */
	constructor(canvas){
		this._canvas = canvas;
		this._gl = canvas.getContext("webgl2",{preserveDrawingBuffer:true});
		this._gl.enable(this._gl.DEPTH_TEST);
		this._gl.clearDepth(0);
		this._gl.depthFunc(this._gl.GREATER);
		this._gl.clearColor(0.4,0.2,0,1);
		this._projectionMatrix = Matrix4f.projectionMatrix(1.25,this._canvas.width/this._canvas.height,0.1,50);

		this._starBox = new StarBox(this._gl);
		this._teapot = Vao.fromObjFile(this._gl,teatopModelFile);
		this._shader = new MainShader(this._gl);
		this._blackHoleSimulationRadius = 10;
		this._blackHoleCube = Vao.createCube(this._gl,new Matrix3f());
		this._blackHoleShader = new BlackHoleShader(this._gl);
		this._steps = 100;
		this._stepSize = 1;
	}

	/**
	 * Renders one frame to the canvas.
	 * @param {Camera} camera
	 * @param {KerrNewmanBlackHole} blackHole
	 * @param {number} t
	 */
	render(camera,blackHole,t){
		let viewMatrix = camera.viewMatrix;
		this._gl.viewport(0,0,this._canvas.width,this._canvas.height);
		this._gl.clear(this._gl.COLOR_BUFFER_BIT|this._gl.DEPTH_BUFFER_BIT);
		this._starBox.render(viewMatrix,this._projectionMatrix);
		this._gl.clear(this._gl.DEPTH_BUFFER_BIT);
		
		this._shader.use();
		this._shader.uniforms.viewProjection = this._projectionMatrix.copy().mul(viewMatrix);
		this._shader.uniforms.modelTransform = Matrix4f.transformationMatrix(new Matrix3f(0.1)/*.rotateExp(0,0.1*t,0.2*t)*/,new Vector3f(-1,0,0));
		this._shader.uniforms.cameraPosition = camera.position;
		this._starBox.cubeMap.bind();
		this._teapot.render();

		this._blackHoleShader.use();
		this._blackHoleShader.uniforms.viewProjection = this._projectionMatrix.copy().mul(viewMatrix);
		this._blackHoleShader.uniforms.centerPosition = blackHole.position;
		this._blackHoleShader.uniforms.cameraPosition = camera.position;
		this._blackHoleShader.uniforms.blackHoleMass = blackHole.mass;
		this._blackHoleShader.uniforms.steps = this._steps;
		this._blackHoleShader.uniforms.stepSize = this._stepSize;
		this._blackHoleShader.uniforms.simulationRadius = this._blackHoleSimulationRadius;
		this._starBox.cubeMap.bind();
		this._blackHoleCube.render();
		//console.log(Math.hypot(camera.position.x-2,camera.position.y,camera.position.z-15));
	}

	/**
	 * Changes the resolution of the canvas to the given width and size, if it isn't already that.
	 * @param {number} width
	 * @param {number} height
	 */
	resize(width,height){
		if (this._canvas.width!=width||this._canvas.height!=height){
			console.log(`resizing canvas from ${this._canvas.width}x${this._canvas.height} to ${width}x${height}`)
			this._canvas.width = width;
			this._canvas.height = height;
			this._gl.viewport(0,0,this._canvas.width,this._canvas.height);
			this._projectionMatrix = Matrix4f.projectionMatrix(1.25,this._canvas.width/this._canvas.height,0.1,50);
		}
	}

	get steps(){
		return this._steps;
	}

	set steps(steps){
		this._steps = steps;
	}

	get stepSize(){
		return this._stepSize;
	}

	set stepSize(stepSize){
		this._stepSize = stepSize;
	}
}