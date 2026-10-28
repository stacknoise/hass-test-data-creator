"""Registers the sidebar panel and serves the built panel file (concept 9)."""

from __future__ import annotations

from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import DOMAIN, PANEL_ELEMENT, PANEL_FILE, PANEL_STATIC_URL, PANEL_URL_PATH

FRONTEND_DIR = Path(__file__).parent / "frontend"
STATIC_KEY = f"{DOMAIN}_static_registered"


def _built_at() -> int:
    """Return when the built panel file was last changed, so that a new build is not served from the cache."""
    try:
        return int((FRONTEND_DIR / PANEL_FILE).stat().st_mtime)
    except OSError:
        return 0


async def async_register_panel(hass: HomeAssistant, version: str) -> None:
    """Serve the `frontend` folder (once) and add the admin-only sidebar panel."""
    if not hass.data.get(STATIC_KEY):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(PANEL_STATIC_URL, str(FRONTEND_DIR), cache_headers=False)]
        )
        hass.data[STATIC_KEY] = True
    built = await hass.async_add_executor_job(_built_at)
    await panel_custom.async_register_panel(
        hass,
        webcomponent_name=PANEL_ELEMENT,
        frontend_url_path=PANEL_URL_PATH,
        module_url=f"{PANEL_STATIC_URL}/{PANEL_FILE}?v={version}-{built}",
        sidebar_title="Test data",
        sidebar_icon="mdi:flask-outline",
        require_admin=True,
    )


def async_remove_panel(hass: HomeAssistant) -> None:
    """Remove the sidebar panel."""
    frontend.async_remove_panel(hass, PANEL_URL_PATH)
