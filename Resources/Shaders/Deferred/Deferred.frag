#version 450
#extension GL_ARB_separate_shader_objects : enable

#define MAX_LIGHTS 64
#define PI 3.141592653589793f
#define EPSILON 0.001f

struct Light 
{
	vec4 colour;
	vec3 position;
	float radius;
};

layout(set = 0, binding = 0) uniform UboScene 
{
	Light lights[MAX_LIGHTS];

	mat4 projection;
	mat4 view;
	mat4 shadowSpace;

	vec4 fogColour;
	vec3 cameraPosition;
	float fogDensity;
	float fogGradient;

	float shadowDistance;
	float shadowTransition;
	float shadowBias;
	float shadowDarkness;
	int shadowPCF;

	int lightsCount;
} scene;

layout(rgba16f, set = 0, binding = 1) uniform writeonly image2D writeColour;

layout(set = 0, binding = 2) uniform sampler2D samplerDepth;
layout(set = 0, binding = 3) uniform sampler2D samplerColour;
layout(set = 0, binding = 4) uniform sampler2D samplerNormal;
layout(set = 0, binding = 5) uniform sampler2D samplerMaterial;
layout(set = 0, binding = 6) uniform sampler2D samplerShadows;

layout(location = 0) in vec2 fragmentUv;

layout(location = 0) out vec4 outColour;

float sqr(float x) 
{
	return x * x;
}

vec3 decodeNormal(vec4 normal)
{
	vec2 spherical = normal.xy * 2.0f - 1.0f;
	vec2 sinCosTheta = vec2(sin(spherical.x * 3.14159f), cos(spherical.x * 3.14159f));
	vec2 sinCosPhi = vec2(sqrt(1.0f - spherical.y * spherical.y), spherical.y);
	return vec3(sinCosTheta.y * sinCosPhi.x, sinCosTheta.x * sinCosPhi.x, sinCosPhi.y);
}

vec3 decodeWorldPosition(vec2 uv, float depth) 
{
	vec3 ndc = vec3(uv * 2.0f - vec2(1.0f), depth);
	vec4 p = inverse(scene.projection * scene.view) * vec4(ndc, 1.0);
	return p.xyz / p.w;
}

float shadow(vec4 shadowCoords)
{
    float total = 0.0f;
	vec2 sizeShadows = 1.0f / textureSize(samplerShadows, 0);
    float totalTextels = (scene.shadowPCF * 2.0f + 1.0f) * (scene.shadowPCF * 2.0f + 1.0f);

   // if (shadowCoords.x > 0.0f && shadowCoords.x < 1.0f && shadowCoords.y > 0.0f && shadowCoords.y < 1.0f && shadowCoords.z > 0.0f && shadowCoords.z < 1.0f)
   // {
        for (int x = -scene.shadowPCF; x <= scene.shadowPCF; x++)
        {
            for (int y = -scene.shadowPCF; y <= scene.shadowPCF; y++)
            {
                float shadowValue = texture(samplerShadows, shadowCoords.xy + vec2(x, y) * sizeShadows).r;

                if (shadowCoords.z < shadowValue + scene.shadowBias)
                {
                    total += scene.shadowDarkness * shadowCoords.w;
                }
            }
        }

        total /= totalTextels;
   // }
   // else
   // {
   //     total = 0.0f;
   // }

    return 1.0f - total;
}

float attenuation(float radius, float distance)
{
	if (radius != -1.0f)
	{
		float x = min(distance, radius);
		return sqr(1.0f - sqr(sqr(x / radius))) / (sqr(x) + 1.0f);
	}

	return 1.0f;
}

