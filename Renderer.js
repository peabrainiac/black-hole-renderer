import Vao from "./gl/VAO.js";
import MainShader from "./MainShader.js";
import Matrix4f from "./gl/Matrix4f.js";
import StarBox from "./StarBox.js";
import Matrix3f from "./gl/Matrix3f.js";
import Camera from "./Camera.js";
import Vector3f from "./gl/Vector3f.js";
import BlackHoleShader from "./BlackHoleShader.js";
import {KerrNewmanBlackHole} from "./BlackHoleNumerics.js";
import Framebuffer from "./gl/FrameBuffer.js";
import Texture, {Texture3D} from "./gl/Texture.js";

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
		this._gl.getExtension("EXT_color_buffer_float");
		this._gl.clearDepth(0);
		this._gl.depthFunc(this._gl.GREATER);
		this._projectionMatrix = Matrix4f.projectionMatrix(1.25,this._canvas.width/this._canvas.height,0.1,50);

		this._defaultBuffer = new Framebuffer(this._gl,this._canvas.width,this._canvas.height,null);

		/**
		 * framebuffer that objects like the teapot are first rendered to. contains one color buffer for the color of the objects (with the alpha channel encoding reflexivity),
		 * a second color buffer containing the direction of the reflected ray (with the alpha value encoding the length the ray already travelled before getting reflected),
		 * and a depth buffer.
		 */
		this._framebuffer = new Framebuffer(this._gl,this._canvas.width,this._canvas.height);
		this._colors = new Texture(this._gl);
		this._colors.setFormat(this._gl.RGBA8,this._gl.RGBA,this._canvas.width,this._canvas.height,this._gl.UNSIGNED_BYTE);
		this._framebuffer.attachTexture(this._colors,this._gl.COLOR_ATTACHMENT0);
		this._rayData = new Texture(this._gl);
		this._rayData.setFormat(this._gl.RGBA32F,this._gl.RGBA,this._canvas.width,this._canvas.height,this._gl.FLOAT);
		this._framebuffer.attachTexture(this._rayData,this._gl.COLOR_ATTACHMENT1);
		this._framebuffer.attachDepthBuffer();

		this._noiseTexture = Texture3D.getRandom(this._gl,64,64,64);
		this._gl.texParameterf(this._gl.TEXTURE_3D,this._gl.TEXTURE_MAG_FILTER,this._gl.LINEAR);
		this._cube = Vao.createCube(this._gl);
		this._starBox = new StarBox(this._gl);
		this._teapot = Vao.fromObjFile(this._gl,teatopModelFile);
		this._shader = new MainShader(this._gl);
		this._blackHoleSimulationRadius = 10;
		this._blackHoleShader = new BlackHoleShader(this._gl);
		this._steps = 100;
		this._stepSize = 1;
		this._accretionDiskEnabled = true;
		this._accretionDiskWidth = 1;
		this._accretionDiskHeight = 1;
	}

	/**
	 * Renders one frame to the canvas.
	 * @param {Camera} camera
	 * @param {KerrNewmanBlackHole} blackHole
	 * @param {number} t
	 */
	render(camera,blackHole,t){
		let viewMatrix = camera.viewMatrix;
		let viewDirection = viewMatrix.copy();
		viewDirection.m03 = 0;
		viewDirection.m13 = 0;
		viewDirection.m23 = 0;

		this._framebuffer.setSize(this._canvas.width,this._canvas.height);
		this._framebuffer.bind();
		this._gl.drawBuffers([this._gl.COLOR_ATTACHMENT0,this._gl.COLOR_ATTACHMENT1]);
		this._framebuffer.clearAttachment(0,0,0,0,0);
		this._framebuffer.clearAttachment(1,0,0,0,0);
		this._gl.clear(this._gl.DEPTH_BUFFER_BIT);

		this._gl.enable(this._gl.DEPTH_TEST);

		this._shader.use();
		this._shader.uniforms.viewProjection = this._projectionMatrix.copy().mul(viewMatrix);
		this._shader.uniforms.modelTransform = Matrix4f.transformationMatrix(new Matrix3f(0.25)/*.rotateExp(0,0.1*t,0.2*t)*/,new Vector3f(-1,0,0));
		this._shader.uniforms.cameraPosition = camera.position;
		this._starBox.cubeMap.bind();
		this._teapot.render();

		this._gl.disable(this._gl.DEPTH_TEST);

		this._defaultBuffer.setSize(this._canvas.width,this._canvas.height);
		this._defaultBuffer.bind();
		this._defaultBuffer.clearAttachment(0,1,0.25,0,0);

		this._blackHoleShader.use();
		this._blackHoleShader.uniforms.viewProjection = this._projectionMatrix.copy().mul(viewDirection);
		this._blackHoleShader.uniforms.centerPosition = blackHole.position;
		this._blackHoleShader.uniforms.cameraPosition = camera.position;
		this._blackHoleShader.uniforms.blackHoleMass = blackHole.mass;
		this._blackHoleShader.uniforms.innerAccretionDiskRadius = blackHole.photonSphereRadius;
		this._blackHoleShader.uniforms.outerAccretionDiskRadius = (1+2*(this._accretionDiskEnabled?this._accretionDiskWidth:0))*blackHole.photonSphereRadius;
		this._blackHoleShader.uniforms.accretionDiskHeight = 0.2*(this._accretionDiskEnabled?this._accretionDiskHeight:0)*blackHole.photonSphereRadius;
		this._blackHoleShader.uniforms.steps = this._steps;
		this._blackHoleShader.uniforms.stepSize = this._stepSize;
		this._blackHoleShader.uniforms.simulationRadius = this._blackHoleSimulationRadius;
		
		this._gl.activeTexture(this._gl.TEXTURE0);
		this._gl.bindTexture(this._gl.TEXTURE_2D,this._colors.id);
		this._gl.activeTexture(this._gl.TEXTURE1);
		this._gl.bindTexture(this._gl.TEXTURE_2D,this._rayData.id);
		this._gl.activeTexture(this._gl.TEXTURE2);
		this._starBox.cubeMap.bind()
		this._gl.activeTexture(this._gl.TEXTURE3);
		this._gl.bindTexture(this._gl.TEXTURE_3D,this._noiseTexture.id)
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
			this._projectionMatrix = Matrix4f.projectionMatrix(1.25,this._canvas.width/this._canvas.height,0.01,50);
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

	get accretionDiskEnabled(){
		return this._accretionDiskEnabled;
	}

	set accretionDiskEnabled(accretionDiskEnabled){
		this._accretionDiskEnabled = accretionDiskEnabled;
	}

	get accretionDiskWidth(){
		return this._accretionDiskWidth;
	}

	set accretionDiskWidth(accretionDiskWidth){
		this._accretionDiskWidth= accretionDiskWidth;
	}

	get accretionDiskHeight(){
		return this._accretionDiskHeight;
	}

	set accretionDiskHeight(accretionDiskHeight){
		this._accretionDiskHeight= accretionDiskHeight;
	}
}