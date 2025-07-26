#version 300 es
precision highp float;

in vec2 uv;
out vec4 frag_color;

uniform float u_time;
uniform float u_aspectRatio;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

const float sunOffsetY = 0.3;

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p, float t) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
        vec2 offset = vec2(
                sin(t * 0.1 + float(i) * 13.1),
                cos(t * 0.12 + float(i) * 7.3)
            ) * 2.0;

        value += amplitude * noise(p + offset);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

float getDistanceToSun(vec2 uv, vec2 sunPos) {
    float dist = distance(uv, sunPos + vec2(0.0, sunOffsetY));
    return dist;
}

vec3 getSkyColor(vec2 uv, vec2 sunPos) {
    float dist = getDistanceToSun(uv, sunPos);

    vec3 color = vec3(1.0, 0.0, 1.0);
    vec3 sunColor = vec3(1.0, 1.0, 0.988);

    vec3 skyColor1 = vec3(0.992, 0.447, 0.133);

    sunColor = mix(skyColor1, sunColor, 0.8);

    float sunRadius = 0.2;
    float aa = 0.007;
    if (dist < sunRadius) {
        float a = smoothstep(sunRadius - aa, sunRadius, dist);
        color = mix(sunColor, skyColor1, a);
    }
    else {
        float a = smoothstep(0.3, 0.9, dist);
        vec3 color1 = skyColor1;
        vec3 color2 = vec3(0.663, 0.106, 0.0);
        color = mix(color1, color2, a);
    }

    return color;
}
float calcDistSea(vec2 uv, vec2 sunPos) {
    float y = -20.0;
    float dist = distance(uv, vec2(0.0, y));

    return dist + y - sunPos.y;
}

vec3 getCloudColor(vec2 uv, vec2 sunPos) {
    float distToSun = getDistanceToSun(uv, sunPos);
    // float sunFactor = smoothstep(0.9, 0.0, distToSun);
    float sunFactor = smoothstep(0.0, 0.4, distToSun);
    vec3 color = mix(vec3(0.1), vec3(1.0, 0.8, 0.5), sunFactor);
    float sunFactor2 = smoothstep(0.5, 1.1, distToSun);
    color = mix(color, vec3(0.925, 0.396, 0.122), sunFactor2);

    // vec3 tint = mix(vec3(0.5, 0.1, 0.0), , sunFactor);
    return color;
}

vec3 totalSkyColor(vec2 uv, vec2 sunPos) {
    vec2 coord = uv * 4.0 * vec2(0.5, 1.0);
    float adjTime = u_time * 3e-4;
    coord += vec2(-adjTime * 0.1, 0.0);

    float n = fbm(coord, adjTime);

    float cloud = smoothstep(0.5, 0.8, n);

    vec3 sky_color = getSkyColor(uv, sunPos);

    // vec3 cloud_color = vec3(1.0);
    vec3 cloud_color = getCloudColor(uv, sunPos);
    // vec3 cloud_color = getCloudColor(uv, u_aspectRatio);
    cloud = pow(cloud, 1.5);

    return mix(sky_color, cloud_color, cloud);
}

vec3 addSunGlint(vec2 uv, vec2 sunPos, vec3 seaColor) {
    float xDist = abs(uv.x - sunPos.x);
    float yDist = sunPos.y - uv.y;

    float width = mix(0.19, 0.35, smoothstep(0.0, 1.0, yDist));
    // float width = 0.2;
    float intensity = smoothstep(width, 0.0, xDist);

    intensity *= smoothstep(0.0, 0.3, yDist);

    // vec3 glintColor = vec3(1.0, 0.7, 0.3);

    vec3 sunColor = vec3(1.0, 1.0, 0.988);
    vec3 skyColor1 = vec3(0.992, 0.447, 0.133);

    vec3 glintColor = mix(skyColor1, sunColor, 0.6);

    return mix(seaColor, glintColor, intensity);
}

vec3 calcSeaColor(vec2 uv, vec2 sunPos) {
    vec3 seaColor = vec3(0.0, 0.0, 0.219);
    // float compression = 0.4;
    // vec2 mirroredUV = vec2(
    //         uv.x,
    //         sunPos.y + (sunPos.y - uv.y) * compression
    //     );
    // vec3 skyColor = totalSkyColor(mirroredUV, sunPos);
    // float horizonFade = smoothstep(sunPos.y - 0.9, sunPos.y + 0.2, uv.y);
    // seaColor = mix(seaColor, skyColor * 0.5, horizonFade);

    vec2 uvAdj = uv;
    float t = u_time * 3e-4;

    // float offset = (noise(vec2(uv.y * 10.0, t * 3.0)) - 0.5) * 0.05;
    // uvAdj.x += offset;

    float y = -uv.y;
    // float distY = smoothstep(sunPos.y, -1.0, uv.y);
    float distY = 1.0 - smoothstep(-1.0, sunPos.y, uv.y);
    float amp = mix(0.001, 0.01, distY);
    uvAdj.x *= mix(1.0, 0.7, distY);
    uvAdj.x += sin(uv.y * 60.0 + t * 4.0) * amp;
    uvAdj.y = sunPos.y + (uv.y - sunPos.y) * 0.3;

    seaColor = addSunGlint(uvAdj, sunPos, seaColor);
    // seaColor = vec3(distY);

    return seaColor;
}

void main() {
    vec2 aspect = vec2(u_aspectRatio, 1.0);
    vec2 uvAdj = uv * aspect;

    vec2 sunPos = vec2(0.0, -0.3);
    // vec3 color = sky_color;

    float distSea = calcDistSea(uvAdj, sunPos);
    float aa = 0.002;
    float seaA = smoothstep(0.0, aa, distSea);

    vec3 color;
    if (seaA < 0.0)
        color = calcSeaColor(uvAdj, sunPos);
    if (seaA > 1.0)
        color = totalSkyColor(uvAdj, sunPos);
    else {
        vec3 seaColor = calcSeaColor(uvAdj, sunPos);
        vec3 skyColor = totalSkyColor(uvAdj, sunPos);
        color = mix(seaColor, skyColor, seaA);
    }

    frag_color = vec4(color, 1.0);
}
