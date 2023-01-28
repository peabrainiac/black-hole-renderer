import Matrix4f from "./gl/Matrix4f.js";
import ShaderProgram from "./gl/ShaderProgram.js";
import Vector3f from "./gl/Vector3f.js";

const vertexSource = /* glsl */`
    #version 300 es
    precision highp float;

    in vec3 position;
    in vec3 normal;

    out vec3 pass_relativePosition;
    out vec3 pass_normal;

    uniform mat4 viewProjection;
    uniform mat4 modelTransform;
    uniform vec3 cameraPosition;

    void main(void){
        vec4 pos = modelTransform*vec4(position,1.0);
        pass_relativePosition = pos.xyz-cameraPosition;
        pass_normal = (modelTransform*vec4(normal,0.0)).xyz;
        gl_Position = viewProjection*pos;
    }
`;

const fragmentSource = /* glsl */ `
    #version 300 es
    precision highp float;

    in vec3 pass_relativePosition;
    in vec3 pass_normal;

    out vec4 out_color;

	uniform samplerCube starMap;

    void main(void){
        vec3 normal = normalize(pass_normal);
        vec3 ownColor = vec3(0.0625);
        vec3 reflectionColor = texture(starMap,reflect(pass_relativePosition,normal)).xyz;
        //vec3 reflectionColor = vec3(max(0.0,-dot(normalize(pass_relativePosition),normal)));
        out_color = vec4(mix(ownColor,reflectionColor,0.4),1.0);
    }
`;

/**
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