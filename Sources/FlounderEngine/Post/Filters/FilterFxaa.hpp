#pragma once

#include "../IPostFilter.hpp"
#include "../../Renderer/Buffers/UniformBuffer.hpp"

namespace Flounder
{
	class F_EXPORT FilterFxaa :
		public IPostFilter
	{
	private:
		struct UboScene
		{
			float spanMax;
		};

		UniformBuffer *m_uniformScene;

		float m_spanMax;
	public:
		FilterFxaa(const GraphicsStage &graphicsStage);

		~FilterFxaa();

		void Render(const VkCommandBuffer &commandBuffer) override;

		float GetSpanMax() const { return m_spanMax; }

		void SetSpanMax(const float &spanMax) { m_spanMax = spanMax; }
	};
}
