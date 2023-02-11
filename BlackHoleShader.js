import Matrix4f from "./gl/Matrix4f.js";
import ShaderProgram from "./gl/ShaderProgram.js";
import Vector3f from "./gl/Vector3f.js";

const [vertexSource,fragmentSource] = await Promise.all((await Promise.all([fetch("./blackhole.vert"),fetch("./blackhole.frag")])).map(response=>response.text()));

/**
 * @extends {ShaderProgram<{viewProjection:Matrix4f,centerPosition:Vector3f,cameraPosition:Vector3f,blackHoleMass:number,innerAccretionDiskRadius:number,outerAccretionDiskRadius:number,accretionDiskHeight:number,steps:number,stepSize:number,simulationRadius:number},{ACCRETION_DISK_ENABLED:boolean,TEAPOT_ENABLED:boolean}>}
 */
export default class BlackHoleShader extends ShaderProgram {
	/**
	 * @param {WebGL2RenderingContext} gl
	 * @param {{ACCRETION_DISK_ENABLED:boolean,TEAPOT_ENABLED:boolean}} flags
	 */
	constructor(gl,flags){
		super(gl,vertexSource,fragmentSource,{attribs:["position"],textures:["imageColors","imageRayData","starMap","noiseTexture"],flags});
	}
}