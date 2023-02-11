import CubeMap from "./gl/CubeMap.js";
import VAO from "./gl/VAO.js";
import Matrix4f from "./gl/Matrix4f.js";
import ShaderProgram from "./gl/ShaderProgram.js";

/** @type {HTMLImageElement} */
const starMap = await new Promise(resolve=>{
	let img = document.createElement("img");
	img.onload = ()=>resolve(img);
	img.src = "./res/starmap_2020_4k.png";
});

/**
 * Like a skybox, but with stars.
 */
export default class StarBox {
	/**
	 * @param {WebGL2RenderingContext} gl
	 */
	constructor(gl){
		this._gl = gl;
		this._cube = VAO.createCube(gl);
		this._shader = new StarBoxShader(gl);
		this._cubeMap = CubeMap.fromEquirectangularProjection(this._gl,starMap);
		this._gl.generateMipmap(this._gl.TEXTURE_CUBE_MAP);
		this._gl.texParameteri(this._gl.TEXTURE_CUBE_MAP,this._gl.TEXTURE_MIN_FILTER,this._gl.LINEAR_MIPMAP_LINEAR);
	}

	/**
	 * @param {Matrix4f} viewMatrix
	 * @param {Matrix4f} projectionMatrix
	 */
	render(viewMatrix,projectionMatrix){
		let viewDirection = viewMatrix.copy();
		viewDirection.m03 = 0;
		viewDirection.m13 = 0;
		viewDirection.m23 = 0;
		this._shader.use();
		this._shader.uniforms.viewProjection = projectionMatrix.copy().mul(viewDirection);
		this._cubeMap.bind();
		this._cube.render();
	}

	/** @readonly */
	get cubeMap(){
		return this._cubeMap;
	}
}

const vertexSource = /* glsl */`
	#version 300 es
	precision highp float;

	in vec3 position;

	out vec3 pass_position;

	uniform mat4 viewProjection;

	void main(void){
		pass_position = position;
		gl_Position = viewProjection*vec4(position,1.0);
	}
`;

const fragmentSource = /* glsl */ `
	#version 300 es
	precision highp float;

	in vec3 pass_position;

	out vec4 out_color;

	uniform samplerCube cubeMap;

	void main(void){
		out_color = texture(cubeMap,pass_position);
	}
`;

/**
 * @extends {ShaderProgram<{viewProjection:Matrix4f},{}>}
 */
class StarBoxShader extends ShaderProgram {
	/**
	 * @param {WebGL2RenderingContext} gl
	 */
	constructor(gl){
		super(gl,vertexSource,fragmentSource,{attribs:["position"],textures:["cubeMap"]});
	}
}