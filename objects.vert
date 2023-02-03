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