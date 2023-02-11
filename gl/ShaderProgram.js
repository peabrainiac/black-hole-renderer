import Matrix3f from "./Matrix3f.js";
import Matrix4f from "./Matrix4f.js";
import Vector3f from "./Vector3f.js";


/**
 * A wrapper for shader programs. Copied from https://github.com/peabrainiac/peabrainiac.github.io/tree/master/js/gl.
 * 
 * For conveniece, uniforms are mirrored in `.uniforms`. Note that this doesn't work perfectly though; uniforms are only uploaded
 * to the gpu when they are assigned to `.uniforms`, not when their properties change. Their TypeScript type is also only given as
 * a template type `T`, and can't be auto-detected from the shader source code.
 * @template T
 * @template F
 */
export default class ShaderProgram {
	/**
	 * Creates and compiles a new vertex and fragment shader pair shader from its source.
	 * @param {WebGL2RenderingContext} gl
	 * @param {string} vertexSource
	 * @param {string} fragmentSource
	 * @param {{attribs?:string[],textures?:string[],flags?:F}} [options]
	 */
	constructor(gl,vertexSource,fragmentSource,options){
		this._gl = gl;
		this._vertexSource = vertexSource;
		this._fragmentSource = fragmentSource;
		this._vertexShader = new Shader(gl,gl.VERTEX_SHADER);
		this._fragmentShader = new Shader(gl,gl.FRAGMENT_SHADER);
		this._id = gl.createProgram();
		gl.attachShader(this._id,this._vertexShader.id);
		gl.attachShader(this._id,this._fragmentShader.id);
		this._uniformLocations = {};
		this._uniformTypes = {};
		/** @type {T} */
		// @ts-ignore
		this.uniforms = new Proxy({},{set:(target,property,value,receiver)=>{
			// @ts-ignore
			target[property] = value;
			if (this._isReady){
				// @ts-ignore
				this.load(property,value);
			}
			return true;
		}});
		/** @type {F} */
		// @ts-ignore
		this.flags = new Proxy(options.flags||{},{set:(target,property,value,receiver)=>{
			// @ts-ignore
			if (target[property]!=value){
				// @ts-ignore
				target[property] = value;
				if (this._isReady){
					this.compile(this._vertexSource,this._fragmentSource);
				}
			}
			return true;
		}});
		this._attribs = options.attribs;
		this._textures = options.textures;
		this._isReady = false;
		if (vertexSource&&fragmentSource){
			this.compile(vertexSource,fragmentSource);
		}
	}

	/**
	 * Fetches, creates and compiles a shader program.
	 * @param {WebGL2RenderingContext} gl
	 * @param {string} vertexPathOrSource
	 * @param {string} fragmentPathOrSource
	 * @param {{attribs?:string[],textures?:string[]}} options
	 * @template T
	 * @template F
	 * @returns {Promise<ShaderProgram<T,F>>}
	 */
	static async fetch(gl,vertexPathOrSource,fragmentPathOrSource,options){
		let vertexSource = /^.*$/.test(vertexPathOrSource)?(await (await fetch(vertexPathOrSource)).text()):vertexPathOrSource;
		let fragmentSource = /^.*$/.test(fragmentPathOrSource)?(await (await fetch(fragmentPathOrSource)).text()):fragmentPathOrSource;
		return new ShaderProgram(gl,vertexSource,fragmentSource,options);
	}

