"""Loads the bundled and the user's template files (concept 4.2)."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.util.yaml import load_yaml_dict
import yaml

from ..audit.factory import AuditEntryFactory
from ..audit.log import AuditLog
from ..const import CUSTOM_TEMPLATE_ID, DOMAIN, MAX_TEMPLATE_FILE_BYTES, MAX_USER_TEMPLATES
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

    The files are read with `yaml.safe_load`, so `!secret` and `!include` are not understood.
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
            content = yaml.safe_load(path.read_text(encoding="utf-8"))
        except OSError, UnicodeDecodeError, yaml.YAMLError:
            content = None
        if isinstance(content, dict):
            files.append((path.name, content))
        else:
            _LOGGER.warning("%s skipped user template %s: not readable", _CODE, path.name)
    return files


def _write_file(path: Path, content: dict[str, Any]) -> None:
    """Write `content` as YAML to `path` in one step, so that a crash leaves no half file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(".yaml.tmp")
    temporary.write_text(yaml.safe_dump(content, sort_keys=False, allow_unicode=True), "utf-8")
    temporary.replace(path)


def _remove_file(path: Path) -> None:
    """Delete the file at `path`; a file that is already gone is fine."""
    path.unlink(missing_ok=True)


class TemplateRegistry:
    """Holds all templates by id and saves and deletes the user's own ones."""

    def __init__(
        self, factory: TemplateFactory, audit: AuditLog, audit_factory: AuditEntryFactory
    ) -> None:
        """Create an empty registry that builds templates with `factory`."""
        self._factory = factory
        self._audit = audit
        self._audit_factory = audit_factory
        self._templates: dict[str, Template] = {}
        self._bundled_ids: set[str] = set()

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
                if bundled:
                    self._bundled_ids.add(template.id)

    def get(self, template_id: str) -> Template:
        """Return the template with `template_id` or raise TPL_NOT_FOUND."""
        template = self._templates.get(template_id)
        if template is None:
            raise TemplateError(ErrorCode.TPL_NOT_FOUND)
        return template

    def bundled_ids(self) -> frozenset[str]:
        """Return the ids of the built-in templates."""
        return frozenset(self._bundled_ids)

    def all(self) -> list[Template]:
        """Return all templates sorted by name."""
        return sorted(self._templates.values(), key=lambda item: item.name)

    def _user_file(self, hass: HomeAssistant, template_id: str) -> Path:
        """Return the path of the file of the own template `template_id`."""
        return Path(hass.config.path(USER_DIR_NAME)) / f"{template_id}.yaml"

    def check_changeable(self, template_id: str) -> None:
        """Raise TPL_BUNDLED if `template_id` is a built-in template or the custom device."""
        if template_id in self._bundled_ids or template_id == CUSTOM_TEMPLATE_ID:
            raise TemplateError(ErrorCode.TPL_BUNDLED)

    async def async_save(self, hass: HomeAssistant, data: dict[str, Any]) -> Template:
        """Validate `data`, write it as an own template (new or replaced) and return it."""
        template = self._factory.template(data, bundled=False)
        self.check_changeable(template.id)
        if template.id not in self._templates and self._user_count() >= MAX_USER_TEMPLATES:
            raise TemplateError(ErrorCode.TPL_LIMIT)
        path = self._user_file(hass, template.id)
        try:
            await hass.async_add_executor_job(_write_file, path, template.to_file())
        except OSError as err:
            raise TemplateError(ErrorCode.TPL_WRITE) from err
        self._templates[template.id] = template
        self._audit.record(self._audit_factory.template_saved(template.id, len(template.entities)))
        return template

    async def async_delete(self, hass: HomeAssistant, template_id: str) -> None:
        """Delete the own template `template_id` and its file."""
        self.check_changeable(template_id)
        self.get(template_id)
        try:
            await hass.async_add_executor_job(_remove_file, self._user_file(hass, template_id))
        except OSError as err:
            raise TemplateError(ErrorCode.TPL_WRITE) from err
        del self._templates[template_id]
        self._audit.record(self._audit_factory.template_deleted(template_id))

    def _user_count(self) -> int:
        """Return how many own templates there are."""
        return sum(1 for item in self._templates.values() if item.id not in self._bundled_ids)