void main() 
{
	vec4 textureDepth = texture(samplerDepth, fragmentUv);
	vec4 textureColour = texture(samplerColour, fragmentUv);
	vec4 textureNormal = texture(samplerNormal, fragmentUv);
	vec4 textureMaterial = texture(samplerMaterial, fragmentUv);

	vec3 colour = textureColour.rgb;
	vec3 normal = decodeNormal(textureNormal);
	float depth = textureDepth.r;
	float metallic = textureMaterial.r;
	float roughness = textureMaterial.g;
	bool ignoreFog = textureMaterial.b == (1.0f / 3.0f) || textureMaterial.b == (3.0f / 3.0f);
	bool ignoreLighting = textureMaterial.b == (2.0f / 3.0f) || textureMaterial.b == (3.0f / 3.0f);
	vec3 worldPosition = decodeWorldPosition(fragmentUv, depth);
	vec4 screenPosition = scene.view * vec4(worldPosition, 1.0f);
	vec3 viewDirection = normalize(scene.cameraPosition - worldPosition);
	
	outColour = vec4(colour, 1.0f);

	// Shadows.
    if (!ignoreLighting && scene.shadowDarkness >= 0.07f)
    {
        vec4 shadowCoords = scene.shadowSpace * vec4(worldPosition, 1.0f);
        float distanceAway = length(screenPosition.xyz);
        distanceAway = distanceAway - ((scene.shadowDistance * 2.0f) - scene.shadowTransition);
        distanceAway = distanceAway / scene.shadowTransition;
        shadowCoords.w = clamp(1.0f - distanceAway, 0.0f, 1.0f);
        outColour *= shadow(shadowCoords);
    }

	// Lighting.
	if (!ignoreLighting && textureNormal.rgb != vec3(0.0f))
	{
		vec3 irradiance = vec3(0.0f);

    	for (int i = 0; i < scene.lightsCount; i++)
    	{
    		Light light = scene.lights[i];

    		vec3 lightDirection = light.position - worldPosition;
    		float distance = length(lightDirection);
    		lightDirection /= distance;

    		float att = attenuation(light.radius, 0.1f * distance);

    		vec3 LvD = normalize(lightDirection + viewDirection);
    		float NoH = max(0.0f, dot(normal, LvD));
    		float NoV = max(0.0f, dot(normal, viewDirection));
    		float NoL = max(0.0f, dot(normal, lightDirection));
    		float HoV = max(0.0f, dot(LvD, viewDirection));

    		vec3 F0 = mix(vec3(0.04f), outColour.rgb, metallic);
    		vec3 F = F0 + (vec3(1.0f) - F0) * pow(1.0f - HoV, 5.0f);

    		vec3 kS = F;
    		vec3 kD = (vec3(1.0f) - kS) * (1.0f - metallic);

    		float D0 = sqr(sqr(roughness));
    		float D = D0 / (sqr(sqr(NoH) * (D0 - 1.0f) + 1.0f) * PI);

    		float k = sqr(roughness + 1.0f) / 8.0f;
    		float ggx_v = NoV / (NoV * (1.0f - k) + k);
    		float ggx_l = NoL / (NoV * (1.0f - k) + k);
    		float G = ggx_v * ggx_l;

    		vec3 specular = kS * D * G / (4.0f * NoL * NoV + EPSILON);
    		vec3 diffuse = kD * outColour.rgb * (1.0f / PI);

    		vec3 L0 = (diffuse + specular) * NoL;
    		vec3 radiance = light.colour.rgb * att;
    		irradiance += radiance * L0;
    	}

    	outColour = vec4(irradiance, 1.0f);
	}

	// Fog.
	if (!ignoreFog && textureNormal.rgb != vec3(0.0f))
	{
		float fogFactor = exp(-pow(length(screenPosition.xyz) * scene.fogDensity, scene.fogGradient));
		fogFactor = clamp(fogFactor, 0.0f, 1.0f);
		outColour = mix(scene.fogColour, outColour, fogFactor);
	}

	vec2 sizeColour = textureSize(samplerColour, 0);
	imageStore(writeColour, ivec2(fragmentUv * sizeColour), outColour);
}
