#version 300 es
precision highp float;

in vec3 pass_position;

out vec4 out_color;

uniform vec3 centerPosition;
uniform vec3 cameraPosition;
uniform float simulationRadius;

uniform samplerCube starMap;

mat4 metric(vec4 x);
vec4 hamiltonianGradient(vec4 x, vec4 p);
vec4 renullMomentum(mat4 g_inv, vec4 p);

void main(void){
	vec3 rayDirection = normalize(pass_position-cameraPosition);
	vec3 relativeCenterPosition = centerPosition-cameraPosition;
	float rayCenterDistance = length(cross(rayDirection,relativeCenterPosition));
	if(rayCenterDistance>=simulationRadius||(length(relativeCenterPosition)>=simulationRadius&&dot(rayDirection,relativeCenterPosition)<=0.0)){
		out_color = texture(starMap,pass_position-cameraPosition);
	}else{
		// distance to & position of the nearest intersection of the ray with the simulation sphere around the black hole
		float intersectionDistance = max(0.0,dot(rayDirection,relativeCenterPosition)-sqrt(simulationRadius*simulationRadius-rayCenterDistance*rayCenterDistance));
		vec3 intersectionPosition = cameraPosition+intersectionDistance*rayDirection;

		vec4 x = vec4(0,intersectionPosition-centerPosition);
		vec4 p = metric(x)*vec4(1,rayDirection);
		p = normalize(renullMomentum(inverse(metric(x)),p));

		float minDistance = clamp(length(x),0.01,0.5);

		int i;
		for (i=0;i<100;i++){
			float timeStep = 0.1*dot(x.yzw,x.yzw);
			vec4 prevX = x;
			vec4 prevP = p;
			p -= timeStep*hamiltonianGradient(x,p);
			x += timeStep*inverse(metric(x))*prevP;
			p = 2.0*normalize(renullMomentum(inverse(metric(x)),p));
			if (length(x.yzw)<minDistance){
				break;
			}else if(length(x.yzw)>simulationRadius){
				float temp = 1.0-(length(x.yzw)-simulationRadius)/(length(x.yzw)-length(prevX.yzw));
				x = mix(prevX,x,temp);
				p = mix(prevP,p,temp);
				break;
			}
		}

		rayDirection = (inverse(metric(x))*p).yzw;
		out_color = length(x.yzw)<minDistance?vec4(0,0,0,1):texture(starMap,rayDirection);
		//out_color.xyz += vec3(0.01*float(i));
		//out_color.xyz = mix(out_color.xyz,max(vec3(0.0),vec3(-1,1,0)*(1.0-length(rayDirection))),0.5);
		//out_color.xyz = mix(out_color.xyz,max(vec3(0.0),vec3(-1,1,0)*dot(p,inverse(metric(x))*p)),0.5);
		//out_color.xyz = mix(out_color.xyz,max(vec3(0.0),vec3(-1,1,0)*(1.0-p.x/temp)),0.5);
	}
	//out_color.xyz = mix(out_color.xyz,vec3(0.0625),0.5);
}

// Kerr-Newman metric in Kerr-Schild coordinates, taken from https://michaelmoroz.github.io/TracingGeodesics/
mat4 metric(vec4 x){
    const float a = 0.0;
    const float m = 0.25;
    const float Q = 0.0;
    vec3 p = x.yzw;
    float rho = dot(p,p) - a*a;
    float r2 = 0.5*(rho + sqrt(rho*rho + 4.0*a*a*p.z*p.z));
    float r = sqrt(r2);
    vec4 k = vec4(1, (r*p.x + a*p.y)/(r2 + a*a), (r*p.y - a*p.x)/(r2 + a*a), p.z/r);
    float f = r2*(2.0*m*r - Q*Q)/(r2*r2 + a*a*p.z*p.z);
    return f*mat4(k.x*k, k.y*k, k.z*k, k.w*k)+mat4(-1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1);
}

float hamiltonian(vec4 x, vec4 p){
	return 0.5*dot(p,inverse(metric(x))*p);
}

float lagrangian(vec4 x, vec4 dx){
	return 0.5*dot(dx,metric(x)*dx);
}

// gradient of H in the first argument, computed numerically
vec4 hamiltonianGradient(vec4 x, vec4 p){
	const float eps = 0.001;
	return (vec4(hamiltonian(x+vec4(eps,0,0,0),p),hamiltonian(x+vec4(0,eps,0,0),p),hamiltonian(x+vec4(0,0,eps,0),p),hamiltonian(x+vec4(0,0,0,eps),p))-hamiltonian(x,p))/eps;
}

vec4 renullMomentum(mat4 g_inv, vec4 p){
	float a = g_inv[0].x;
	vec3 b = g_inv[0].yzw;
	mat3 C = mat3(g_inv[1].yzw,g_inv[2].yzw,g_inv[3].yzw);
	float p2 = dot(b,p.yzw)/a;
	float q = dot(p.yzw,C*p.yzw)/a;
	float t = -p2-sqrt(p2*p2-q);
	return vec4(t,p.yzw);
}