"""The config flow asks for the test environment confirmation (concept 10.4)."""

from __future__ import annotations

from homeassistant.config_entries import SOURCE_USER
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
import pytest

from custom_components.hass_test_data_creator.const import (
    CONF_IS_TEST_ENVIRONMENT,
    CONF_SEED,
    CONF_TICK_SECONDS,
    DOMAIN,
)


async def test_flow_requires_the_confirmation(
    hass: HomeAssistant, mock_panel: None, caplog: pytest.LogCaptureFixture
) -> None:
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    assert result["type"] is FlowResultType.FORM

    refused = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {CONF_IS_TEST_ENVIRONMENT: False, CONF_SEED: "s", CONF_TICK_SECONDS: 5},
    )
    assert refused["type"] is FlowResultType.FORM
    assert refused["errors"] == {"base": "not_test_environment"}
    assert "TDC-CFG-001" in caplog.text

    created = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {CONF_IS_TEST_ENVIRONMENT: True, CONF_SEED: "s", CONF_TICK_SECONDS: 5},
    )
    assert created["type"] is FlowResultType.CREATE_ENTRY
    assert created["data"] == {CONF_SEED: "s", CONF_TICK_SECONDS: 5}


async def test_only_one_instance(hass: HomeAssistant, entry: object) -> None:
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "single_instance_allowed"
