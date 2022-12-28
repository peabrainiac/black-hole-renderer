export default class Matrix4f {
	/**
	 * @param {number|[number,number,number,number]|[number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number]} [data]
	 */
	constructor(data=1){
		let temp = data instanceof Array?(data.length==16?data:[data[0],0,0,0,0,data[1],0,0,0,0,data[2],0,0,0,0,data[3]]):[data,0,0,0,0,data,0,0,0,0,data,0,0,0,0,data];
		this.m00 = temp[0];
		this.m10 = temp[1];
		this.m20 = temp[2];
		this.m30 = temp[3];
		this.m01 = temp[4];
		this.m11 = temp[5];
		this.m21 = temp[6];
		this.m31 = temp[7];
		this.m02 = temp[8];
		this.m12 = temp[9];
		this.m22 = temp[10];
		this.m32 = temp[11];
		this.m03 = temp[12];
		this.m13 = temp[13];
		this.m23 = temp[14];
		this.m33 = temp[15];
	}

	copy(){
		return new Matrix4f([this.m00,this.m10,this.m20,this.m30,this.m01,this.m11,this.m21,this.m31,this.m02,this.m12,this.m22,this.m32,this.m03,this.m13,this.m23,this.m33]);
	}

	/**
	 * Returns the transpose of this matrix.
	 */
	getTranspose(){
		return new Matrix4f([this.m00,this.m01,this.m02,this.m03,this.m10,this.m11,this.m12,this.m13,this.m20,this.m21,this.m22,this.m23,this.m30,this.m31,this.m32,this.m33]);
	}

	/**
	 * Multiplies this matrix by the given scalar.
	 * @param {number} a
	 */
	scale(a){
		this.m00 *= a;
		this.m10 *= a;
		this.m20 *= a;
		this.m30 *= a;
		this.m01 *= a;
		this.m11 *= a;
		this.m21 *= a;
		this.m31 *= a;
		this.m02 *= a;
		this.m12 *= a;
		this.m22 *= a;
		this.m32 *= a;
		this.m03 *= a;
		this.m13 *= a;
		this.m23 *= a;
		this.m33 *= a;
		return this;
	}

	/**
	 * Adds the given matrix to this one.
	 * @param {Matrix4f} m
	 */
	add(m){
		this.m00 += m.m00;
		this.m01 += m.m01;
		this.m02 += m.m02;
		this.m03 += m.m03;
		this.m10 += m.m10;
		this.m11 += m.m11;
		this.m12 += m.m12;
		this.m13 += m.m13;
		this.m20 += m.m20;
		this.m21 += m.m21;
		this.m22 += m.m22;
		this.m23 += m.m23;
		this.m30 += m.m30;
		this.m31 += m.m31;
		this.m32 += m.m32;
		this.m33 += m.m33;
		return this;
	}

	/**
	 * Multiplies this matrix by the given one, from the right.
	 * @param {Matrix4f} m
	 */
	mul(m){
		let a = this.copy();
		let b = m.copy();
		this.m00 = a.m00*b.m00+a.m01*b.m10+a.m02*b.m20+a.m03*b.m30;
		this.m10 = a.m10*b.m00+a.m11*b.m10+a.m12*b.m20+a.m13*b.m30;
		this.m20 = a.m20*b.m00+a.m21*b.m10+a.m22*b.m20+a.m23*b.m30;
		this.m30 = a.m30*b.m00+a.m31*b.m10+a.m32*b.m20+a.m33*b.m30;
		this.m01 = a.m00*b.m01+a.m01*b.m11+a.m02*b.m21+a.m03*b.m31;
		this.m11 = a.m10*b.m01+a.m11*b.m11+a.m12*b.m21+a.m13*b.m31;
		this.m21 = a.m20*b.m01+a.m21*b.m11+a.m22*b.m21+a.m23*b.m31;
		this.m31 = a.m30*b.m01+a.m31*b.m11+a.m32*b.m21+a.m33*b.m31;
		this.m02 = a.m00*b.m02+a.m01*b.m12+a.m02*b.m22+a.m03*b.m32;
		this.m12 = a.m10*b.m02+a.m11*b.m12+a.m12*b.m22+a.m13*b.m32;
		this.m22 = a.m20*b.m02+a.m21*b.m12+a.m22*b.m22+a.m23*b.m32;
		this.m32 = a.m30*b.m02+a.m31*b.m12+a.m32*b.m22+a.m33*b.m32;
		this.m03 = a.m00*b.m03+a.m01*b.m13+a.m02*b.m23+a.m03*b.m33;
		this.m13 = a.m10*b.m03+a.m11*b.m13+a.m12*b.m23+a.m13*b.m33;
		this.m23 = a.m20*b.m03+a.m21*b.m13+a.m22*b.m23+a.m23*b.m33;
		this.m33 = a.m30*b.m03+a.m31*b.m13+a.m32*b.m23+a.m33*b.m33;
		return this;
	}

	/**
	 * Packs the given 3D transformation and translation into a single 4x4 transformation matrix.
	 * @param {import("./Matrix3f.js").default} m
	 * @param {import("./Vector3f.js").default} v
	 */
	static transformationMatrix(m,v){
		return new Matrix4f([m.m00,m.m10,m.m20,0,m.m01,m.m11,m.m21,0,m.m02,m.m12,m.m22,0,v.x,v.y,v.z,1]);
	}

	/**
	 * Creates the projection matrix for the given field of view, aspect ratio, near plane distance and far plane distance.
	 * 
	 * In addition to the usual projection, this matrix also flips the sign of the z coordinate of the input,
	 * meaning in the rest of the program the z axis points effectively into the screen.
	 * 
	 * @param {number} fov tan of (fov in radians / 2)
	 * @param {number} aspectRatio
	 * @param {number} near
	 * @param {number} far
	 */
	static projectionMatrix(fov,aspectRatio,near,far){
		let fovX = fov*Math.sqrt(aspectRatio);
		let fovY = fov/Math.sqrt(aspectRatio);
		return new Matrix4f([1/fovX,0,0,0,0,1/fovY,0,0,0,0,-(near+far)/(far-near),1,0,0,2*near*far/(far-near),0]);
	}

	toArray(){
		return [this.m00,this.m10,this.m20,this.m30,this.m01,this.m11,this.m21,this.m31,this.m02,this.m12,this.m22,this.m32,this.m03,this.m13,this.m23,this.m33];
	}
}