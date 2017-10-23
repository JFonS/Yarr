#version 420

// Input vertex attributes (from vertex shader)
in vec2 fragTexCoord;
in vec4 fragColor;

// Input uniform values
uniform sampler2D texture0;
uniform vec4 colDiffuse;

// Output fragment color
out vec4 finalColor;

struct Ray { vec3 orig, dir; };
struct Sphere { vec3 center; float radius; };
struct Box { vec3 center, size; };
struct Hit { vec3 p, norm; };
const vec3 NO_HIT = vec3(-42);

// Viewport and camera
const float FOV = 90;
uniform mat4 viewMatrixInv;

const int ITERATIONS = 100;

const float EPSILON = 0.001;

const vec2 viewportSize = vec2(800,450);
const float aspectRatio = viewportSize.x/viewportSize.y;

const float zNear = 10.0;
const float zFar = 120.0;
vec2 viewportWorld = vec2(zNear * tan(FOV/2.0), zNear * tan(FOV/2.0)/aspectRatio);

// Objects
const Sphere sphere[2] = Sphere[](
  Sphere(vec3(0, 0,  10), 3.0),
  Sphere(vec3(0, 0,   0), 3.0)
);
const int N_SPHERES = sphere.length();

const Box box[2] = Box[](
  Box(vec3(0,  0, 20), vec3(2)),
  Box(vec3(10,10, 40), vec3(2))
);
const int N_BOXES = box.length();

// Distance fields
float sdSphere(vec3 p, float s)
{
  return length(p)-s;
}

float sdBox(vec3 p, vec3 b)
{
  return length( max(abs(p)-b,0.0) );
}

vec3 boxNormal(vec3 p, Box b)
{
    const vec2 eps = vec2(EPSILON, 0);

    vec3 nor = vec3(
        sdBox(p + eps.xyy,b.size).x - sdBox(p - eps.xyy,b.size).x,
        sdBox(p + eps.yxy,b.size).x - sdBox(p - eps.yxy,b.size).x,
        sdBox(p + eps.yyx,b.size).x - sdBox(p - eps.yyx,b.size).x);
    return normalize(nor);
}

// Ray marching
Ray rayFromPixel(vec2 p)
{
  const vec4 cameraV  = vec4(0,0,0,1);

  vec4 pixelV  = vec4(
                  viewportWorld.x * (p.x / (viewportSize.x/2)),
                  viewportWorld.y * (p.y / (viewportSize.y/2)),
                  -zNear,
                  1);

  vec3 cameraW  = (viewMatrixInv * cameraV).xyz;
  vec3 pixelW   = (viewMatrixInv * pixelV).xyz;
  vec3 dirW = normalize(pixelW - cameraW);

  return Ray(cameraW, dirW);
}

Hit rayMarch(Ray ray) {
  
  float dist = 0;

  for (int i = 0; i < ITERATIONS && dist <= zFar; ++i) {
    vec3 p = ray.orig + ray.dir * dist;
    float minD = zFar*2;

    for (int j = 0; j < N_SPHERES; ++j) { // Raymarch spheres
      Sphere s = sphere[j];
      vec3 relativeP = p-s.center;
      float d = sdSphere(relativeP, s.radius);
      if (d < EPSILON) return Hit(p, normalize(relativeP));
      minD = min(minD,d);
    }

    for (int j = 0; j < N_BOXES; ++j) { // Raymarch boxes
      Box b = box[j];
      vec3 relativeP = p-b.center;

      float d = sdBox(relativeP,b.size);
      if (d < EPSILON) return Hit(p, boxNormal(relativeP, b));
      minD = min(minD,d);
    }

    dist += minD;
  }

  return Hit(NO_HIT,NO_HIT);
}

void main()
{   
    vec2 pixelS = gl_FragCoord.xy - (viewportSize/2);
    Ray rayW = rayFromPixel(pixelS);
    Hit h = rayMarch(rayW);
    
    finalColor = vec4(0,0,0,1);
    if (h.norm.x > -2) {
      finalColor = vec4(vec3(h.norm), 1);
    }
}
