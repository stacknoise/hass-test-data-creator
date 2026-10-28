"""Access to the recorder: writing and clearing long-term statistics."""

from __future__ import annotations

from collections.abc import Iterable

from homeassistant.components.recorder import get_instance
from homeassistant.components.recorder.models import StatisticData, StatisticMetaData
from homeassistant.components.recorder.statistics import async_import_statistics
from homeassistant.core import HomeAssistant

from ..core.errors import ConfigError, ErrorCode

RECORDER_DOMAIN = "recorder"


class StatisticsClient:
    """Writes and clears statistics of the recorder; fails with TDC-CFG-003 without a recorder."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Keep the Home Assistant instance."""
        self._hass = hass

    def available(self) -> bool:
        """Whether the recorder is loaded."""
        return RECORDER_DOMAIN in self._hass.config.components

    def check(self) -> None:
        """Raise TDC-CFG-003 if the recorder is not loaded."""
        if not self.available():
            raise ConfigError(ErrorCode.CFG_NO_RECORDER)

    def write(self, metadata: StatisticMetaData, rows: Iterable[StatisticData]) -> None:
        """Queue the hourly `rows` of one statistic; rows of the same hour are replaced."""
        self.check()
        async_import_statistics(self._hass, metadata, rows)

    def clear(self, statistic_ids: list[str]) -> None:
        """Queue the deletion of the statistics `statistic_ids`."""
        if statistic_ids:
            self.check()
            get_instance(self._hass).async_clear_statistics(statistic_ids)
