"""Plans the runs of schedules for a time range (concept 6.4)."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
import zlib

from homeassistant.util import dt as dt_util

from ..model.models import ScheduleDef
from .triggers import TriggerFactory


@dataclass(frozen=True, order=True)
class PlannedRun:
    """One planned run: the moment and the schedule it belongs to."""

    when: datetime
    schedule_id: str


def day_seed(schedule: ScheduleDef, day_text: str) -> int:
    """Return the seed of one schedule on one day; the same input always gives the same seed."""
    return zlib.crc32(f"{schedule.seed}:{schedule.id}:{day_text}".encode())


class SchedulePlanner:
    """Draws the times of every day from (schedule seed, date), so the same seed gives the same day."""

    def __init__(self, triggers: TriggerFactory) -> None:
        """Keep the factory that builds the triggers."""
        self._triggers = triggers

    def plan(
        self, schedules: list[ScheduleDef], start: datetime, end: datetime
    ) -> list[PlannedRun]:
        """Return the runs of all enabled schedules from `start` (included) to `end` (excluded)."""
        local_start = dt_util.as_local(start)
        last_day = dt_util.as_local(end).date()
        planned: list[PlannedRun] = []
        for schedule in schedules:
            if not schedule.enabled:
                continue
            trigger = self._triggers.create(schedule.trigger)
            day = local_start.date()
            while day <= last_day:
                origin = dt_util.start_of_local_day(day)
                for seconds in trigger.seconds_for_day(day, day_seed(schedule, day.isoformat())):
                    when = origin + timedelta(seconds=seconds)
                    if start <= when < end:
                        planned.append(PlannedRun(when, schedule.id))
                day += timedelta(days=1)
        return sorted(planned)
