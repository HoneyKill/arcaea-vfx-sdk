varying vec2 v_uv;

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#endif

uniform sampler2D u_srcTex;
uniform vec4 u_view;  // Aspect ratio, elapsed seconds, light intensity, motion enabled.
uniform vec4 u_sound; // Bass, low mids, treble, onset.
uniform vec4 u_touch; // Touch position, time since touch, amplitude.

const float TAU = 6.2831853;
const vec3 PRISM_EXTENT = vec3(0.67, 1.08, 0.67);
const vec3 ICE = vec3(0.26, 0.76, 1.0);
const vec3 AMBER = vec3(1.0, 0.55, 0.26);

/** Map a lattice cell to a stable pseudo-random number. */
float hash(vec2 cell) {
    return fract(52.9829189 * fract(dot(cell, vec2(0.06711056, 0.00583715))));
}

/** Sample smooth value noise for the background haze. */
float noise(vec2 p) {
    vec2 cell = floor(p);
    vec2 t = smoothstep(0.0, 1.0, fract(p));
    return mix(mix(hash(cell), hash(cell + vec2(1.0, 0.0)), t.x),
               mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0)), t.x), t.y);
}

/** Draw sparse stars in a jittered grid. */
float stars(vec2 p, float size, float sparsity) {
    vec2 cell = floor(p);
    float seed = hash(cell);
    vec2 center = vec2(hash(cell + 23.0), hash(cell - 17.0)) * 0.64 + 0.18;
    return step(sparsity, seed) * (1.0 - smoothstep(0.0, size, length(fract(p) - center)));
}

/** Preserve the original scenery's silhouettes inside a cool, softly lit sky. */
vec3 sky(vec2 uv) {
    vec2 p = (uv - vec2(0.61, 0.52)) * vec2(u_view.x, 1.0);
    float vignette = 1.0 - 0.56 * smoothstep(0.14, 0.94, length(p));
    float haze = exp(-5.7 * abs(p.y - 0.35 * p.x - 0.055));
    float clouds = noise(p * 5.0 + 4.0) * 0.65 + noise(p * 13.0 + 8.0) * 0.35;
    vec3 scenery = texture2D(u_srcTex, uv).rgb;
    float silhouette = dot(scenery, vec3(0.23, 0.65, 0.12));
    vec3 color = vec3(0.021, 0.035, 0.074) + silhouette * vec3(0.028, 0.049, 0.093);
    color += haze * clouds * mix(vec3(0.032, 0.12, 0.20), vec3(0.16, 0.069, 0.19),
        smoothstep(-0.22, 0.30, p.x));
    color *= vignette;
    color += vec3(0.46, 0.66, 0.91) * stars(p * 93.0, 0.13, 0.87) * 0.46;
    color += vec3(0.92, 0.80, 0.68) * stars(p * 33.0 + 4.0, 0.073, 0.84) * 0.65;
    return color;
}

/** Clip a ray against the eight planes of the prism and return both hit normals. */
bool prismInterval(vec3 origin, vec3 ray, out vec2 distances, out vec3 nearNormal, out vec3 farNormal) {
    distances = vec2(-32.0, 32.0);
    nearNormal = ray;
    farNormal = -ray;
    for (int face = 0; face < 8; ++face) {
        vec3 signs = step(vec3(0.5), fract(float(face) * vec3(0.5, 0.25, 0.125))) * 2.0 - 1.0;
        vec3 normal = signs / PRISM_EXTENT;
        float gap = 1.0 - dot(normal, origin);
        float rate = dot(normal, ray);
        if (rate < -0.001) {
            float distance = gap / rate;
            if (distance > distances.x) {
                distances.x = distance;
                nearNormal = normal;
            }
        } else if (rate > 0.001) {
            float distance = gap / rate;
            if (distance < distances.y) {
                distances.y = distance;
                farNormal = normal;
            }
        } else if (gap < 0.0) {
            return false;
        }
    }
    return distances.y >= max(0.0, distances.x);
}

/** Draw the inclined orbital track and one light moving along it. */
vec3 orbit(vec3 origin, vec3 ray, float time, out float distance) {
    vec3 normal = vec3(0.267, 0.779, 0.567);
    float rate = dot(normal, ray);
    distance = 32.0;
    if (rate >= -0.015) return vec3(0.0);
    distance = -dot(normal, origin) / rate;
    vec3 hit = origin + distance * ray;
    float radius = length(hit);
    if (radius > 1.50 || radius < 0.81) return vec3(0.0);

    vec3 axis = normalize(cross(vec3(0.0, 1.0, 0.0), normal));
    float angle = atan(dot(hit, cross(normal, axis)), dot(hit, axis));
    float track = 1.0 - smoothstep(0.002, 0.012, abs(radius - 1.15));
    float marks = 1.0 - smoothstep(0.03, 0.14, abs(fract(angle * 12.0 / TAU) - 0.5));
    float rim = marks * (1.0 - smoothstep(0.010, 0.022, abs(radius - 1.25)));
    float travel = fract(angle / TAU - time / 8.0 + 0.5);
    float bead = exp(-48.0 * travel);
    float trail = exp(-10.0 * travel) * (0.5 + 0.5 * bead);
    float light = exp(-abs(radius - 1.15) * (59.0 - 25.0 * bead));
    return ICE * (0.22 * track + rim * 0.27) + AMBER * light * trail * (1.35 + u_sound.w * 0.18);
}

