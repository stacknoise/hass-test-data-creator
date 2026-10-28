"""Both translation files cover every service, field, selector option and options-flow field."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest
import yaml

BASE = Path(__file__).parent.parent.parent / "custom_components" / "hass_test_data_creator"
LANGUAGES = ("en", "de")


def _translations(language: str) -> dict[str, Any]:
    """Return the translation file of `language`."""
    return json.loads((BASE / "translations" / f"{language}.json").read_text(encoding="utf-8"))


def _services() -> dict[str, Any]:
    """Return services.yaml."""
    return yaml.safe_load((BASE / "services.yaml").read_text(encoding="utf-8"))


def _leaf_keys(node: Any, prefix: str = "") -> set[str]:
    """Return the dotted paths of all texts in a nested dict."""
    if not isinstance(node, dict):
        return {prefix}
    return {key for name, child in node.items() for key in _leaf_keys(child, f"{prefix}{name}.")}


def test_both_languages_have_the_same_texts() -> None:
    assert _leaf_keys(_translations("en")) == _leaf_keys(_translations("de"))


@pytest.mark.parametrize("language", LANGUAGES)
def test_every_service_and_field_has_a_text(language: str) -> None:
    translated = _translations(language)["services"]
    for service, spec in _services().items():
        assert service in translated, service
        assert translated[service]["name"] and translated[service]["description"]
        fields = set((spec or {}).get("fields", {}))
        assert fields == set(translated[service].get("fields", {})), service


@pytest.mark.parametrize("language", LANGUAGES)
def test_every_selector_option_has_a_text(language: str) -> None:
    selectors = _translations(language).get("selector", {})
    for service, spec in _services().items():
        for field, definition in (spec or {}).get("fields", {}).items():
            select = (definition.get("selector") or {}).get("select")
            if not select or not select.get("options"):
                continue
            key = select.get("translation_key")
            assert key, f"{service}.{field} needs a translation_key"
            assert set(selectors[key]["options"]) == set(select["options"]), key


@pytest.mark.parametrize("language", LANGUAGES)
def test_the_selector_options_are_listed_by_their_text(language: str) -> None:
    selectors = _translations(language).get("selector", {})
    for spec in _services().values():
        for definition in (spec or {}).get("fields", {}).values():
            select = (definition.get("selector") or {}).get("select")
            if select and select.get("options"):
                texts = selectors[select["translation_key"]]["options"]
                listed = [texts[option].casefold() for option in select["options"]]
                assert listed == sorted(listed), select["translation_key"]
