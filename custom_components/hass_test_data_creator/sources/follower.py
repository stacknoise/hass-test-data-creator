"""One subscription per source entity, however many copies follow it (concept 17.5)."""

from __future__ import annotations

from collections.abc import Callable
from typing import TYPE_CHECKING

from homeassistant.core import CALLBACK_TYPE, Event, EventStateChangedData, HomeAssistant, callback
from homeassistant.helpers.event import async_track_state_change_event

if TYPE_CHECKING:
    from .binding import SourceBinding


class SourceFollower:
    """Tells the bindings of an entity when its state changes; subscribes once per entity."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Keep the instance."""
        self._hass = hass
        self._bindings: dict[str, list[SourceBinding]] = {}
        self._unsubscribe: dict[str, CALLBACK_TYPE] = {}

    def attach(self, binding: SourceBinding) -> None:
        """Follow the entity of `binding`; the first binding of an entity subscribes."""
        entity_id = binding.entity_id
        self._bindings.setdefault(entity_id, []).append(binding)
        if entity_id not in self._unsubscribe:
            self._unsubscribe[entity_id] = async_track_state_change_event(
                self._hass, [entity_id], self._on_change
            )

    def detach(self, binding: SourceBinding) -> None:
        """Stop telling `binding`; the last binding of an entity cancels the subscription."""
        entity_id = binding.entity_id
        bindings = self._bindings.get(entity_id, [])
        if binding in bindings:
            bindings.remove(binding)
        if not bindings:
            self._bindings.pop(entity_id, None)
            cancel: Callable[[], None] | None = self._unsubscribe.pop(entity_id, None)
            if cancel is not None:
                cancel()

    def stop(self) -> None:
        """Cancel every subscription."""
        for cancel in self._unsubscribe.values():
            cancel()
        self._unsubscribe.clear()
        self._bindings.clear()

    @callback
    def _on_change(self, event: Event[EventStateChangedData]) -> None:
        """Hand a new state to every binding of the entity and tell them to show it."""
        for binding in list(self._bindings.get(event.data["entity_id"], [])):
            binding.observe()
            binding.notify()
