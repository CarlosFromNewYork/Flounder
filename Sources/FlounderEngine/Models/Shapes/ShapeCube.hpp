#pragma once

#include <functional>
#include <Helpers/FormatString.hpp>
#include "../Model.hpp"

namespace Flounder
{
	class F_EXPORT ShapeCube :
		public Model
	{
	public:
		static ShapeCube *Resource(const float &width, const float &height, const float &depth)
		{
			IResource *resource = Resources::Get()->Get(ToFilename(width, height, depth));

			if (resource != nullptr)
			{
				return dynamic_cast<ShapeCube *>(resource);
			}

			ShapeCube *result = new ShapeCube(width, height, depth);
			Resources::Get()->Add(dynamic_cast<IResource *>(result));
			return result;
		}

		static ShapeCube *Resource(const std::string &filename)
		{
			auto split = FormatString::Split(filename, "_");
			float width = atof(split.at(1).c_str());
			float height = atof(split.at(2).c_str());
			float depth = atof(split.at(3).c_str());
			return Resource(width, height, depth);
		}

		ShapeCube(const float &width, const float &height, const float &depth);

	private:
		static std::string ToFilename(const float &width, const float &height, const float &depth);
	};
}