import Matrix3f from "./Matrix3f.js";
import Vector3f from "./Vector3f.js";

/**
 * A simple wrapper for vertex array objects. Partly copied from https://github.com/peabrainiac/peabrainiac.github.io/tree/master/js/gl.
 */
export default class Vao {
	
	/**
	 * Constructs a new empty VAO.
	 * @param {WebGL2RenderingContext} gl
	 */
	constructor(gl){
		this._gl = gl;
		this._id = gl.createVertexArray();
		/** @type {WebGLBuffer[]} */
		this._vbos = [];
		this._vertexCount = 0;
	}

	bind(){
		this._gl.bindVertexArray(this._id);
	}

	render(){
		this.bind();
		if (this._indexBuffer){
			this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER,this._indexBuffer);
			this._gl.drawElements(this._gl.TRIANGLES,this._vertexCount,this._gl.UNSIGNED_SHORT,0);
		}else{
			this._gl.drawArrays(this._gl.TRIANGLES,0,this._vertexCount);
		}
	}
	
	/**
	 * @param {number} location
	 * @param {number} dimensionality
	 * @param {number[]} data
	 */
	addVbo(location,dimensionality,data){
		let vbo = this._gl.createBuffer();
		this._gl.bindBuffer(this._gl.ARRAY_BUFFER,vbo);
		this._gl.bindVertexArray(this._id);
		this._gl.vertexAttribPointer(location,dimensionality,this._gl.FLOAT,false,0,0);
		this._gl.enableVertexAttribArray(location);
		this._gl.bufferData(this._gl.ARRAY_BUFFER,new Float32Array(data),this._gl.STATIC_DRAW);
		this._vbos.push(vbo);
		if (location==0&&!this._indexBuffer){
			this._vertexCount = data.length/dimensionality;
		}
	}

	/**
	 * Attaches a index buffer to the vao. Should only be called once.
	 * @param {number[]} indices
	 */
	addIndexBuffer(indices){
		if (this._indexBuffer){
			throw new Error("There is already an index buffer attached to this vao.");
		}
		let indexBuffer = this._gl.createBuffer();
		this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
		this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),this._gl.STATIC_DRAW);
		this._indexBuffer = indexBuffer;
		this._vertexCount = indices.length;
	}

	destroy(){
		for (let i=0;i<this._vbos.length;i++){
			this._gl.deleteBuffer(this._vbos[i]);
		}
		this._gl.deleteVertexArray(this._id);
	}

	get id(){
		return this._id;
	}

	/**
	 * @param {WebGL2RenderingContext} gl
	 * @param {(p:[number,number,number])=>[number,number,number]} [transform]
	 */
	static createQuad(gl,transform=(p=>p)){
		let vao = new Vao(gl);
		//vao.addVbo(0,3,[[-1,-1,0],[-1,1,0],[1,-1,0],[1,-1,0],[-1,1,0],[1,1,0]].map(transform).flat());
		vao.addVbo(0,3,[[-1,-1,0],[-1,1,0],[1,-1,0],[1,1,0]].map(transform).flat());
		vao.addIndexBuffer([0,1,2,2,1,3]);
		return vao;
	}

	/**
	 * @param {WebGL2RenderingContext} gl
	 * @param {Matrix3f} [transform]
	 */
	static createCube(gl,transform=new Matrix3f()){
		let vao = new Vao(gl);
		let points = [];
		let normals = [];
		let indices = [];
		for (let faceTransform of [new Matrix3f(),new Matrix3f([1,-1,-1]),new Matrix3f([1,0,0,0,0,1,0,-1,0]),new Matrix3f([1,0,0,0,0,-1,0,1,0]),new Matrix3f([0,0,1,0,1,0,-1,0,0]),new Matrix3f([0,0,-1,0,1,0,1,0,0])]){
			points.push(...[[1,1,1],[-1,1,1],[-1,-1,1],[1,-1,1]].map(([x,y,z])=>transform.mulVec(faceTransform.mulVec(new Vector3f(x,y,z)))).map(v=>[v.x,v.y,v.z]));
			normals.push(...[[0,0,1],[0,0,1],[0,0,1],[0,0,1]].map(([x,y,z])=>transform.mulVec(faceTransform.mulVec(new Vector3f(x,y,z)))).map(v=>[v.x,v.y,v.z]));
			indices.push(...[2,1,0,0,3,2].map(i=>i+points.length-4));
		}
		vao.addVbo(0,3,points.flat());
		vao.addVbo(1,3,normals.flat());
		vao.addIndexBuffer(indices);
		//vao.addVbo(0,3,[[1,1,1],[1,1,-1],[1,-1,1],[1,-1,-1],[-1,1,1],[-1,1,-1],[-1,-1,1],[-1,-1,-1]].map(([x,y,z])=>transform.mulVec(new Vector3f(x,y,z))).map(v=>[v.x,v.y,v.z]).flat());
		//vao.addIndexBuffer([5,7,3,3,1,5,6,7,5,5,4,6,3,2,0,0,1,3,6,4,0,0,2,6,5,1,0,0,4,5,7,6,3,3,6,2]);
		return vao;
	}
}