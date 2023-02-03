#version 300 es
precision highp float;

in vec3 pass_relativePosition;
in vec3 pass_normal;

layout(location=0) out vec4 out_color;
layout(location=1) out vec4 out_rayData;

uniform samplerCube starMap;

void main(void){
	vec3 normal = normalize(pass_normal);
	vec3 ownColor = vec3(0.0625);
	//vec3 reflectionColor = texture(starMap,reflect(pass_relativePosition,normal)).xyz;
	//vec3 reflectionColor = vec3(max(0.0,-dot(normalize(pass_relativePosition),normal)));
	out_color = vec4(ownColor,0.6);
	out_rayData = vec4(normalize(reflect(pass_relativePosition,normal)),length(pass_relativePosition));
}