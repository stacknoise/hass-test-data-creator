"""Every command and every service is reserved for administrators (concept 10.4)."""

from __future__ import annotations

from unittest.mock import MagicMock

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import Unauthorized
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hass_test_data_creator.api import COMMANDS
from custom_components.hass_test_data_creator.const import DOMAIN


@pytest.mark.parametrize("command", COMMANDS, ids=lambda command: command._ws_command)
def test_a_command_refuses_a_user_who_is_not_an_administrator(
    hass: HomeAssistant, command: object
) -> None:
    connection = MagicMock()
    connection.user.is_admin = False
    with pytest.raises(Unauthorized):
        command(hass, connection, {"id": 1})  # type: ignore[operator]


async def test_every_service_is_registered_as_an_admin_service(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    registered = hass.services._services[DOMAIN]
    assert registered
    for name, service in registered.items():
        handler = service.job.target
        assert getattr(handler, "func", handler).__name__ == "_async_admin_handler", name
