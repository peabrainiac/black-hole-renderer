#version 300 es
precision highp float;

in vec3 in_vertexPosition;

out vec3 pass_direction;

uniform mat4 viewProjection;

void main(void){
	pass_direction = in_vertexPosition;
	gl_Position = viewProjection*vec4(in_vertexPosition,1.0);
}