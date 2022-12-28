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
    uniform vec3 cameraPosition;

    void main(void){
        pass_relativePosition = position-cameraPosition;
        pass_normal = normal;
        gl_Position = viewProjection*vec4(position,1.0);
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
        vec3 ownColor = vec3(0.25);
        vec3 reflectionColor = texture(starMap,reflect(pass_relativePosition,normal)).xyz;
        out_color = vec4(0.5*(ownColor+reflectionColor),1.0);
    }
`;

/**
 * @extends {ShaderProgram<{viewProjection:Matrix4f,cameraPosition:Vector3f}>}
 */
export default class MainShader extends ShaderProgram {
    /**
     * @param {WebGL2RenderingContext} gl
     */
    constructor(gl){
        super(gl,vertexSource,fragmentSource,{attribs:["position","normal"]});
    }
}