"""Constants of the HASS Test Data Creator."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "hass_test_data_creator"
MANUFACTURER: Final = "HASS Test Data Creator"
LABEL_NAME: Final = "test data"

# WebSocket API for the panel (concept 8.2).
API_VERSION: Final = 1
FEATURES: Final = (
    "areas",
    "faults",
    "mqtt_discovery",
    "native_output",
    "removal",
    "scenarios",
    "schedules",
    "statistics_backfill",
    "templates",
    "time_lapse",
    "z2m_bridge",
    "z2m_groups",
)

# Storage (concept 4.3).
STORE_KEY: Final = f"{DOMAIN}.data"
STORE_VERSION: Final = 1
SAVE_DELAY_SECONDS: Final = 5

# Config entry data.
CONF_IS_TEST_ENVIRONMENT: Final = "is_test_environment"
CONF_SEED: Final = "seed"
CONF_TICK_SECONDS: Final = "tick_seconds"
CONF_MQTT_BASE_TOPIC: Final = "mqtt_base_topic"
CONF_Z2M_BASE_TOPIC: Final = "z2m_base_topic"
CONF_Z2M_CONFIRM_DEFAULT: Final = "z2m_confirm_default_topic"
CONF_TIME_LAPSE: Final = "time_lapse"
DEFAULT_TIME_LAPSE: Final = 1.0
MIN_TIME_LAPSE: Final = 1.0
MAX_TIME_LAPSE: Final = 10000.0
DEFAULT_SEED: Final = "tdc-0042"
DEFAULT_TICK_SECONDS: Final = 10
MIN_TICK_SECONDS: Final = 1
MAX_TICK_SECONDS: Final = 3600

# Limits (concept 12).
MAX_DEVICES: Final = 2000
MAX_ENTITIES_PER_DEVICE: Final = 40
MAX_BATCH: Final = 500
CHUNK_SIZE: Final = 25
SLOW_TICK_RATIO: Final = 0.5
MAX_HISTORY_DAYS: Final = 365
DEFAULT_HISTORY_DAYS: Final = 7
MAX_HISTORY_ROWS: Final = 500_000
MAX_PAGE_SIZE: Final = 500
DEFAULT_PAGE_SIZE: Final = 200

# Dispatcher signals.
SIGNAL_TICK: Final = f"{DOMAIN}_tick"
SIGNAL_DEVICES_ADDED: Final = f"{DOMAIN}_devices_added"

# Platforms of the native output.
PLATFORMS: Final = (
    "binary_sensor",
    "climate",
    "cover",
    "event",
    "light",
    "sensor",
    "switch",
)

# Outputs (concept 7). Only the native output exists in v0.1.
DEFAULT_MQTT_BASE_TOPIC: Final = "tdc"
DEFAULT_Z2M_BASE_TOPIC: Final = "tdc_z2m"
DISCOVERY_PREFIX: Final = "homeassistant"
OUTPUT_NATIVE: Final = "native"
OUTPUT_MQTT: Final = "mqtt"
OUTPUT_Z2M: Final = "z2m"
OUTPUTS: Final = (OUTPUT_NATIVE, OUTPUT_MQTT, OUTPUT_Z2M)

# Panel (concept 9).
PANEL_URL_PATH: Final = "hass-test-data-creator"
PANEL_ELEMENT: Final = "hass-test-data-creator-panel"
PANEL_FILE: Final = "hass-test-data-creator-panel.js"
PANEL_STATIC_URL: Final = "/hass_test_data_creator_static"

# Custom template id of devices defined by hand.
CUSTOM_TEMPLATE_ID: Final = "custom"
