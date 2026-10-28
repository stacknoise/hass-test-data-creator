"""Distribution of new devices over areas (concept 4.1, 7.2)."""

from __future__ import annotations

from ..engine.signals import hash01

MODE_EVEN = "even"
MODE_RANDOM = "random"
MODES = (MODE_EVEN, MODE_RANDOM)


def distribute(names: list[str], count: int, mode: str, seed: int) -> list[str | None]:
    """Return an area name (or None without areas) for each of `count` devices.

    `even` hands the areas out in turn, `random` picks one per device from the seed.
    """
    if not names:
        return [None] * count
    if mode == MODE_RANDOM:
        return [names[int(hash01(seed, index) * len(names))] for index in range(count)]
    return [names[index % len(names)] for index in range(count)]
