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
vec4 bezierInterpolate(vec4 x0, vec4 x1, vec4 x2, vec4 x3, float t);

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
		vec4 prevX = x;
		vec4 prevP = p;
		for (i=0;i<100;i++){
			float timeStep = 0.1*dot(x.yzw,x.yzw);
			vec4 prevPrevX = prevX;
			vec4 prevPrevP = prevP;
			prevX = x;
			prevP = p;
			p -= timeStep*hamiltonianGradient(x,p);
			x += timeStep*inverse(metric(x))*prevP;
			p = 2.0*normalize(renullMomentum(inverse(metric(x)),p));
			if (length(x.yzw)<minDistance){
				break;
			}else if(length(x.yzw)>simulationRadius){
				vec3 lastStep = x.yzw-prevX.yzw;
				vec3 lastStepDirection = normalize(lastStep);
				// proportion of the last step that was still inside the simulation bubble
				float t = (dot(lastStepDirection,-prevX.yzw)+sqrt(simulationRadius*simulationRadius-dot(cross(lastStepDirection,-prevX.yzw),cross(lastStepDirection,-prevX.yzw))))/length(lastStep);
				//float t = 1.0-(length(x.yzw)-simulationRadius)/(length(x.yzw)-length(prevX.yzw));
				if (i==0){
					t = t*t;
				}
				float nextTimeStep = 0.1*dot(x.yzw,x.yzw);
				vec4 nextP = p-nextTimeStep*hamiltonianGradient(x,p);
				vec4 nextX = x+nextTimeStep*inverse(metric(x))*p;
				nextP = 2.0*normalize(renullMomentum(inverse(metric(nextX)),nextP));
				//x = mix(prevX,x,t);
				//p = mix(prevP,p,t);
				x = bezierInterpolate(prevPrevX,prevX,x,nextX,t);
				p = bezierInterpolate(prevPrevP,prevP,p,nextP,t);
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

// bezier-interpolates between x1 and x2 with the parameter t. note that x0 and x3 are not the usual control points, but the points before x1 and after x2.
vec4 bezierInterpolate(vec4 x0, vec4 x1, vec4 x2, vec4 x3, float t){
	//mat4 C = mat4(1,-3,3,-1,0,3,-6,3,0,0,3,-3,0,0,0,1);
	//return dot(vec4(1,t,t*t,t*t*t),C*vec4(x1,x1+(x2-x0)/6.0,x2-(x3-x1)/6.0,x2));
	vec4 A = x1;
	vec4 B = x1+(x2-x0)/6.0;
	vec4 C = x2-(x3-x1)/6.0;
	vec4 D = x2;
	float t2 = 1.0-t;
	return A*t2*t2*t2+3.0*B*t2*t2*t+3.0*C*t2*t*t+D*t*t*t;
}