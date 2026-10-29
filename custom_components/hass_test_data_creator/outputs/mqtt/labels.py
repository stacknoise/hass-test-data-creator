"""Puts the label "test data" on the devices that MQTT discovery creates for generated devices."""

from __future__ import annotations

from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers import device_registry as dr

from ...const import OUTPUT_MQTT
from ...core.labels import marker_label_id
from ...model.identifiers import mqtt_device_identifier

PREFIX = mqtt_device_identifier("")
ACTION_CREATE = "create"


class MqttLabeler:
    """Home Assistant creates the registry device of an MQTT entity; this adds the label to it."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Keep the instance."""
        self._hass = hass
        self._unsubscribe: CALLBACK_TYPE | None = None

    def start(self) -> None:
        """Label the devices that exist and every device that is created from now on."""
        registry = dr.async_get(self._hass)
        for entry in list(registry.devices):
            self._label(entry)
        self._unsubscribe = self._hass.bus.async_listen(
            dr.EVENT_DEVICE_REGISTRY_UPDATED, self._on_registry_update
        )

    def stop(self) -> None:
        """Stop following the device registry."""
        if self._unsubscribe is not None:
            self._unsubscribe()
            self._unsubscribe = None

    @callback
    def _on_registry_update(self, event: Event[dr.EventDeviceRegistryUpdatedData]) -> None:
        """Label a device that was just created."""
        if event.data["action"] != ACTION_CREATE:
            return
        entry = dr.async_get(self._hass).async_get(event.data["device_id"])
        if entry is not None:
            self._label(entry)

    def _label(self, entry: dr.DeviceEntry) -> None:
        """Add the label to `entry` if MQTT discovery created it for a generated device."""
        if not any(
            domain == OUTPUT_MQTT and identifier.startswith(PREFIX)
            for domain, identifier in entry.identifiers
        ):
            return
        label_id = marker_label_id(self._hass)
        if label_id not in entry.labels:
            dr.async_get(self._hass).async_update_device(
                entry.id, labels=set(entry.labels) | {label_id}
            )
