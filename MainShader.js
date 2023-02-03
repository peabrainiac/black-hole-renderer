import Matrix4f from "./gl/Matrix4f.js";
import ShaderProgram from "./gl/ShaderProgram.js";
import Vector3f from "./gl/Vector3f.js";

const [vertexSource,fragmentSource] = await Promise.all((await Promise.all([fetch("./objects.vert"),fetch("./objects.frag")])).map(response=>response.text()));


/**
 * Shader for objects far away from the black hole. Renders them like in euclidean space, but writes the position and direction the ray ends up in to the depth buffer
 * so reflections can be raytraced later.
 * @extends {ShaderProgram<{viewProjection:Matrix4f,modelTransform:Matrix4f,cameraPosition:Vector3f}>}
 */
export default class MainShader extends ShaderProgram {
    /**
     * @param {WebGL2RenderingContext} gl
     */
    constructor(gl){
        super(gl,vertexSource,fragmentSource,{attribs:["position","normal"]});
    }
}