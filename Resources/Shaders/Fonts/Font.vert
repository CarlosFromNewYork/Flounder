#version 450
#extension GL_ARB_separate_shader_objects : enable

layout(set = 0, binding = 0) uniform UboObject
{
	vec4 transform;
	vec4 colour;
	vec4 borderColour;
	vec2 borderSizes;
	vec2 edgeData;
	float alpha;
} object;

layout(location = 0) in vec3 vertexPosition;
layout(location = 1) in vec2 vertexUv;

layout(location = 0) out vec2 fragmentUv;

out gl_PerVertex 
{
	vec4 gl_Position;
};

void main() 
{
	gl_Position = vec4((vertexPosition.xy * object.transform.xy) + object.transform.zw, 0.0f, 1.0f);

	fragmentUv = vertexUv.xy;
}
