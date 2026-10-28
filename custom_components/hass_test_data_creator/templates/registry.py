"""Loads the bundled and the user's template files (concept 4.2)."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.util.yaml import load_yaml_dict

from ..const import DOMAIN
from ..core.errors import ErrorCode, TemplateError
from .factory import Template, TemplateFactory

BUNDLED_DIR = Path(__file__).parent / "bundled"
USER_DIR_NAME = f"{DOMAIN}/templates"


def _read_files(directory: Path) -> list[tuple[str, dict[str, Any]]]:
    """Return (file name, content) of every YAML file in `directory`; runs in the executor."""
    if not directory.is_dir():
        return []
    return [(path.name, load_yaml_dict(str(path))) for path in sorted(directory.glob("*.yaml"))]


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
            files = await hass.async_add_executor_job(_read_files, directory)
            for name, content in files:
                try:
                    template = self._factory.template(content, bundled=bundled)
                except TemplateError as err:
                    raise TemplateError(ErrorCode.TPL_INVALID, file=name) from err
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
