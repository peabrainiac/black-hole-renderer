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

	/**
	 * Creates a vertex array object from a .obj file, given as a string. The way it is inplemented currently, only vertex and index positions are taken from the file,
	 * normals are computed by averaging the normals of the triangles a vertex appears in, and texture coordinates are ignored.
	 * @param {WebGL2RenderingContext} gl
	 * @param {string} fileContents
	 */
	static fromObjFile(gl,fileContents){
		// extracts vertices and faces from the file and computes normals
		let lines = fileContents.split("\n");
		let vertices = lines.filter(line=>line.startsWith("v ")).map(line=>line.split(" ").slice(1)).map(([x,y,z])=>new Vector3f(parseFloat(x),parseFloat(y),parseFloat(z)));
		let faces = lines.filter(line=>line.startsWith("f ")).map(line=>line.split(" ").slice(1)).map(([i0,i1,i2])=>[parseInt(i0)-1,parseInt(i1)-1,parseInt(i2)-1]);
		/** @type {number[][][]} */
		let vertexFaces = vertices.map(()=>[]);faces.forEach(face=>face.forEach(i=>vertexFaces[i].push(face)));
		let normals = vertexFaces.map(faces=>faces.map(([i0,i1,i2])=>vertices[i1].copy().sub(vertices[i0]).crossProd(vertices[i2].copy().sub(vertices[i0])).normalize()).reduce((n1,n2)=>n1.add(n2)).normalize());

		// checks for duplicate vertices with similar normals, and merges them together
		for (let i=0;i<vertices.length;i++){
			let v = vertices[i];
			/** @type {number[]} */
			let duplicates = [];
			for (let i2=i+1;i2<vertices.length;i2++){
				if (v.distanceTo(vertices[i2])<0.001&&normals[i].dotProd(normals[i2])>0.5){
					duplicates.push(i2);
				}
			}
			if (duplicates.length>0){
				normals[i] = [normals[i],...duplicates.map(i2=>normals[i2])].reduce((n1,n2)=>n1.add(n2)).normalize();
				faces = faces.map(f=>f.map(i2=>duplicates.includes(i2)?i:i2));
			}
		}

		// sends the data to the gpu
		let vao = new Vao(gl);
		vao.addVbo(0,3,vertices.map(v=>[v.x,v.y,v.z]).flat());
		vao.addVbo(1,3,normals.map(n=>[n.x,n.y,n.z]).flat());
		vao.addIndexBuffer(faces.flat());
		return vao;
	}
}