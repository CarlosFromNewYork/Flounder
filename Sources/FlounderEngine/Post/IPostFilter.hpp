#pragma once

#include "../Models/Model.hpp"
#include "../Renderer/Pipelines/Pipeline.hpp"

namespace Flounder
{
	/// <summary>
	/// Represents a post effect shader and on application saves the result into a fbo.
	/// </summary>
	class F_EXPORT IPostFilter
	{
	protected:
		DescriptorSet *m_descriptorSet;

		Pipeline *m_pipeline;
		Model *m_model;
	public:
		/// <summary>
		/// Creates a new post effect filter
		/// </summary>
		/// <param name="fragmentShader"> The fragment shader file. </param>
		/// <param name="graphicsStage"> The pipelines graphics stage. </param>
		/// <param name="defines"> A list of names that will be added a #define. </param>
		IPostFilter(const std::string &fragmentShader, const GraphicsStage &graphicsStage, const std::vector<std::string> &defines = std::vector<std::string>());

		/// <summary>
		/// Deconstructor for the post filter.
		/// </summary>
		virtual ~IPostFilter();

		/// <summary>
		/// Renders the filter.
		/// </summary>
		virtual void Render(const VkCommandBuffer &commandBuffer);
	};
}
