import Matrix3f from "./gl/Matrix3f.js";
import Matrix4f from "./gl/Matrix4f.js";
import Vector3f from "./gl/Vector3f.js";
import Vector4f from "./gl/Vector4f.js";

export default class BlackHoleNumerics {
	/**
	 * Renulls the given vector with respect to the given metric tensor. In the case actual vectors this should be the metric itself, in the case of covectors like `p` its inverse.
	 * 
	 * The metric is assumed to be somewhat close to the flat metric `Diag(-1,1,1,1)`, in the sense that for all `v.yzw`, it is possible to adjust `v.x` so that `v^Tgv=0`.
	 * Out of the two possible values for `v.x`, the one closer to the given sign `s` is then chosen.
	 * For the inverse of the Schwarzschild-metric this is always the case, but not necessarily for the metric itself.
	 * @param {Matrix4f} g
	 * @param {Vector4f} v
	 * @param {1|-1} s
	 */
	static renull(g,v,s=1){
		let a = g.m00;
		let b = new Vector3f(g.m01,g.m02,g.m03);
		let C = new Matrix3f([g.m11,g.m21,g.m31,g.m12,g.m22,g.m32,g.m13,g.m23,g.m33]);
		let p = b.dotProd(v.yzw)/a;
		let q = v.yzw.dotProd(C.mulVec(v.yzw))/a;
		v.x = -p+s*Math.sqrt(p*p-q);
		return v;
	}

	/**
	 * Renulls the momentum such that its corresponding four-velocity points forwards in time. Since g has a -+++ signature, this means
	 * choosing the smaller of the two solutions when computing the new time component of `p`.
	 * @param {Matrix4f} g_inv
	 * @param {Vector4f} p
	 */
	static renullMomentumForwards(g_inv,p){
		return this.renull(g_inv,p,-1);
	}

