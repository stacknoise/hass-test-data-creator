"""Voluptuous schemas of templates and custom entities (concept 4.2)."""

from __future__ import annotations

import math

from homeassistant.components.sensor import SensorStateClass
from homeassistant.helpers import config_validation as cv
import voluptuous as vol

from ..const import (
    MAX_ENTITIES_PER_DEVICE,
    MAX_RATE_PER_HOUR,
    MAX_SIGNAL_PERIOD_SECONDS,
    PLATFORMS,
)
from ..core.keys import (
    KEY_DESCRIPTION,
    KEY_DEVICE_CLASS,
    KEY_DURATION_S,
    KEY_ENTITIES,
    KEY_EVENT_TYPES,
    KEY_ID,
    KEY_MAX,
    KEY_MIN,
    KEY_MODEL,
    KEY_NAME,
    KEY_NOISE,
    KEY_PLATFORM,
    KEY_POWER_SOURCE,
    KEY_SHAPE,
    KEY_SIGNAL,
    KEY_STATE_CLASS,
    KEY_STATES,
    KEY_TYPE,
    KEY_UNIT,
    KEY_VALUE,
    KEY_VALUES,
    KEY_VENDOR,
)


def _finite(value: float) -> float:
    """Return `value` as a finite number or raise `vol.Invalid`."""
    if not math.isfinite(value):
        raise vol.Invalid("a finite number is required")
    return value


_FINITE = vol.All(vol.Coerce(float), _finite)
_PERIOD = vol.All(_FINITE, vol.Range(min=1, max=MAX_SIGNAL_PERIOD_SECONDS))

SIGNAL_SCHEMA = vol.Schema(
    {
        vol.Required(KEY_SHAPE): str,
        vol.Optional(KEY_MIN): _FINITE,
        vol.Optional(KEY_MAX): _FINITE,
        vol.Optional("period_s"): _PERIOD,
        vol.Optional("interval_s"): _PERIOD,
        vol.Optional(KEY_NOISE): vol.All(vol.Coerce(float), vol.Range(min=0, max=1)),
        vol.Optional("decimals"): vol.All(int, vol.Range(min=0, max=6)),
        vol.Optional("phase"): _FINITE,
        vol.Optional("rate_per_hour"): vol.All(_FINITE, vol.Range(min=0, max=MAX_RATE_PER_HOUR)),
        vol.Optional("file"): vol.All(str, vol.Match(r"^[A-Za-z0-9_.-]{1,64}\.csv$")),
        vol.Optional("step_s"): _PERIOD,
        vol.Optional(KEY_VALUES): vol.All([str], vol.Length(min=1, max=50)),
        vol.Optional("weights"): vol.All([_FINITE], vol.Length(min=1, max=50)),
        vol.Optional(KEY_STATES): vol.All(
            [
                vol.Schema(
                    {
                        vol.Required(KEY_VALUE): str,
                        vol.Required(KEY_DURATION_S): _PERIOD,
                    }
                )
            ],
            vol.Length(min=1, max=50),
        ),
    },
    extra=vol.PREVENT_EXTRA,
)

ENTITY_SCHEMA = vol.Schema(
    {
        vol.Required("key"): cv.slug,
        vol.Required(KEY_PLATFORM): vol.In(PLATFORMS),
        vol.Required(KEY_NAME): vol.All(str, vol.Length(min=1, max=64)),
        vol.Optional(KEY_DEVICE_CLASS): str,
        vol.Optional(KEY_UNIT): str,
        vol.Optional(KEY_STATE_CLASS): vol.In([item.value for item in SensorStateClass]),
        vol.Optional("entity_category"): vol.In(["config", "diagnostic"]),
        vol.Optional(KEY_SIGNAL): SIGNAL_SCHEMA,
        vol.Optional(KEY_EVENT_TYPES): vol.All([str], vol.Length(min=1)),
        vol.Optional("initial_on"): bool,
        vol.Optional("pulse_s"): vol.All(int, vol.Range(min=1, max=3600)),
    },
    extra=vol.PREVENT_EXTRA,
)

TEMPLATE_SCHEMA = vol.Schema(
    {
        vol.Required(KEY_ID): cv.slug,
        vol.Required(KEY_NAME): vol.All(str, vol.Length(min=1, max=64)),
        vol.Required(KEY_MODEL): vol.All(str, vol.Length(min=1, max=64)),
        vol.Required(KEY_ENTITIES): vol.All([dict], vol.Length(min=1, max=MAX_ENTITIES_PER_DEVICE)),
        vol.Optional("z2m"): vol.Schema(
            {
                vol.Optional(KEY_VENDOR): str,
                vol.Optional(KEY_MODEL): str,
                vol.Optional(KEY_DESCRIPTION): str,
                vol.Optional(KEY_POWER_SOURCE): str,
                vol.Optional(KEY_TYPE): vol.In(["Router", "EndDevice"]),
            }
        ),
    },
    extra=vol.PREVENT_EXTRA,
)
