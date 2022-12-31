#version 300 es
precision highp float;

in vec3 in_vertexPosition;

out vec3 pass_position;

uniform mat4 viewProjection;
uniform vec3 centerPosition;
uniform vec3 cameraPosition;
uniform float simulationRadius;

void main(void){
	vec3 pos = simulationRadius*in_vertexPosition+centerPosition;
	pass_position = pos;
	gl_Position = viewProjection*vec4(pos,1.0);
}