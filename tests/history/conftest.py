"""The recorder must be set up before the `hass` fixture, so it comes first here."""

from __future__ import annotations

import pytest


@pytest.fixture(autouse=True)
def _enable_custom_integrations(recorder_mock: None, enable_custom_integrations: None) -> None:
    """Start the test recorder, then let Home Assistant find the integration."""
