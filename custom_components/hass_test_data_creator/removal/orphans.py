"""Finds retained MQTT topics of generated devices that the store does not know (concept 10.5)."""

from __future__ import annotations

import re

from ..audit.factory import AuditEntryFactory
from ..audit.log import AuditLog
from ..const import DISCOVERY_PREFIX
from ..core.ids import ID_LENGTH
from ..outputs.mqtt.client import MqttClient
from ..outputs.z2m.devices import FOREIGN_BASE_TOPIC
from ..store.store import TdcStore

DISCOVERY_PATTERN = f"{DISCOVERY_PREFIX}/+/tdc_+/+/config"
DISCOVERY_TOPIC = re.compile(rf"^{DISCOVERY_PREFIX}/[a-z_]+/tdc_[^/]+/[^/]+/config$")
DEVICE_ID = re.compile(rf"^[0-9a-f]{{{ID_LENGTH}}}$")


class OrphanScanner:
    """Lists and clears the retained topics left behind when the store was lost or damaged."""

    def __init__(
        self,
        client: MqttClient,
        store: TdcStore,
        bases: tuple[str, str],
        audit: AuditLog,
        audit_factory: AuditEntryFactory,
    ) -> None:
        """Keep the client, the store, the MQTT and Zigbee2MQTT base topics and the audit log."""
        self._client = client
        self._store = store
        self._mqtt_base, self._z2m_base = bases
        self._audit = audit
        self._audit_factory = audit_factory

    async def async_scan(self) -> list[str]:
        """Return the retained topics of generated devices that the store did not record, sorted.

        Only the own base topics and the discovery topics of ids that start with `tdc_` are
        looked at. The Zigbee2MQTT default base topic is never scanned, because other devices
        may publish there.
        """
        found = await self._client.async_collect(self._patterns())
        recorded = set(self._store.topics())
        return sorted(topic for topic in found if topic not in recorded and self._is_ours(topic))

    async def async_clear(self, topics: list[str]) -> list[str]:
        """Delete those of `topics` that a new scan finds as well; return the deleted ones.

        A topic that the scan does not report is never touched, whatever the caller sends.
        """
        wanted = set(topics)
        chosen = [topic for topic in await self.async_scan() if topic in wanted]
        await self._client.async_clear(chosen)
        self._audit.record(self._audit_factory.orphan_topics_cleared(len(chosen)))
        return chosen

    def _patterns(self) -> list[str]:
        """Return the topic filters of a scan."""
        patterns = [DISCOVERY_PATTERN, f"{self._mqtt_base}/#"]
        if self._z2m_base != FOREIGN_BASE_TOPIC:
            patterns.append(f"{self._z2m_base}/#")
        return patterns

    def _is_ours(self, topic: str) -> bool:
        """Whether `topic` is one of a generated device: discovery, MQTT state or Zigbee2MQTT."""
        if DISCOVERY_TOPIC.match(topic):
            return True
        if topic.startswith(f"{self._mqtt_base}/"):
            return bool(DEVICE_ID.match(topic.split("/")[self._mqtt_base.count("/") + 1]))
        return self._z2m_base != FOREIGN_BASE_TOPIC and topic.startswith(f"{self._z2m_base}/")
