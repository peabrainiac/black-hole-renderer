import Vao from "./gl/VAO.js";
import MainShader from "./MainShader.js";
import Matrix4f from "./gl/Matrix4f.js";
import StarBox from "./StarBox.js";
import Matrix3f from "./gl/Matrix3f.js";
import Camera from "./Camera.js";

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
		this._gl = canvas.getContext("webgl2");
		this._gl.enable(this._gl.DEPTH_TEST);
		this._gl.clearDepth(0);
		this._gl.depthFunc(this._gl.GREATER);
		this._gl.clearColor(0.4,0.2,0,1);
		this._cube = Vao.createCube(this._gl,new Matrix3f(0.5));
		this._shader = new MainShader(this._gl);
		this._starBox = new StarBox(this._gl);

		this._gl.viewport(0,0,this._canvas.width,this._canvas.height);
		this._projectionMatrix = Matrix4f.projectionMatrix(1.25,this._canvas.width/this._canvas.height,0.1,10);
	}

	/**
	 * Renders one frame to the canvas.
	 * @param {Camera} camera
	 */
	render(camera){
		let viewMatrix = camera.viewMatrix;
		this._gl.clear(this._gl.COLOR_BUFFER_BIT|this._gl.DEPTH_BUFFER_BIT);
		this._starBox.render(viewMatrix,this._projectionMatrix);
		this._gl.clear(this._gl.DEPTH_BUFFER_BIT);
		
		this._shader.use();
		this._shader.uniforms.viewProjection = this._projectionMatrix.copy().mul(viewMatrix);
		this._shader.uniforms.cameraPosition = camera.position;
		this._starBox.cubeMap.bind();
		this._cube.render();
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
			this._projectionMatrix = Matrix4f.projectionMatrix(1.25,this._canvas.width/this._canvas.height,0.1,10);
		}
	}
}