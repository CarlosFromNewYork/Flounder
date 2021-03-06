#pragma once

#include "../Renderer/IRenderer.hpp"
#include "../Renderer/Pipelines/Pipeline.hpp"

namespace Flounder
{
	class F_EXPORT RendererGuis :
		public IRenderer
	{
	private:
		Pipeline *m_pipeline;
	public:
		RendererGuis(const GraphicsStage &graphicsStage);

		~RendererGuis();

		void Render(const VkCommandBuffer &commandBuffer, const Vector4 &clipPlane, const ICamera &camera) override;
	};
}
