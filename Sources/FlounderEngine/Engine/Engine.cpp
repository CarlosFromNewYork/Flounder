#include "Engine.hpp"

#include <stdexcept>
#include <cstdlib>

namespace Flounder
{
	Engine *Engine::g_instance = nullptr;

	Engine::Engine() :
		m_start(HighResolutionClock::now()),
		m_timeOffset(0.0f),
		m_initialized(false),
		m_running(true),
		m_error(false),
		m_updater(nullptr)
	{
		g_instance = this;
	}

	Engine::~Engine()
	{
		delete m_updater;
	}

	void Engine::SetUpdater(IUpdater *updater)
	{
		m_updater = updater;
		m_updater->Create();
	}

	int Engine::Run() const
	{
		try
		{
			while (m_running)
			{
				m_updater->Update();
			}

			return EXIT_SUCCESS;
		}
		catch (const std::runtime_error &e)
		{
			fprintf(stderr, "%s\n", e.what());
			return EXIT_FAILURE;
		}
	}

	void Engine::RequestClose(const bool &error)
	{
		m_running = false;

		// A statement in case it was already true.
		if (error)
		{
			m_error = true;
		}
	}

	std::string Engine::GetDateTime()
	{
		time_t rawtime;
		struct tm * timeinfo;
		char buffer[80];

		time (&rawtime);
		timeinfo = localtime(&rawtime);

		strftime(buffer, sizeof(buffer), "%Y-%m-%d-%I%M%S", timeinfo);
		std::string str = std::string(buffer);
		return str;
	}
}
