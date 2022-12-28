import Matrix3f from "./gl/Matrix3f.js";
import Matrix4f from "./gl/Matrix4f.js";
import Vector3f from "./gl/Vector3f.js";
import InputHandler from "./InputHandler.js";

export default class Camera{
	/**
	 * @param {InputHandler} inputHandler
	 */
	constructor(inputHandler){
		this._position = new Vector3f(0,0,-2);
		this._rotation = new Matrix3f();
		this._inputHandler = inputHandler;
	}

	/**
	 * @param {number} deltaT time since last frame in seconds
	 */
	update(deltaT){
		let rx = this._inputHandler.getMouseDeltaX()/500;
		let ry = this._inputHandler.getMouseDeltaY()/500;
		let dx = (+this._inputHandler.keys.d-(+this._inputHandler.keys.a))*deltaT;
		let dy = (+this._inputHandler.keys.space-(+this._inputHandler.keys.shift))*deltaT;
		let dz = (+this._inputHandler.keys.w-(+this._inputHandler.keys.s))*deltaT;
		this._rotation.rotateExp(ry,rx,0);
		this._position.add(this._rotation.mulVec(new Vector3f(dx,dy,dz)));
	}

	get viewMatrix(){
		// computes the inverse assuming `_rotation` is in fact a rotation matrix.
		let rotationInverse = this._rotation.getTranspose();
		return Matrix4f.transformationMatrix(rotationInverse,rotationInverse.mulVec(this._position).scale(-1));
	}

	get position(){
		return this._position;
	}
}