﻿#include "spawnline.h"

namespace flounder
{
	spawnline::spawnline(const float &length, const vector3 &axis) :
		ispawnparticle()
	{
		m_length = length;
		m_axis = new vector3(axis);
		m_axis->normalize();
		m_spawnPosition = new vector3();
	}

	spawnline::~spawnline()
	{
		delete m_axis;
		delete m_spawnPosition;
	}

	vector3 *spawnline::getBaseSpawnPosition()
	{
		m_spawnPosition->set(m_axis->m_x * m_length, m_axis->m_y * m_length, m_axis->m_z * m_length);
		float s = __random() - 0.5f;
		m_spawnPosition->scale(s);
		return m_spawnPosition;
	}
}