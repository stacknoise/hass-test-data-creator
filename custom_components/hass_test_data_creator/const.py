"""Constants of the HASS Test Data Creator."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "hass_test_data_creator"
MANUFACTURER: Final = "HASS Test Data Creator"
LABEL_NAME: Final = "test data"

# WebSocket API for the panel (concept 8.2).
API_VERSION: Final = 2
FEATURES: Final = (
    "areas",
    "csv_replay",
    "bulk_actions",
    "device_filter",
    "device_names",
    "duplicate",
    "export",
    "import",
    "faults",
    "list_filters",
    "mqtt_discovery",
    "native_output",
    "pause",
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
STORE_VERSION: Final = 3
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
HISTORY_CHUNK_ROWS: Final = 20_000
MAX_AREA_NAME: Final = 64
MAX_SHORT_TEXT: Final = 128
MAX_AREAS_PER_JOB: Final = 100
MAX_PARAMS_BYTES: Final = 2048
MAX_TRIGGER_BYTES: Final = 4096
MAX_ENTITIES_BYTES: Final = 64 * 1024
MAX_SCHEDULES: Final = 200
MAX_SCENARIOS: Final = 100
MAX_GROUPS: Final = 100
MAX_PAGE_SIZE: Final = 500
MAX_FILTER_VALUES: Final = 50
MAX_TRANSFER_BYTES: Final = 32 * 1024 * 1024
MAX_SIGNAL_PERIOD_SECONDS: Final = 366 * 86400
MAX_RATE_PER_HOUR: Final = 3600
MAX_USER_TEMPLATES: Final = 200
MAX_TEMPLATE_FILE_BYTES: Final = 256 * 1024
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
MAX_BASE_TOPIC_LENGTH: Final = 64
MAX_LIGHT_BRIGHTNESS: Final = 255
MAX_LATE_MESSAGES: Final = 100
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
DEFAULT_MODEL: Final = "Custom"

# Seconds in the units of a time of day.
SECONDS_PER_MINUTE: Final = 60
SECONDS_PER_HOUR: Final = 3600

# The positions of a cover, in percent, and the step of a temperature, in degrees.
COVER_CLOSED_POSITION: Final = 0
COVER_OPEN_POSITION: Final = 100
TEMPERATURE_STEP: Final = 0.5
