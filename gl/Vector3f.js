/**
 * Simple class for 3D vectors.
 */
export default class Vector3f {
	/**
	 * @param  {[]|[xyz:number]|[x:number,y:number,z:number]} args
	 */
	constructor(...args){
		let temp = args.length==3?args:args.length?[args[0],args[0],args[0]]:[0,0,0];
		this.x = temp[0];
		this.y = temp[1];
		this.z = temp[2];
	}

	copy(){
		return new Vector3f(this.x,this.y,this.z);
	}
	
	/**
	 * @param {number} a
	 */
	scale(a){
		this.x *= a;
		this.y *= a;
		this.z *= a;
		return this;
	}

	/**
	 * @param {Vector3f} v
	 */
	add(v){
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		return this;
	}

	/**
	 * @param {Vector3f} v
	 */
	dotProd(v){
		return this.x*v.x+this.y*v.y+this.z*v.z;
	}
}