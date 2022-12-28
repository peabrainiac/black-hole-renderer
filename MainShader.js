import Matrix4f from "./gl/Matrix4f.js";
import ShaderProgram from "./gl/ShaderProgram.js";

const vertexSource = /* glsl */`
    #version 300 es
    precision highp float;

    in vec3 position;

    out vec3 pass_position;

    uniform mat4 viewProjection;

    void main(void){
        pass_position = position;
        gl_Position = viewProjection*vec4(position,1.0);
    }
`;

const fragmentSource = /* glsl */ `
    #version 300 es
    precision highp float;

    in vec3 pass_position;

    out vec4 out_color;

    void main(void){
        out_color = vec4(1.0);
        //out_color = vec4(vec3(gl_FragCoord.z),1.0);
    }
`;

/**
 * @extends {ShaderProgram<{viewProjection:Matrix4f}>}
 */
export default class MainShader extends ShaderProgram {
    /**
     * @param {WebGL2RenderingContext} gl
     */
    constructor(gl){
        super(gl,vertexSource,fragmentSource);
    }
}