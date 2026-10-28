"""Config flow: one entry, created after the test environment confirmation (concept 10.4)."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
import voluptuous as vol

from .const import (
    CONF_IS_TEST_ENVIRONMENT,
    CONF_SEED,
    CONF_TICK_SECONDS,
    DEFAULT_SEED,
    DEFAULT_TICK_SECONDS,
    DOMAIN,
    MANUFACTURER,
    MAX_TICK_SECONDS,
    MIN_TICK_SECONDS,
)

ERROR_NOT_TEST_ENVIRONMENT = "not_test_environment"


class TestDataCreatorConfigFlow(ConfigFlow, domain=DOMAIN):
    """Asks once whether this is a test instance and for the seed and tick interval."""

    __test__ = False
    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Create the entry if the user confirms that this is a test environment."""
        errors: dict[str, str] = {}
        if user_input is not None:
            if user_input[CONF_IS_TEST_ENVIRONMENT]:
                return self.async_create_entry(
                    title=MANUFACTURER,
                    data={
                        CONF_SEED: user_input[CONF_SEED],
                        CONF_TICK_SECONDS: user_input[CONF_TICK_SECONDS],
                    },
                )
            errors["base"] = ERROR_NOT_TEST_ENVIRONMENT
        schema = vol.Schema(
            {
                vol.Required(CONF_IS_TEST_ENVIRONMENT, default=False): bool,
                vol.Required(CONF_SEED, default=DEFAULT_SEED): str,
                vol.Required(CONF_TICK_SECONDS, default=DEFAULT_TICK_SECONDS): vol.All(
                    int, vol.Range(min=MIN_TICK_SECONDS, max=MAX_TICK_SECONDS)
                ),
            }
        )
        return self.async_show_form(step_id="user", data_schema=schema, errors=errors)
