#version 300 es

#define allBorder 0

precision mediump float;

in vec2 uv;

uniform float u_time;
uniform float u_aspectRatio;

out vec4 outputColor;

vec3 calcBorder2(vec2 uvAdjusted, vec2 aspect, float time) {
    vec3 color1 = vec3(0.616, 0.447, 0.753);
    vec3 color2 = vec3(0.482, 0.490, 0.827);

    float color1Pos = 0.8;
    float color2Pos = 0.0;
    vec3 borderColor = color1;

    float y = uvAdjusted.y;
    float xy = uvAdjusted.x + uvAdjusted.y;
    float b = abs(xy - 0.4);

    if (y > color2Pos && y < color1Pos) {
        float a = smoothstep(color2Pos, color1Pos, y);
        borderColor = mix(color2, color1, a);
    }

    if (b < 0.1) {
        float a = smoothstep(0.0, 0.1, b);
        borderColor = mix(borderColor, vec3(1.0), 1.0 - a);
    }

    return borderColor;
}

vec3 calcBorder3(vec2 uvAdjusted, vec2 aspect, float time) {
    vec3 color1 = vec3(0.616, 0.447, 0.753); // Purple
    vec3 color2 = vec3(0.482, 0.490, 0.827); // Blue

    float glowSpeed = 0.1;
    float pulseSpeed = 0.01;
    float pulse = 0.5 + 0.5 * sin(time * pulseSpeed);

    float distX = min(uvAdjusted.x, aspect.x - uvAdjusted.x);
    float distY = min(uvAdjusted.y, aspect.y - uvAdjusted.y);
    float edgeDist = min(distX, distY);

    float wave = 0.5 + 0.5 * sin((uvAdjusted.x + uvAdjusted.y) * 10.0 + time * glowSpeed);

    vec3 animatedColor = mix(color1, color2, wave);

    float diag = abs(uvAdjusted.x + uvAdjusted.y - 0.4);
    float diagHighlight = smoothstep(0.15, 0.0, diag);

    vec3 finalColor = mix(animatedColor, vec3(1.0), diagHighlight * 0.6 * pulse);

    float verticalFade = smoothstep(aspect.y / 2.0, 1.0, uvAdjusted.y);
    vec3 darkened = mix(finalColor, vec3(0.0), verticalFade * 0.2);

    return darkened;
}

vec3 calcBorder4(vec2 uvAdjusted, vec2 aspect, float time) {
    vec3 c1 = vec3(0.8, 0.6, 1.0); // Lilac
    vec3 c2 = vec3(0.6, 0.9, 1.0); // Cyan
    vec3 c3 = vec3(0.9, 1.0, 0.7); // GreenYellow
    vec3 c4 = vec3(1.0, 0.7, 0.9); // Pink

    float t = time * 0.02;

    float holoX1 = sin(uvAdjusted.x * 8.0 + t * 0.8) * 0.5 + 0.5;
    float holoX2 = sin(uvAdjusted.x * 5.0 - t) * 0.5 + 0.5;
    float holoY = sin(uvAdjusted.y * 10.0 + t * 1.3) * 0.5 + 0.5;

    vec3 holoColor1 = mix(c1, c2, holoX1);
    vec3 holoColor2 = mix(c3, c4, holoX1);
    vec3 holoColor = mix(holoColor1, holoColor2, holoY);

    float verticalFade = smoothstep(aspect.y / 2.0, 0.0, uvAdjusted.y);
    vec3 brightened = mix(holoColor, vec3(1.0), verticalFade * 0.3);

    return brightened;
}

vec3 calcBorder(vec2 uv, vec2 uvAdjusted, vec2 aspect, float time) {
    float y = uv.y;
    float posY1 = 0.4;
    float posY2 = 0.7;
    if (y < posY1)
        return calcBorder4(uvAdjusted, aspect, time);
    if (y > posY2)
        return calcBorder3(uvAdjusted, aspect, time);
    float a = smoothstep(posY1, posY2, y);
    vec3 c1 = calcBorder4(uvAdjusted, aspect, time);
    vec3 c2 = calcBorder3(uvAdjusted, aspect, time);
    return mix(c1, c2, a);
}

