import Matrix4f from "./gl/Matrix4f.js";
import ShaderProgram from "./gl/ShaderProgram.js";
import Vector3f from "./gl/Vector3f.js";

const [vertexSource,fragmentSource] = await Promise.all((await Promise.all([fetch("./blackhole.vert"),fetch("./blackhole.frag")])).map(response=>response.text()));

/**
 * @extends {ShaderProgram<{viewProjection:Matrix4f,centerPosition:Vector3f,cameraPosition:Vector3f,blackHoleMass:number,steps:number,stepSize:number,simulationRadius:number}>}
 */
export default class BlackHoleShader extends ShaderProgram {
	/**
	 * @param {WebGL2RenderingContext} gl
	 */
	constructor(gl){
		super(gl,vertexSource,fragmentSource,{attribs:["position"]});
	}
}