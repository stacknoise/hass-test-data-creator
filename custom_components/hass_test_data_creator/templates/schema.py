"""Voluptuous schemas of templates and custom entities (concept 4.2)."""

from __future__ import annotations

from homeassistant.components.sensor import SensorStateClass
from homeassistant.helpers import config_validation as cv
import voluptuous as vol

from ..const import MAX_ENTITIES_PER_DEVICE, PLATFORMS

SIGNAL_SCHEMA = vol.Schema(
    {
        vol.Required("shape"): str,
        vol.Optional("min"): vol.Coerce(float),
        vol.Optional("max"): vol.Coerce(float),
        vol.Optional("period_s"): vol.All(vol.Coerce(float), vol.Range(min=1)),
        vol.Optional("interval_s"): vol.All(vol.Coerce(float), vol.Range(min=1)),
        vol.Optional("noise"): vol.All(vol.Coerce(float), vol.Range(min=0, max=1)),
        vol.Optional("decimals"): vol.All(int, vol.Range(min=0, max=6)),
        vol.Optional("phase"): vol.Coerce(float),
        vol.Optional("rate_per_hour"): vol.Coerce(float),
        vol.Optional("file"): vol.All(str, vol.Match(r"^[A-Za-z0-9_.-]{1,64}\.csv$")),
        vol.Optional("step_s"): vol.All(vol.Coerce(float), vol.Range(min=1)),
        vol.Optional("values"): vol.All([str], vol.Length(min=1, max=50)),
        vol.Optional("weights"): vol.All([vol.Coerce(float)], vol.Length(min=1, max=50)),
        vol.Optional("states"): vol.All(
            [
                vol.Schema(
                    {
                        vol.Required("value"): str,
                        vol.Required("duration_s"): vol.All(vol.Coerce(float), vol.Range(min=1)),
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
        vol.Required("platform"): vol.In(PLATFORMS),
        vol.Required("name"): vol.All(str, vol.Length(min=1, max=64)),
        vol.Optional("device_class"): str,
        vol.Optional("unit"): str,
        vol.Optional("state_class"): vol.In([item.value for item in SensorStateClass]),
        vol.Optional("entity_category"): vol.In(["config", "diagnostic"]),
        vol.Optional("signal"): SIGNAL_SCHEMA,
        vol.Optional("event_types"): vol.All([str], vol.Length(min=1)),
        vol.Optional("initial_on"): bool,
        vol.Optional("pulse_s"): vol.All(int, vol.Range(min=1, max=3600)),
    },
    extra=vol.PREVENT_EXTRA,
)

TEMPLATE_SCHEMA = vol.Schema(
    {
        vol.Required("id"): cv.slug,
        vol.Required("name"): vol.All(str, vol.Length(min=1, max=64)),
        vol.Required("model"): vol.All(str, vol.Length(min=1, max=64)),
        vol.Required("entities"): vol.All([dict], vol.Length(min=1, max=MAX_ENTITIES_PER_DEVICE)),
        vol.Optional("z2m"): vol.Schema(
            {
                vol.Optional("vendor"): str,
                vol.Optional("model"): str,
                vol.Optional("description"): str,
                vol.Optional("power_source"): str,
                vol.Optional("type"): vol.In(["Router", "EndDevice"]),
            }
        ),
    },
    extra=vol.PREVENT_EXTRA,
)
