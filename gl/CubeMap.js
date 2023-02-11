import Matrix3f from "./Matrix3f.js";
import ShaderProgram from "./ShaderProgram.js";
import Vao from "./Vao.js";

/**
 * Simple wrapper class for cube maps.
 */
export default class CubeMap {
	/**
	 * @param {WebGL2RenderingContext} gl
	 */
	constructor(gl){
		this._gl = gl;
		this._id = gl.createTexture();
		this.bind();
	}

	bind(){
		this._gl.bindTexture(this._gl.TEXTURE_CUBE_MAP,this._id);
	}

	/**
	 * @param {number} face
	 * @param {ImageData|HTMLImageElement|HTMLCanvasElement} image
	 */
	drawToFace(face,image){
		this._gl.texImage2D(face,0,this._gl.RGBA,this._gl.RGBA,this._gl.UNSIGNED_BYTE,image);
	}

	/**
	 * @param {WebGL2RenderingContext} gl
	 * @param {HTMLImageElement|HTMLCanvasElement} image
	 */
	static fromEquirectangularProjection(gl,image){
		const resolution = 2048;
		const faces = [
			{face:gl.TEXTURE_CUBE_MAP_POSITIVE_X,rotation:new Matrix3f()},
			{face:gl.TEXTURE_CUBE_MAP_NEGATIVE_X,rotation:new Matrix3f([-1,0,0,0,1,0,0,0,-1])},
			{face:gl.TEXTURE_CUBE_MAP_POSITIVE_Y,rotation:new Matrix3f([0,0,1,-1,0,0,0,-1,0])},
			{face:gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,rotation:new Matrix3f([0,0,1,1,0,0,0,1,0])},
			{face:gl.TEXTURE_CUBE_MAP_POSITIVE_Z,rotation:new Matrix3f([0,0,1,0,1,0,-1,0,0])},
			{face:gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,rotation:new Matrix3f([0,0,-1,0,1,0,1,0,0])}
		];
		let cubeMap = new CubeMap(gl);
		let texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D,texture);
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);

		for (let face of [gl.TEXTURE_CUBE_MAP_NEGATIVE_X,gl.TEXTURE_CUBE_MAP_POSITIVE_X,gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,gl.TEXTURE_CUBE_MAP_POSITIVE_Y,gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,gl.TEXTURE_CUBE_MAP_POSITIVE_Z]){
			gl.texImage2D(face,0,gl.RGBA,resolution,resolution,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
		}

		/** @type {ShaderProgram<{rotation:Matrix3f},{}>} */
		let shader = new ShaderProgram(gl,/*glsl*/`
			#version 300 es
			precision highp float;
		
			in vec3 position;

			out vec3 pass_position;

			uniform mat3 rotation;
		
			void main(void){
				pass_position = rotation*vec3(position.xy,1.0);
				gl_Position = vec4(position.xy,0.0,1.0);
			}
		`,/*glsl*/`
			#version 300 es
			precision highp float;

			in vec3 pass_position;

			out vec4 out_color;

			uniform sampler2D map;

			const float pi = 3.14159265;

			void main(void){
				vec3 p = normalize(pass_position);
				out_color = texture(map,vec2(atan(p.y,p.x)/(2.0*pi)+0.5,acos(p.z)/pi));
			}
		`,{textures:["map"]});
		let framebuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,framebuffer);
		gl.viewport(0,0,resolution,resolution);
		let vao = Vao.createQuad(gl);
		for (let {face,rotation} of faces){
			gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER,gl.COLOR_ATTACHMENT0,face,cubeMap._id,0);
			shader.uniforms.rotation = rotation;
			vao.render();
		}
		gl.deleteTexture(texture);
		// TODO shader.destroy();
		gl.deleteFramebuffer(framebuffer);
		vao.destroy();
		return cubeMap;
	}
}