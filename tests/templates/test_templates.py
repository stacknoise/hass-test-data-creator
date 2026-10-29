"""Templates: bundled files, custom entities, name patterns and seeds."""

from __future__ import annotations

from pathlib import Path

from homeassistant.core import HomeAssistant
import pytest

from custom_components.hass_test_data_creator.const import MAX_TEMPLATE_FILE_BYTES
from custom_components.hass_test_data_creator.core.errors import (
    ErrorCode,
    GenerationError,
    TemplateError,
)
from custom_components.hass_test_data_creator.templates.device_factory import (
    DeviceFactory,
    device_seed,
    format_name,
)
from custom_components.hass_test_data_creator.templates.factory import TemplateFactory
from custom_components.hass_test_data_creator.templates.registry import (
    USER_DIR_NAME,
    TemplateRegistry,
)

SENSOR = {"key": "level", "platform": "sensor", "name": "Level", "signal": {"shape": "sine"}}
BUNDLED = {
    "plug_metering",
    "wall_button",
    "climate_sensor",
    "motion_sensor",
    "contact_sensor",
    "light",
    "cover",
    "thermostat",
    "washer",
}


async def test_bundled_templates_load(hass: HomeAssistant) -> None:
    registry = TemplateRegistry(TemplateFactory())
    await registry.async_load(hass)
    assert {item.id for item in registry.all()} >= BUNDLED
    plug = registry.get("plug_metering")
    assert {e.platform for e in plug.entities} == {"switch", "sensor"}
    with pytest.raises(TemplateError) as missing:
        registry.get("nope")
    assert missing.value.code is ErrorCode.TPL_NOT_FOUND


def test_custom_template_is_validated() -> None:
    factory = TemplateFactory()
    assert factory.custom([SENSOR]).entities[0].key == "level"
    with pytest.raises(TemplateError) as no_signal:
        factory.custom([{"key": "a", "platform": "sensor", "name": "A"}])
    assert no_signal.value.code is ErrorCode.TPL_INVALID
    with pytest.raises(TemplateError) as shape:
        factory.custom([{**SENSOR, "signal": {"shape": "zigzag"}}])
    assert shape.value.code is ErrorCode.TPL_UNKNOWN_SHAPE
    with pytest.raises(TemplateError):
        factory.custom([SENSOR, SENSOR])
    with pytest.raises(TemplateError):
        factory.custom([{**SENSOR, "device_class": "not_a_class"}])


def test_too_many_entities_are_rejected() -> None:
    entities = [{**SENSOR, "key": f"s{i}"} for i in range(41)]
    with pytest.raises(GenerationError) as error:
        TemplateFactory().custom(entities)
    assert error.value.code is ErrorCode.GEN_ENTITY_LIMIT


def test_name_pattern() -> None:
    template = TemplateFactory().custom([SENSOR])
    assert format_name("Plug {nn}", 3, template) == "Plug 03"
    assert format_name("{template} #{n}", 12, template) == "Custom device #12"
    with pytest.raises(GenerationError) as error:
        format_name("Plug {unknown}", 1, template)
    assert error.value.code is ErrorCode.GEN_NAME_PATTERN


def test_devices_are_numbered_and_seeded_deterministically() -> None:
    template = TemplateFactory().custom([SENSOR])
    kwargs = {
        "name_pattern": "D{nn}",
        "first_index": 5,
        "areas": ["a", None],
        "seed_text": "s",
        "run_id": "r",
        "output": "native",
        "now": 1.0,
    }
    first = DeviceFactory().create(template, **kwargs)
    second = DeviceFactory().create(template, **kwargs)
    assert [d.name for d in first] == ["D05", "D06"]
    assert [d.area for d in first] == ["a", None]
    assert [d.seed for d in first] == [d.seed for d in second]
    assert first[0].seed == device_seed("s", "custom", 5)
    assert first[0].id != second[0].id


@pytest.mark.parametrize(
    "signal",
    [
        {"shape": "sine", "min": float("nan")},
        {"shape": "sine", "max": float("inf")},
        {"shape": "sine", "phase": float("nan")},
        {"shape": "sine", "period_s": 1e12},
        {"shape": "counter", "rate_per_hour": float("inf")},
        {"shape": "counter", "rate_per_hour": 1e9},
    ],
)
def test_a_signal_with_a_non_finite_or_huge_number_is_refused(signal: dict) -> None:
    with pytest.raises(TemplateError) as error:
        TemplateFactory().custom([{**SENSOR, "signal": signal}])
    assert error.value.code is ErrorCode.TPL_INVALID


def test_a_discrete_signal_is_refused_on_a_climate_entity() -> None:
    climate = {"key": "t", "platform": "climate", "name": "T"}
    with pytest.raises(TemplateError) as error:
        TemplateFactory().custom([{**climate, "signal": {"shape": "enum", "values": ["a", "b"]}}])
    assert error.value.code is ErrorCode.TPL_INVALID


async def test_a_bad_user_template_is_skipped_and_the_others_load(
    hass: HomeAssistant, tmp_path: Path, caplog: pytest.LogCaptureFixture
) -> None:
    hass.config.config_dir = str(tmp_path)
    folder = tmp_path / USER_DIR_NAME
    folder.mkdir(parents=True)
    good = "id: mine\nname: Mine\nmodel: M\nentities:\n  - {key: a, platform: sensor, name: A, signal: {shape: sine}}\n"
    (folder / "good.yaml").write_text(good)
    (folder / "broken.yaml").write_text("id: [unclosed")
    (folder / "invalid.yaml").write_text("id: bad\nname: Bad\nentities: nope\n")
    (folder / "large.yaml").write_text(good + "#" * MAX_TEMPLATE_FILE_BYTES)
    (folder / "secret.yaml").write_text("id: s\nname: !secret token\nentities: []\n")
    (folder / "link.yaml").symlink_to(folder / "good.yaml")

    registry = TemplateRegistry(TemplateFactory())
    await registry.async_load(hass)

    assert registry.get("mine").name == "Mine"
    assert {item.id for item in registry.all()} >= BUNDLED
    assert caplog.text.count("TDC-TPL-002 skipped user template") == 5
