import Matrix3f from "./gl/Matrix3f.js";
import Matrix4f from "./gl/Matrix4f.js";
import Vector3f from "./gl/Vector3f.js";
import Vector4f from "./gl/Vector4f.js";

export default class BlackHoleNumerics {
	/**
	 * Renulls the given vector with respect to the given metric tensor. In the case actual vectors this should be the metric itself, in the case of covectors like `p` its inverse.
	 * 
	 * The metric is assumed to be somewhat close to the flat metric `Diag(-1,1,1,1)`, in the sense that for all `v.yzw`, it is possible to adjust `v.x` so that `v^Tgv=0`.
	 * Out of the two possible values for `v.x`, the larger one is then always chosen.
	 * For the inverse of the Schwarzschild-metric this is always the case, but not necessarily for the metric itself.
	 * @param {Matrix4f} g
	 * @param {Vector4f} v
	 */
	static renull(g,v){
		let a = g.m00;
		let b = new Vector3f(g.m01,g.m02,g.m03);
		let C = new Matrix3f([g.m11,g.m21,g.m31,g.m12,g.m22,g.m32,g.m13,g.m23,g.m33]);
		let p = b.dotProd(v.yzw)/a;
		let q = v.yzw.dotProd(C.mulVec(v.yzw))/a;
		v.x = -p+Math.sqrt(p*p-q);
		return v;
	}
}

/**
 * Numerics related to the Kerr-Newman-metric for black holes, based on the glsl code provided in https://michaelmoroz.github.io/TracingGeodesics/.
 * 
 * Methods are implemented as instance methods instead of static ones, since they depend on the parameters `a`, `m` and `Q` of the black hole.
 */
export class KerrNewmanBlackHole {
	/**
	 * @param {number} a angular momentum `a=L/M`
	 * @param {number} mass
	 * @param {number} charge
	 */
	constructor(a=0,mass=1,charge=0){
		this.a = a;
		this.mass = mass;
		this.charge = charge;
	}

	/**
	 * Covariant metric tensor g_ij at position x.
	 * @param {Vector4f} x
	 */
	metric(x){
		const a = this.a;
		const m = this.mass;
		const Q = this.charge;
		let p = x.yzw;
		let rho = p.dotProd(p)-a*a;
		let r2 = 0.5*(rho+Math.sqrt(rho*rho+4*a*a*p.z*p.z));
		let r = Math.sqrt(r2);
		let k = new Vector4f(1,(r*p.x+a*p.y)/(r2+a*a),(r*p.y-a*p.x)/(r2+a*a),p.z/r);
		let f = r2*(2.0*m*r-Q*Q)/(r2*r2+a*a*p.z*p.z);
		return new Matrix4f([-1,1,1,1]).add(k.dyadicProd(k).scale(f));
	}

	/**
	 * Contravariant metric tensor g^ij at position x, calculated using the Sherman–Morrison formula.
	 * @param {Vector4f} x
	 */
	metricInverse(x){
		const a = this.a;
		const m = this.mass;
		const Q = this.charge;
		let p = x.yzw;
		let rho = p.dotProd(p)-a*a;
		let r2 = 0.5*(rho+Math.sqrt(rho*rho+4*a*a*p.z*p.z));
		let r = Math.sqrt(r2);
		let k = new Vector4f(1,(r*p.x+a*p.y)/(r2+a*a),(r*p.y-a*p.x)/(r2+a*a),p.z/r);
		let f = r2*(2.0*m*r-Q*Q)/(r2*r2+a*a*p.z*p.z);
		let k2 = new Vector4f(-k.x,k.y,k.z,k.w);
		return new Matrix4f([-1,1,1,1]).add(k2.dyadicProd(k2).scale(-1/(1/f+k.dotProd(k2))));
	}
}

// exposes several math-related classes to the global scope so they can be used in the console
Object.assign(window,{Vector3f,Vector4f,Matrix3f,Matrix4f,BlackHoleNumerics,KerrNewmanBlackHole});