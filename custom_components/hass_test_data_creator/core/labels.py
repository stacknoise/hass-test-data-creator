"""The label that marks the registry devices of generated test data (concept 4.4)."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from homeassistant.helpers import label_registry as lr

from ..const import LABEL_NAME


def marker_label_id(hass: HomeAssistant) -> str:
    """Return the id of the label "test data"; create the label if it does not exist."""
    labels = lr.async_get(hass)
    label = labels.async_get_label_by_name(LABEL_NAME) or labels.async_create(LABEL_NAME)
    return label.label_id
