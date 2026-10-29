"""Generic factory for the per-platform profiles of an MQTT output (concept 13.2)."""

from __future__ import annotations

from ..core.errors import ErrorCode, OutputError


class ProfileFactory[T]:
    """Creates the profile of a platform from a table of profile classes."""

    def __init__(self, profiles: dict[str, type[T]]) -> None:
        """Keep the table of profile classes by platform."""
        self._profiles = profiles

    def create(self, platform: str) -> T:
        """Return the profile of `platform` or raise TDC-OUT-001."""
        profile = self._profiles.get(platform)
        if profile is None:
            raise OutputError(ErrorCode.OUT_UNSUPPORTED)
        return profile()
