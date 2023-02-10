export default class Texture {
	/**
	 * @param {WebGL2RenderingContext} gl
	 * @param {number} [width]
	 * @param {number} [height]
	 * @param {ArrayBufferView} [data]
	 */
	constructor(gl,width=0,height=0,data=null){
		this._gl = gl;
		this._id = gl.createTexture();
		this._gl.bindTexture(this._gl.TEXTURE_2D,this._id);
		gl.texParameterf(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
		gl.texParameterf(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
		this.setFormat(gl.RGBA8,gl.RGBA,width,height,gl.UNSIGNED_BYTE,data);
	}

	/**
	 * @param {number} internalFormat
	 * @param {number} format
	 * @param {number} width
	 * @param {number} height
	 * @param {number} type
	 * @param {ArrayBufferView} data
	 */
	setFormat(internalFormat,format,width=this._width,height=this._height,type=this._type,data=null){
		this._gl.bindTexture(this._gl.TEXTURE_2D,this._id);
		this._gl.texImage2D(this._gl.TEXTURE_2D,0,internalFormat,width,height,0,format,type,data);
		this._width = width;
		this._height = height;
		this._internalFormat = internalFormat;
		this._format = format;
        this._type = type;
		console.log("Set texture size to "+width+"x"+height);
	}
	
	/**
	 * @param {number} width
	 * @param {number} height
	 */
	setSize(width,height){
		if (this._width!=width||this._height!=height){
			this.setFormat(this._internalFormat,this._format,width,height);
		}
	}

	/** @readonly */
	get id(){
		return this._id;
	}

	delete(){
		this._gl.deleteTexture(this._id);
	}
}

export class Texture3D {
	/**
	 * @param {WebGL2RenderingContext} gl
	 * @param {number} [width]
	 * @param {number} [height]
	 * @param {number} [depth]
	 * @param {ArrayBufferView} [data]
	 */
	constructor(gl,width=0,height=0,depth=0,data=null){
		this._gl = gl;
		this._id = gl.createTexture();
		this._gl.bindTexture(this._gl.TEXTURE_3D,this._id);
		gl.texParameterf(gl.TEXTURE_3D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
		gl.texParameterf(gl.TEXTURE_3D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
		this.setFormat(gl.RGBA8,gl.RGBA,width,height,depth,gl.UNSIGNED_BYTE,data);
	}

	/**
	 * @param {number} internalFormat
	 * @param {number} format
	 * @param {number} width
	 * @param {number} height
	 * @param {number} depth
	 * @param {number} type
	 * @param {ArrayBufferView} data
	 */
	setFormat(internalFormat,format,width=this._width,height=this._height,depth=this._depth,type=this._type,data=null){
		this._gl.bindTexture(this._gl.TEXTURE_3D,this._id);
		this._gl.texImage3D(this._gl.TEXTURE_3D,0,internalFormat,width,height,depth,0,format,type,data);
		this._width = width;
		this._height = height;
		this._depth = depth;
		this._internalFormat = internalFormat;
		this._format = format;
        this._type = type;
		console.log("Set texture size to "+width+"x"+height+"x"+depth);
	}

	/**
	 * @param {number} width
	 * @param {number} height
	 * @param {number} depth
	 */
	setSize(width,height,depth){
		if (this._width!=width||this._height!=height||this._depth!=depth){
			this.setFormat(this._internalFormat,this._format,width,height,depth);
		}
	}

	/** @readonly */
	get id(){
		return this._id;
	}

	delete(){
		this._gl.deleteTexture(this._id);
	}

	/**
	 * Creates a texture of the given format and fills it with completely random bytes.
	 * @param {WebGL2RenderingContext} gl
	 * @param {number} width
	 * @param {number} height
	 * @param {number} depth
	 */
	static getRandom(gl,width,height,depth){
		let t = Date.now();
		// different views of the same memory, used to access the bytes of the floating point numbers produced by `Math.random()`, 4 bytes at a time
		let singleFloat64 = new Float64Array(1);
		let singleFloatParts = new Uint32Array(singleFloat64.buffer);
		// data to be written to the texture, viewed as 32-bit-ints to write 4 bytes at a time
		let data = new Uint32Array(width*height*depth);
		for (let i=0;i<data.length;i++){
			singleFloat64[0] = 1048576+Math.random(); // just don't ask
			data[i] = singleFloatParts[0];
		}
		//console.log("generated random data in:",Date.now()-t,Array.from(data,n=>n.toString(2).padStart(32,"0")));
		//console.log(Array.from({length:32},(x,i)=>i).map(i=>Array.from(data).filter(n=>(n>>>i)%2==0).length/data.length));
		return new Texture3D(gl,width,height,depth,new Uint8Array(data.buffer));
	}
}