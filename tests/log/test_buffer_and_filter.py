"""The ring buffer and the filter of the live log, without Home Assistant."""

from __future__ import annotations

from custom_components.hass_test_data_creator.log.buffer import LogBuffer
from custom_components.hass_test_data_creator.log.entry import LogEntry
from custom_components.hass_test_data_creator.log.filters import LogFilter


def entry(seq: int, **fields: object) -> LogEntry:
    """Return a log entry; `fields` replace the defaults."""
    values: dict[str, object] = {
        "seq": seq,
        "at": 1000.0 + seq,
        "device_id": "d1",
        "device": "Plug 01",
        "key": "power",
        "name": "Power",
        "template": "plug_metering",
        "area": "Kitchen",
        "run_id": "r1",
        "output": "native",
        "platform": "sensor",
        "device_class": "power",
        "unit": "W",
        "old": "10",
        "new": "12.5",
        "cause": "signal",
    }
    values.update(fields)
    return LogEntry(**values)  # type: ignore[arg-type]


def filled(count: int, capacity: int = 100) -> LogBuffer:
    """Return a buffer with `count` entries made through `next_seq`."""
    buffer = LogBuffer(capacity)
    for _ in range(count):
        buffer.append(entry(buffer.next_seq()))
    return buffer


def everything(_: LogEntry) -> bool:
    return True


def test_entries_get_rising_numbers_and_are_read_oldest_first() -> None:
    buffer = filled(5)
    entries, dropped = buffer.read(0, 10, everything)
    assert [item.seq for item in entries] == [1, 2, 3, 4, 5]
    assert dropped == 0
    assert buffer.last_seq == 5


def test_a_reader_gets_only_what_is_new_and_the_oldest_first_when_limited() -> None:
    buffer = filled(10)
    entries, _ = buffer.read(4, 3, everything)
    assert [item.seq for item in entries] == [5, 6, 7]


def test_newest_first_returns_the_newest_entries() -> None:
    buffer = filled(10)
    entries, _ = buffer.read(0, 3, everything, newest_first=True)
    assert [item.seq for item in entries] == [10, 9, 8]


def test_the_oldest_entries_drop_out_and_a_reader_is_told() -> None:
    buffer = filled(10, capacity=4)
    assert buffer.size == 4
    entries, dropped = buffer.read(2, 10, everything)
    assert [item.seq for item in entries] == [7, 8, 9, 10]
    assert dropped == 4
    assert buffer.read(0, 10, everything)[1] == 0


def test_clear_does_not_count_as_dropped_and_numbers_go_on() -> None:
    buffer = filled(3)
    buffer.clear()
    assert buffer.size == 0
    buffer.append(entry(buffer.next_seq()))
    entries, dropped = buffer.read(3, 10, everything)
    assert [item.seq for item in entries] == [4]
    assert dropped == 0


def test_a_smaller_buffer_keeps_the_newest_entries() -> None:
    buffer = filled(10)
    buffer.resize(3)
    assert [item.seq for item in buffer.read(0, 10, everything)[0]] == [8, 9, 10]
    assert buffer.capacity == 3


def test_the_filter_is_applied_while_reading() -> None:
    buffer = LogBuffer(10)
    for key in ("power", "energy", "power"):
        buffer.append(entry(buffer.next_seq(), key=key))
    flt = LogFilter.from_request({"entities": ["power"]})
    assert [item.seq for item in buffer.read(0, 10, flt.matches)[0]] == [1, 3]


def test_an_empty_filter_lets_everything_pass() -> None:
    assert LogFilter.from_request(None).is_empty
    assert LogFilter.from_request({}).matches(entry(1))


def test_groups_match_by_id_or_name_and_combine_with_and() -> None:
    sample = entry(1)
    assert LogFilter.from_request({"devices": ["d1"]}).matches(sample)
    assert LogFilter.from_request({"devices": ["Plug 01"]}).matches(sample)
    assert not LogFilter.from_request({"devices": ["other"]}).matches(sample)
    both = {"devices": ["d1"], "causes": ["fault"]}
    assert not LogFilter.from_request(both).matches(sample)
    assert LogFilter.from_request({"causes": ["fault", "signal"]}).matches(sample)


def test_the_area_filter_can_ask_for_no_area() -> None:
    assert LogFilter.from_request({"areas": [""]}).matches(entry(1, area=""))
    assert not LogFilter.from_request({"areas": [""]}).matches(entry(1))


def test_the_text_search_looks_at_device_entity_and_values_without_case() -> None:
    assert LogFilter.from_request({"query": "PLUG"}).matches(entry(1))
    assert LogFilter.from_request({"query": "12.5"}).matches(entry(1))
    assert LogFilter.from_request({"query": "unavail"}).matches(entry(1, new="unavailable"))
    assert not LogFilter.from_request({"query": "boiler"}).matches(entry(1))


def test_only_numeric_and_the_smallest_change() -> None:
    numeric = LogFilter.from_request({"only_numeric": True})
    assert numeric.matches(entry(1))
    assert not numeric.matches(entry(1, new="unavailable"))
    big = LogFilter.from_request({"min_delta": 5})
    assert not big.matches(entry(1))
    assert big.matches(entry(1, new="20"))
    assert not big.matches(entry(1, old=None, new="20"))


def test_the_time_window() -> None:
    window = LogFilter.from_request({"from": 1002.0, "to": 1004.0})
    assert [seq for seq in range(1, 7) if window.matches(entry(seq))] == [2, 3, 4]


def test_the_delta_of_an_entry() -> None:
    assert entry(1).delta == 2.5
    assert entry(1, old="on", new="off").delta is None
    assert entry(1).as_dict()["delta"] == 2.5
