"""Loads the bundled and the user's template files (concept 4.2)."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.util.yaml import load_yaml_dict

from ..const import DOMAIN, MAX_TEMPLATE_FILE_BYTES, MAX_USER_TEMPLATES
from ..core.errors import ErrorCode, TemplateError
from .factory import Template, TemplateFactory

BUNDLED_DIR = Path(__file__).parent / "bundled"
USER_DIR_NAME = f"{DOMAIN}/templates"
_LOGGER = logging.getLogger(__name__)
_CODE = ErrorCode.TPL_INVALID.value


def _read_files(directory: Path) -> list[tuple[str, dict[str, Any]]]:
    """Return (file name, content) of every YAML file in `directory`; runs in the executor."""
    if not directory.is_dir():
        return []
    return [(path.name, load_yaml_dict(str(path))) for path in sorted(directory.glob("*.yaml"))]


def _read_user_files(directory: Path) -> list[tuple[str, dict[str, Any]]]:
    """Return the usable user files; a link, a large or an unreadable file is skipped and logged.

    Runs in the executor. At most `MAX_USER_TEMPLATES` files are read.
    """
    if not directory.is_dir():
        return []
    files = []
    for path in sorted(directory.glob("*.yaml"))[:MAX_USER_TEMPLATES]:
        if path.is_symlink() or path.stat().st_size > MAX_TEMPLATE_FILE_BYTES:
            _LOGGER.warning("%s skipped user template %s: link or too large", _CODE, path.name)
            continue
        try:
            files.append((path.name, load_yaml_dict(str(path))))
        except HomeAssistantError:
            _LOGGER.warning("%s skipped user template %s: not readable", _CODE, path.name)
    return files


class TemplateRegistry:
    """Holds all templates by id."""

    def __init__(self, factory: TemplateFactory) -> None:
        """Create an empty registry that builds templates with `factory`."""
        self._factory = factory
        self._templates: dict[str, Template] = {}

    async def async_load(self, hass: HomeAssistant) -> None:
        """Load the bundled templates and then the user's; a user template can replace one."""
        user_dir = Path(hass.config.path(USER_DIR_NAME))
        for directory, bundled in ((BUNDLED_DIR, True), (user_dir, False)):
            reader = _read_files if bundled else _read_user_files
            files = await hass.async_add_executor_job(reader, directory)
            for name, content in files:
                try:
                    template = self._factory.template(content, bundled=bundled)
                except TemplateError as err:
                    if bundled:
                        raise TemplateError(ErrorCode.TPL_INVALID, file=name) from err
                    _LOGGER.warning("%s skipped user template %s: invalid", _CODE, name)
                    continue
                self._templates[template.id] = template

    def get(self, template_id: str) -> Template:
        """Return the template with `template_id` or raise TPL_NOT_FOUND."""
        template = self._templates.get(template_id)
        if template is None:
            raise TemplateError(ErrorCode.TPL_NOT_FOUND)
        return template

    def all(self) -> list[Template]:
        """Return all templates sorted by name."""
        return sorted(self._templates.values(), key=lambda item: item.name)