/** Trace the two glass interfaces, then shade dispersion, seams and the illuminated core. */
vec3 glass(vec2 uv, vec3 ray, mat3 basis, vec3 origin, vec3 localRay,
           vec3 faceNormal, float entry, vec3 underlay, float time, float audio) {
    vec3 start = origin + entry * localRay;
    vec3 normal = normalize(faceNormal);
    vec3 insideRay = refract(localRay, normal, 0.69);
    vec2 distances;
    vec3 unusedNormal, exitNormal;
    prismInterval(start + insideRay * 0.004, insideRay, distances, unusedNormal, exitNormal);
    float thickness = max(0.0, distances.y);
    vec3 exit = refract(insideRay, -normalize(exitNormal), 1.45);
    if (dot(exit, exit) < 0.01) exit = reflect(insideRay, normalize(exitNormal));
    vec2 direction = vec2(dot(basis[0], exit), dot(basis[1], exit)) - ray.xy;
    direction /= vec2(u_view.x, 1.0);
    float separation = 0.026 + thickness * 0.020;
    vec2 offset = direction * (0.13 + thickness * 0.056);
    vec3 source;
    source.r = texture2D(u_srcTex, clamp(uv + offset + direction * separation, 0.0, 1.0)).r;
    source.g = texture2D(u_srcTex, clamp(uv + offset, 0.0, 1.0)).g;
    source.b = texture2D(u_srcTex, clamp(uv + offset - direction * separation, 0.0, 1.0)).b;

    vec3 edges = abs(start) / PRISM_EXTENT;
    float edge = min(edges.x, min(edges.y, edges.z));
    float border = 1.0 - smoothstep(0.008, 0.027, edge);
    float shimmer = exp(-12.0 * edge);
    float fresnel = pow(1.0 - clamp(-dot(localRay, normal), 0.0, 1.0), 2.5);
    float face = 0.5 + 0.5 * dot(normal, vec3(-0.48, 0.65, 0.59));
    vec3 edgeColor = mix(ICE, AMBER, smoothstep(0.21, 0.86, 0.38 + start.y * 0.31 + normal.x * 0.28));

    float travel = clamp(-dot(start, insideRay), 0.0, thickness);
    vec3 core = start + travel * insideRay;
    float seam = abs(core.x + 0.11 * sin(core.y * 7.0 + time * TAU / 12.0));
    float shaft = exp(-16.0 * seam - 7.0 * abs(core.z)) * exp(-4.0 * abs(core.y));
    float crystal = exp(-9.0 * length(core * vec3(1.0, 0.44, 1.0)));
    vec3 color = mix(underlay, source * vec3(0.26, 0.40, 0.57), 0.65);
    color *= 0.61 + face * 0.63;
    color += (vec3(0.11, 0.25, 0.48) * thickness
        + edgeColor * (0.21 * fresnel + 0.18 * shimmer + 0.70 * border)
        + (ICE * shaft * 0.82 + AMBER * crystal * 0.66) * (0.84 + audio * 0.93)) * u_view.z;
    return color;
}

/** Render the reactive prism in the background and distort the scene around a tap. */
void main() {
    vec2 aspect = vec2(u_view.x, 1.0);
    vec2 touch = (v_uv - u_touch.xy) * aspect;
    float radius = length(touch);
    float wave = radius - (0.035 + 0.82 * u_touch.z);
    float envelope = exp(-78.0 * abs(wave)) * u_touch.w;
    vec2 shift = touch / max(radius, 0.001) * envelope * sin(wave * 112.0) * 0.015;
    vec2 uv = clamp(v_uv + shift / aspect, 0.0, 1.0);
    float time = u_view.y;
    float bass = clamp(u_sound.x * 1.8, 0.0, 1.0);
    float brilliance = clamp(u_sound.y + u_sound.z + u_sound.w * 0.46, 0.0, 1.0);
    float yaw = 0.60 + time * TAU / 30.0;
    float roll = 0.20 + 0.10 * sin(time * TAU / 15.0);
    float c = cos(yaw), s = sin(yaw), b = cos(roll), a = sin(roll);
    mat3 rotation = mat3(b, a, 0.0, -a, b, 0.0, 0.0, 0.0, 1.0)
        * mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
    vec2 center = vec2(0.60, 0.50 + 0.016 * sin(time * TAU / 10.0) * u_view.w);
    vec2 p = (uv - center) * aspect;
    vec3 origin = vec3(0.0, 0.0, 3.16);
    vec3 ray = normalize(vec3(p, -1.0));
    vec3 color = sky(uv);
    color += exp(-6.7 * length(p * vec2(1.0, 0.81))) * vec3(0.03, 0.065, 0.14) * (1.0 + bass);

    float orbitDistance;
    vec3 ring = orbit(origin, ray, time, orbitDistance) * u_view.z;
    float prismDistance = 32.0;
    if (abs(p.x) < 0.29 && abs(p.y) < 0.39) {
        float scale = 1.0 + bass * 0.025;
        vec3 localOrigin = rotation * origin / scale;
        vec3 localRay = rotation * ray;
        vec2 distances;
        vec3 nearNormal, farNormal;
        if (prismInterval(localOrigin, localRay, distances, nearNormal, farNormal)) {
            prismDistance = distances.x * scale;
            vec3 underlay = color + (orbitDistance >= prismDistance ? ring : vec3(0.0));
            color = glass(uv, ray, rotation, localOrigin, localRay, nearNormal, distances.x,
                underlay, time, bass * 0.65 + brilliance * 0.35);
        }
    }
    if (prismDistance == 32.0 || orbitDistance < prismDistance) color += ring;
    color += mix(ICE, AMBER, 0.5 + 0.5 * sin(wave * 135.0)) * envelope * 0.27;
    gl_FragColor = vec4(1.0 - exp(-color * 1.55), 1.0);
}
