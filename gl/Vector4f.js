import Vector3f from "./Vector3f.js";
import Matrix4f from "./Matrix4f.js";

/**
 * Simple class for 4D vectors.
 */
export default class Vector4f {
	/**
	 * @param  {[]|[xyzw:number]|[x:number,y:number,z:number,w:number]} args
	 */
	constructor(...args){
		let temp = args.length==4?args:args.length?[args[0],args[0],args[0],args[0]]:[0,0,0,0];
		this.x = temp[0];
		this.y = temp[1];
		this.z = temp[2];
		this.w = temp[3];
	}

	copy(){
		return new Vector4f(this.x,this.y,this.z,this.w);
	}
	
	/**
	 * @param {number} a
	 */
	scale(a){
		this.x *= a;
		this.y *= a;
		this.z *= a;
		this.w *= a;
		return this;
	}

	/**
	 * @param {Vector4f} v
	 */
	add(v){
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		this.w += v.w;
		return this;
	}

	normalize(){
		let length = Math.hypot(this.x,this.y,this.z,this.w);
		if (length!==0){
			this.x /= length;
			this.y /= length;
			this.z /= length;
			this.w /= length;
		}
		return this;
	}

	get yzw(){
		return new Vector3f(this.y,this.z,this.w);
	}

	set yzw(v){
		this.y = v.x;
		this.z = v.y;
		this.w = v.z;
	}

	/**
	 * @param {Vector4f} v
	 */
	dotProd(v){
		return this.x*v.x+this.y*v.y+this.z*v.z+this.w*v.w;
	}

	/**
	 * @param {Vector4f} v
	 */
	dyadicProd(v){
		return new Matrix4f([this.x*v.x,this.y*v.x,this.z*v.x,this.w*v.x,this.x*v.y,this.y*v.y,this.z*v.y,this.w*v.y,this.x*v.z,this.y*v.z,this.z*v.z,this.w*v.z,this.x*v.w,this.y*v.w,this.z*v.w,this.w*v.w]);
	}
}

// code for swizzling - not currently enabled, since without a `.d.ts` file, this wouldn't work properly within VS Code.
/*["x","y","z","w"].map(s=>[s+"x",s+"y",s+"z",s+"w"]).flat().map(s=>[s+"x",s+"y",s+"z",s+"w"]).flat().map(s=>[s+"x",s+"y",s+"z",s+"w"]).flat().forEach(s=>{
	console.log(s);
	Object.defineProperty(Vector4f.prototype,s,{
		get(){
			return new Vector4f(this[s[0]],this[s[1]],this[s[2]],this[s[3]]);
		},
		set(v){
			this[s[0]] = v.x;
			this[s[1]] = v.y;
			this[s[2]] = v.z;
			this[s[3]] = v.w;
		}
	});
});*/