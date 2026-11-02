"""Preview of the deviations of several copies against one source value (concept 17.6)."""

from __future__ import annotations

from typing import Any

from ..engine.behaviour_factory import entity_seed
from ..templates.device_factory import device_seed
from .deviation import Deviation, bucket_of, deviate, lag_of

PREVIEW_TEMPLATE = "source"


def preview(
    value: float,
    seed_text: str,
    key: str,
    count: int,
    deviation: Deviation,
    span: float = 0.0,
    interval_s: float = 60.0,
    at: float = 0.0,
    template: str = PREVIEW_TEMPLATE,
) -> list[dict[str, Any]]:
    """Return what `count` copies would show for a source `value`, nothing is created.

    The seeds follow the rule of the creation: one device seed per number (from 1), one seed per
    entity. The numbers are those of a first job; later jobs continue the count of the template.
    """
    bucket = bucket_of(at, interval_s)
    rows = []
    for index in range(1, count + 1):
        seed = entity_seed(device_seed(seed_text, template, index), key)
        rows.append(
            {
                "index": index,
                "value": deviate(value, seed, bucket, deviation, span),
                "lag_s": lag_of(seed, deviation),
            }
        )
    return rows