	/**
	 * @param {string} vertexSource
	 * @param {string} fragmentSource
	 */
	compile(vertexSource,fragmentSource){
		this._vertexSource = vertexSource;
		this._fragmentSource = fragmentSource;
		// @ts-ignore
		let flags = Object.getOwnPropertyNames(this.flags).filter((flag)=>(this.flags[flag]));
		console.log((this._isReady?"Rec":"C")+"ompiling shader! Active flags:",flags);
		let flagString = (flags.length?"\n#define "+flags.join("\n#define "):"")+"\n";
		this._vertexShader.compile(vertexSource.replace("\n",flagString));
		this._fragmentShader.compile(fragmentSource.replace("\n",flagString));
		this._gl.linkProgram(this._id);
		if (!this._gl.getProgramParameter(this._id,this._gl.LINK_STATUS)){
			this._isReady = false;
			throw new Error("Could not link shader program!\n"+this._gl.getProgramInfoLog(this._id));
		}else{
			this._isReady = true;
		}
		this._gl.useProgram(this._id);
		/** @type {{[name:string]:WebGLUniformLocation}} */
		this._uniformLocations = {};
		/** @type {{[name:string]:number}} */
		this._uniformTypes = {};
		/** @type {{[name:string]:string}} */
		this._uniformNames = {};
		let count = this._gl.getProgramParameter(this._id,this._gl.ACTIVE_UNIFORMS);
		let infos = [];
		for (let i=0;i<count;i++){
			let info = this._gl.getActiveUniform(this._id,i);
			let name = info.name.match(/^[^[]*/)[0];
			this._uniformTypes[name] = info.type;
			this._uniformNames[name] = info.name;
			this._uniformLocations[name] = this._gl.getUniformLocation(this._id,name);
			infos.push(info);
		}
		console.log("Active Uniforms:",infos);
		let uniforms = Object.getOwnPropertyNames(this.uniforms);
		for (let i=0;i<uniforms.length;i++){
			// @ts-ignore
			this.load(uniforms[i],this.uniforms[uniforms[i]]);
		}
		if (this._attribs){
			for (let i=0;i<this._attribs.length;i++){
				this.bindAttribLocation(i,this._attribs[i]);
			}
		}
		if (this._textures){
			for (let i=0;i<this._textures.length;i++){
				this.bindTextureLocation(i,this._textures[i]);
			}
		}
	}

	get isReady(){
		return this._isReady;
	}

	use(){
		this._gl.useProgram(this._id);
	}

	/**
	 * @param {number} location
	 * @param {string} name
	 */
	bindAttribLocation(location,name){
		this._gl.bindAttribLocation(this._id,location,name);
	}

	/**
	 * @param {number} location
	 * @param {string} name
	 */
	bindTextureLocation(location,name){
		this.loadInt(name,location);
	}

	/**
	 * @param {string} name
	 * @param {number|Vector3f|Matrix3f|Matrix4f} value
	 */
	load(name,value){
		let type = this._uniformTypes[name];
		if (type==this._gl.INT&&typeof value==="number"){
			this.loadInt(name,value);
		}else if(type==this._gl.FLOAT&&typeof value==="number"){
			this.loadFloat(name,value);
		}/*else if(type==this._gl.FLOAT_VEC2){
			this.loadVector2f(name,value);
		}*/else if(type==this._gl.FLOAT_VEC3&&value instanceof Vector3f){
			/*if (this._uniformNames[name].endsWith("[0]")){
				this.loadVector3fArray(name,value);
			}else{*/
			this.loadVector3f(name,value);
			//}
		}else if(type==this._gl.FLOAT_MAT3&&value instanceof Matrix3f){
			this.loadMatrix3f(name,value);
		}else if(type==this._gl.FLOAT_MAT4&&value instanceof Matrix4f){
			this.loadMatrix4f(name,value);
		}else{
			//console.warn("Error loading uniform! Name:",name,", type:",type,", value:",value);
		}
	}

	/**
	 * @param {string} name
	 * @param {number} value
	 */
	loadInt(name,value){
		this._gl.uniform1i(this._uniformLocations[name],value);
	}

	/**
	 * @param {string} name
	 * @param {number} value
	 */
	loadFloat(name,value){
		this._gl.uniform1f(this._uniformLocations[name],value);
	}

	/**
	 * @param {string} name
	 * @param {{x:number,y:number}} vector
	 */
	loadVector2f(name,vector){
		this._gl.uniform2f(this._uniformLocations[name],vector.x,vector.y);
	}

	/**
	 * @param {string} name
	 * @param {Vector3f} vector
	 */
	loadVector3f(name,vector){
		this._gl.uniform3f(this._uniformLocations[name],vector.x,vector.y,vector.z);
	}

	/**
	 * @param {string} name
	 * @param {Matrix3f} matrix
	 */
	loadMatrix3f(name,matrix){
		this._gl.uniformMatrix3fv(this._uniformLocations[name],false,matrix.toArray());
	}

	/**
	 * @param {string} name
	 * @param {Matrix4f} matrix
	 */
	loadMatrix4f(name,matrix){
		this._gl.uniformMatrix4fv(this._uniformLocations[name],false,matrix.toArray());
	}

	/*loadVector3fArray(name,vectors){
		let array = new Float32Array(3*vectors.length);
		for (let i=0;i<vectors.length;i++){
			array[3*i] = vectors[i].x;
			array[3*i+1] = vectors[i].y;
			array[3*i+2] = vectors[i].z;
		}
		this._gl.uniform3fv(this._uniformLocations[name],array);
	}*/
}

/**
 * A simple wrapper for individual shaders, i.e. a single vertex shader or a single fragment shader.
 */
export class Shader {
	/**
	 * Creates a new shader, and compiles it if also given the source.
	 * @param {WebGL2RenderingContext} gl
	 * @param {number} type
	 * @param {string} [source]
	 */
	constructor(gl,type,source){
		this._gl = gl;
		this._id = gl.createShader(type);
		this._isReady = false;
		if (source){
			this.compile(source);
		}
	}

	/**
	 * Compiles the shader from the given source.
	 * @param {string} source
	 */
	compile(source){
		this._gl.shaderSource(this._id,source.trim());
		this._gl.compileShader(this._id);
		if (!this._gl.getShaderParameter(this._id,this._gl.COMPILE_STATUS)){
			this._isReady = false;
			throw new Error("Could not compile shader!\n"+this._gl.getShaderInfoLog(this._id));
		}else{
			this._isReady = true;
		}
	}

	get id(){
		return this._id;
	}

	get isReady(){
		return this._isReady;
	}
}