vec3 innerBorderColor(vec2 uv) {
    float y = uv.y;

    vec3 c1 = vec3(0.4);
    vec3 c2 = vec3(0.8, 0.6, 1.0);

    float posY1 = 0.4;
    float posY2 = 0.7;
    if (y < posY1)
        return c1;
    if (y > posY2)
        return c2;
    float a = smoothstep(posY1, posY2, y);
    return mix(c1, c2, a);
}

vec3 cornerColor(vec2 uv) {
    vec2 absUv = abs(uv - vec2(0.5));
    float pos = min(absUv.x, absUv.y);

    vec3 c1 = vec3(0.0);
    vec3 c2 = vec3(0.424, 0.314, 0.51);

    float pos1 = 0.0;
    float pos2 = 0.5;
    float a = smoothstep(pos1, pos2, pos);
    return mix(c1, c2, a);
}

float calcSDFGlasses(vec2 relativeUV, vec2 aspect, float distInnerRadius) {
    float glassLine = -0.1;
    float slope = +1.0;
    float lineWidth = 0.01;
    float aa = 0.005;

    float sd = 1e10;

    float absX = abs(relativeUV.x);

    float horDist = abs(relativeUV.y - glassLine);
    float horEdge = smoothstep(lineWidth + aa, lineWidth - aa, horDist);
    if (absX <= 0.5) {
        float d = abs(relativeUV.y - glassLine);
        d -= 0.03;
        sd = min(sd, d);
    }

    if (relativeUV.x <= -0.5 && distInnerRadius <= 0.0) {
        float dx = relativeUV.x + 0.5;
        float expectedY = glassLine + slope * dx;
        float dist = abs(relativeUV.y - expectedY);
        float d = abs(relativeUV.y - expectedY);
        d -= 0.03;
        sd = min(sd, d);
    }

    if (relativeUV.x >= 0.5 && distInnerRadius <= 0.0) {
        float dx = relativeUV.x - 0.5;
        float expectedY = glassLine - slope * dx;
        float d = abs(relativeUV.y - expectedY);
        d -= 0.03;
        sd = min(sd, d);
    }

    float gDist = distance(vec2(absX * 1.1, relativeUV.y), vec2(0.27, glassLine + 0.03));
    gDist -= 0.17;
    if (relativeUV.y > glassLine)
        sd = min(gDist, sd);

    return sd;
}

float calcSDFSymbol(vec2 relativeUV, vec2 aspect) {
    float dist2 = distance(relativeUV * vec2(1.05, 1.0), vec2(0.0));

    float radiusOuter = 0.8;
    float radiusInner = 0.73;
    float aa = 0.02;

    float sd = 1e10;

    float innerDist = dist2 - radiusInner;

    float sdGlasses = calcSDFGlasses(relativeUV, aspect, innerDist);
    sd = min(sdGlasses, sd);

    float outerDist = dist2 - radiusOuter;
    float borderDist = max(-innerDist, outerDist);
    sd = min(borderDist, sd);

    float yLineMouth = abs(relativeUV.y - 0.4);
    float mouthDist = yLineMouth - 0.02;
    if (abs(relativeUV.x) < 0.3)
        sd = min(mouthDist, sd);

    float yLineNose = abs(relativeUV.y - 0.2);
    float noseDist = yLineNose - 0.02;
    if (abs(relativeUV.x) < 0.075)
        sd = min(noseDist, sd);

    if (relativeUV.y <= 0.22 && relativeUV.y >= 0.0) {
        float slope = -4.0;
        float dx = relativeUV.x;
        float dy = relativeUV.y;
        float expectedX = dy / slope;
        float d = abs(expectedX - dx);
        d -= 0.02;
        sd = min(sd, d);
    }

    float distHair = 1e10;
    float distHair1 = distance(relativeUV * vec2(1.15, 1.0), vec2(-0.11, -0.6));
    distHair1 -= 0.4;
    if (relativeUV.x * 1.15 > -0.11) distHair1 = 1e10;
    distHair = min(distHair1, distHair);
    float distHair2 = distance(relativeUV * vec2(0.64, 1.0), vec2(0.0, -1.0));
    distHair2 -= 0.8;
    if (relativeUV.x > 0.0)
        distHair = min(distHair2, distHair);

    float distHairM = relativeUV.y + 0.2;
    if (relativeUV.x < 0.0 && relativeUV.x * 1.15 > -0.11)
        distHair = min(distHairM, distHair);

    float distHairL = distance(relativeUV, vec2(-1.05, -0.78));
    distHairL -= 0.73;
    distHair = min(distHairL, distHair);

    distHair = max(distHair, outerDist);
    sd = min(distHair, sd);

    return sd;
}

