"""Config flow: one entry, created after the test environment confirmation (concept 10.4)."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.core import callback
import voluptuous as vol

from .const import (
    CONF_IS_TEST_ENVIRONMENT,
    CONF_MQTT_BASE_TOPIC,
    CONF_SEED,
    CONF_TICK_SECONDS,
    CONF_TIME_LAPSE,
    CONF_Z2M_BASE_TOPIC,
    CONF_Z2M_CONFIRM_DEFAULT,
    DEFAULT_MQTT_BASE_TOPIC,
    DEFAULT_SEED,
    DEFAULT_TICK_SECONDS,
    DEFAULT_TIME_LAPSE,
    DEFAULT_Z2M_BASE_TOPIC,
    DOMAIN,
    MANUFACTURER,
    MAX_TICK_SECONDS,
    MAX_TIME_LAPSE,
    MIN_TICK_SECONDS,
    MIN_TIME_LAPSE,
)

ERROR_NOT_TEST_ENVIRONMENT = "not_test_environment"
ERROR_INVALID_TOPIC = "invalid_topic"
ERROR_SAME_TOPIC = "same_topic"
ERROR_UNCONFIRMED_TOPIC = "unconfirmed_default_topic"
FOREIGN_BASE_TOPIC = "zigbee2mqtt"
WILDCARDS = ("+", "#")


def _valid_topic(topic: str) -> bool:
    """Whether `topic` can be a base topic: not empty, no wildcards, no slash at the ends."""
    return (
        bool(topic) and not any(mark in topic for mark in WILDCARDS) and topic.strip("/") == topic
    )


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

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        """Return the options flow with the MQTT base topics and the time lapse."""
        return TestDataCreatorOptionsFlow()


class TestDataCreatorOptionsFlow(OptionsFlow):
    """Sets the MQTT base topics and the time lapse; the entry reloads after a change."""

    __test__ = False

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Check the topics and store them as options."""
        errors: dict[str, str] = {}
        current = self.config_entry.options
        if user_input is not None:
            errors = self._errors(user_input)
            if not errors:
                return self.async_create_entry(data=user_input)
            current = user_input
        schema = vol.Schema(
            {
                vol.Required(
                    CONF_MQTT_BASE_TOPIC,
                    default=current.get(CONF_MQTT_BASE_TOPIC, DEFAULT_MQTT_BASE_TOPIC),
                ): str,
                vol.Required(
                    CONF_Z2M_BASE_TOPIC,
                    default=current.get(CONF_Z2M_BASE_TOPIC, DEFAULT_Z2M_BASE_TOPIC),
                ): str,
                vol.Required(
                    CONF_Z2M_CONFIRM_DEFAULT, default=current.get(CONF_Z2M_CONFIRM_DEFAULT, False)
                ): bool,
                vol.Required(
                    CONF_TIME_LAPSE, default=current.get(CONF_TIME_LAPSE, DEFAULT_TIME_LAPSE)
                ): vol.All(vol.Coerce(float), vol.Range(min=MIN_TIME_LAPSE, max=MAX_TIME_LAPSE)),
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema, errors=errors)

    def _errors(self, values: dict[str, Any]) -> dict[str, str]:
        """Return the error of the first wrong field."""
        mqtt, z2m = values[CONF_MQTT_BASE_TOPIC], values[CONF_Z2M_BASE_TOPIC]
        if not _valid_topic(mqtt):
            return {CONF_MQTT_BASE_TOPIC: ERROR_INVALID_TOPIC}
        if not _valid_topic(z2m):
            return {CONF_Z2M_BASE_TOPIC: ERROR_INVALID_TOPIC}
        if mqtt == z2m:
            return {CONF_Z2M_BASE_TOPIC: ERROR_SAME_TOPIC}
        if z2m == FOREIGN_BASE_TOPIC and not values[CONF_Z2M_CONFIRM_DEFAULT]:
            return {CONF_Z2M_BASE_TOPIC: ERROR_UNCONFIRMED_TOPIC}
        return {}
