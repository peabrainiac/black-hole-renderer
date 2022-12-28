import Vector3f from "./Vector3f.js";

export default class Matrix3f {
	/**
	 * @param {number|[number,number,number]|[number,number,number,number,number,number,number,number,number]} [data]
	 */
	constructor(data=1){
		let temp = data instanceof Array?(data.length==9?data:[data[0],0,0,0,data[1],0,0,0,data[2]]):[data,0,0,0,data,0,0,0,data];
		this.m00 = temp[0];
		this.m10 = temp[1];
		this.m20 = temp[2];
		this.m01 = temp[3];
		this.m11 = temp[4];
		this.m21 = temp[5];
		this.m02 = temp[6];
		this.m12 = temp[7];
		this.m22 = temp[8];
	}

	copy(){
		return new Matrix3f([this.m00,this.m10,this.m20,this.m01,this.m11,this.m21,this.m02,this.m12,this.m22]);
	}

	/**
	 * Returns the transpose of this matrix.
	 */
	getTranspose(){
		return new Matrix3f([this.m00,this.m01,this.m02,this.m10,this.m11,this.m12,this.m20,this.m21,this.m22]);
	}

	/**
	 * @param {number} a
	 */
	scale(a){
		this.m00 *= a;
		this.m10 *= a;
		this.m20 *= a;
		this.m01 *= a;
		this.m11 *= a;
		this.m21 *= a;
		this.m02 *= a;
		this.m12 *= a;
		this.m22 *= a;
		return this;
	}

	/** @param {Matrix3f} m */
	add(m){
		this.m00 += m.m00;
		this.m10 += m.m10;
		this.m20 += m.m20;
		this.m01 += m.m01;
		this.m11 += m.m11;
		this.m21 += m.m21;
		this.m02 += m.m02;
		this.m12 += m.m12;
		this.m22 += m.m22;
		return this;
	}

	/** @param {Matrix3f} m */
	mul(m){
		let a = this.copy();
		let b = m.copy();
		this.m00 = a.m00*b.m00+a.m01*b.m10+a.m02*b.m20;
		this.m10 = a.m10*b.m00+a.m11*b.m10+a.m12*b.m20;
		this.m20 = a.m20*b.m00+a.m21*b.m10+a.m22*b.m20;
		this.m01 = a.m00*b.m01+a.m01*b.m11+a.m02*b.m21;
		this.m11 = a.m10*b.m01+a.m11*b.m11+a.m12*b.m21;
		this.m21 = a.m20*b.m01+a.m21*b.m11+a.m22*b.m21;
		this.m02 = a.m00*b.m02+a.m01*b.m12+a.m02*b.m22;
		this.m12 = a.m10*b.m02+a.m11*b.m12+a.m12*b.m22;
		this.m22 = a.m20*b.m02+a.m21*b.m12+a.m22*b.m22;
		return this;
	}

	/**
	 * Returns the product of this matrix and the given vector.
	 * @param {Vector3f} v
	 */
	mulVec(v){
		return new Vector3f(this.m00*v.x+this.m01*v.y+this.m02*v.z,this.m10*v.x+this.m11*v.y+this.m12*v.z,this.m20*v.x+this.m21*v.y+this.m22*v.z);
	}

	/**
	 * Rotates around the given vector using Rodrigues' formula, with the rotation amount in radians given by the magnitude of the vector.
	 * 
	 * In other words, multiplies the matrix by exp(rK), where r is the length of (rx,ry,rz) and K is the matrix corresponding to the linear map v -> (rx,ry,rz) x v.
	 * @param {number} rx
	 * @param {number} ry
	 * @param {number} rz
	 */
	rotateExp(rx,ry,rz){
		let r = Math.hypot(rx,ry,rz);
		if (r!=0){
			let K = new Matrix3f([0,rz/r,-ry/r,-rz/r,0,rx/r,ry/r,-rx/r,0]);
			this.mul(new Matrix3f().add(K.copy().scale(Math.sin(r))).add(K.mul(K).scale(1-Math.cos(r))));
		}
		return this;
	}

	toArray(){
		return [this.m00,this.m10,this.m20,this.m01,this.m11,this.m21,this.m02,this.m12,this.m22];
	}
}