vec4 calcColorCard(vec2 uv, vec2 aspect) {
    vec2 uvAdjusted = uv * aspect;

    vec3 baseColor = vec3(0.0);

    vec3 borderColor = calcBorder(uv, uvAdjusted, aspect, u_time);
    vec3 innerBorderColor = innerBorderColor(uv);

    vec3 colorCorner = cornerColor(uv);

    #if allBorder
    baseColor = borderColor;
    #endif

    float border = 0.03;
    float innerBorder = 0.008;
    float radius = 0.04;

    vec2 distToEdge = min(uvAdjusted, aspect - uvAdjusted);

    float outerRadius = radius + border + innerBorder;
    float innerRadius = radius + innerBorder;
    float innerBorderRadius = radius;

    float dist = distance(distToEdge, vec2(outerRadius));

    float minDist = min(distToEdge.x, distToEdge.y);
    float edgeBorder = distToEdge.x + distToEdge.y;

    vec3 color = baseColor;
    float alpha = 1.0;
    if (edgeBorder <= 0.185)
        color = borderColor;
    if (edgeBorder <= 0.17)
        color = colorCorner;
    else if (distToEdge.x < distToEdge.y) {
        if (minDist <= 0.05 && edgeBorder <= 0.4)
            color = colorCorner;
        else if (minDist <= 0.06 && edgeBorder <= 0.415)
            color = borderColor;
    }
    else {
        if (minDist <= 0.05 && edgeBorder <= 0.25)
            color = colorCorner;
        else if (minDist <= 0.06 && edgeBorder <= 0.265)
            color = borderColor;
    }
    if (distToEdge.x <= outerRadius && distToEdge.y <= outerRadius) {
        if (dist < outerRadius) {
            if (dist >= innerRadius) {
                color = borderColor;
            }
            else if (dist >= innerBorderRadius) {
                color = innerBorderColor;
            }
            else {
                color = color;
            }
        } else {
            if (dist > outerRadius) discard;
            color = borderColor;
        }
    }
    else if (minDist <= border) {
        color = borderColor;
    }
    else if (minDist <= border + innerBorder) {
        color = innerBorderColor;
    }

    vec2 symbolPos = uv - vec2(0.5, 0.24);
    symbolPos *= aspect;
    vec2 symbolPosAbs = abs(symbolPos);
    if (symbolPosAbs.x < 0.125 && symbolPosAbs.y < 0.125) {
        vec2 relativeUV = symbolPos * 8.0;
        float sd = calcSDFSymbol(relativeUV, aspect);
        float a = smoothstep(0.0, 0.02, sd);
        color = mix(borderColor, baseColor, a);
        // if(sd<=0.0) color = borderColor;
    }

    return vec4(color * alpha, alpha);
}

void main() {
    vec2 aspect = vec2(u_aspectRatio, 1.0);
    outputColor = calcColorCard(uv, aspect);
}