	/**
	 * Renulls the momentum such that its corresponding four-velocity points backwards in time. Since g has a -+++ signature, this means
	 * choosing the larger of the two solutions when computing the new time component of `p`.
	 * @param {Matrix4f} g_inv
	 * @param {Vector4f} p
	 */
	static renullMomentumBackwards(g_inv,p){
		return this.renull(g_inv,p,+1);
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

	/**
	 * Hamiltonian of a free particle. Not really used here anywere (only its partial derivatives are), but included for completeness anyway.
	 * @param {Vector4f} x
	 * @param {Vector4f} p
	 */
	hamiltonian(x,p){
		return 0.5*p.dotProd(this.metricInverse(x).mulVec(p));
	}

	/**
	 * Returns the gradient of H in the first argument, computed numerically
	 * @param {Vector4f} x
	 * @param {Vector4f} p
	 */
	hamiltonianGradient(x,p){
		const eps = 0.001;
		return new Vector4f(this.hamiltonian(new Vector4f(eps,0,0,0).add(x),p),this.hamiltonian(new Vector4f(0,eps,0,0).add(x),p),this.hamiltonian(new Vector4f(0,0,eps,0).add(x),p),this.hamiltonian(new Vector4f(0,0,0,eps).add(x),p)).add(new Vector4f(-this.hamiltonian(x,p))).scale(1/eps);
	}

	/**
	 * Returns the gradient of H(x,p) in the second argument, computed analytically.
	 * @param {Vector4f} x
	 * @param {Vector4f} p
	 */
	analyticalHamiltonianGradient(x,p){
		const a = this.a;
		const m = this.mass;
		const Q = this.charge;
		let pos = x.yzw;
		let rho = pos.dotProd(pos)-a*a;
		let gradRho = new Vector4f(0,2*pos.x,2*pos.y,2*pos.z);
		let r2 = 0.5*(rho+Math.sqrt(rho*rho+4*a*a*pos.z*pos.z));
		let gradR2 = gradRho.copy().scale(rho).add(new Vector4f(0,0,0,4.0*a*a*pos.z)).scale(1/Math.sqrt(rho*rho+4.0*a*a*pos.z*pos.z)).add(gradRho).scale(0.5);
		let r = Math.sqrt(r2);
		let gradR = gradR2.copy().scale(1/(2*r));
		let k = new Vector4f(1,(r*pos.x+a*pos.y)/(r2+a*a),(r*pos.y-a*pos.x)/(r2+a*a),pos.z/r);
		let gradK1 = gradR.copy().scale(pos.x).add(new Vector4f(0,r,a,0)).scale(r2+a*a).add(gradR2.copy().scale(-(r*pos.x+a*pos.y))).scale(1/((r2+a*a)*(r2+a*a)));
		let gradK2 = gradR.copy().scale(pos.y).add(new Vector4f(0,-a,r,0)).scale(r2+a*a).add(gradR2.copy().scale(-(r*pos.y-a*pos.x))).scale(1/((r2+a*a)*(r2+a*a)));
		let gradK3 = new Vector4f(0,0,0,r).add(gradR.copy().scale(-pos.z)).scale(1/r2);
		let jacobiTransposeK = new Matrix4f([0,0,0,0,gradK1.x,gradK1.y,gradK1.z,gradK1.w,gradK2.x,gradK2.y,gradK2.z,gradK2.w,gradK3.x,gradK3.y,gradK3.z,gradK3.w]);
		let f = r2*(2.0*m*r-Q*Q)/(r2*r2+a*a*pos.z*pos.z);
		let gradF = gradR2.copy().scale((2.0*m*r-Q*Q)/(r2*r2+a*a*pos.z*pos.z)).add((gradR.copy().scale((r2*r2+a*a*pos.z*pos.z)*2.0*m).add(gradR2.copy().scale(2*r2).add(new Vector4f(0,0,0,a*a*pos.z)).scale(-(2.0*m*r-Q*Q)))).scale(r2/((r2*r2+a*a*pos.z*pos.z)*(r2*r2+a*a*pos.z*pos.z))));
		let k2 = new Vector4f(-k.x,k.y,k.z,k.w);
		let f2 = -1.0/(1.0/f+k.dotProd(k2));
		let gradF2 = gradF.copy().scale(-1/(f*f)).add(jacobiTransposeK.mulVec(k.copy().add(k2))).scale(1/(1.0/f+k.dotProd(k2))**2);
		let gradH = gradF2.copy().scale(p.dotProd(k2)**2).add(jacobiTransposeK.mulVec(p).scale(2*f2*p.dotProd(k2))).scale(0.5);
		return gradH;
	}

	/**
	 * Traces a light ray from the given position and momentum (or direction) backwards in time to its origin, and yields all steps along the way. If a 3D direction is given instead of the momentum,
	 * the momentum is computed from it the same way as it is in the shader.
	 * @param {Vector4f} pos
	 * @param {Vector3f|Vector4f} dir
	 * @param {{steps?:number}} options
	 */
	*traceRayBackwards(pos,dir,{steps=50}={}){
		let x = pos.copy();
		// if only a 3D direction is given, computes the momentum from it, otherwise just uses the given one. the momentum is renulled either way.
		let p = BlackHoleNumerics.renullMomentumBackwards(this.metricInverse(x),dir instanceof Vector4f?dir:this.metric(x).mulVec(new Vector4f(-1,dir.x,dir.y,dir.z))).normalize();
		yield {x,p,u:this.metricInverse(x).mulVec(p)};
		for (let i=0;i<steps;i++){
			let timeStep = 0.05*x.yzw.dotProd(x.yzw);
			let prevX = x;
			let prevP = p;
			p = p.copy().add(this.analyticalHamiltonianGradient(prevX,prevP).scale(-timeStep));
			x = x.copy().add(this.metricInverse(prevX).mulVec(prevP).scale(timeStep));
			p = BlackHoleNumerics.renullMomentumBackwards(this.metricInverse(x),p).normalize().scale(2);
			yield {x,p,u:this.metricInverse(x).mulVec(p)};
		}
	}
}

// exposes several math-related classes to the global scope so they can be used in the console
Object.assign(window,{Vector3f,Vector4f,Matrix3f,Matrix4f,BlackHoleNumerics,KerrNewmanBlackHole});