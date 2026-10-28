"""The replay files in the config folder, read once and handed to the signals."""

from __future__ import annotations

from pathlib import Path

from homeassistant.core import HomeAssistant

from ..core.errors import ErrorCode, SignalError
from .parser import Rows, Table, build_table, parse_rows

FOLDER = ("hass_test_data_creator", "csv")
SUFFIX = ".csv"
MAX_FILE_BYTES = 5_000_000


def _read_folder(folder: Path) -> dict[str, Rows | str]:
    """Read every replay file of `folder`; a file that cannot be used maps to its reason."""
    found: dict[str, Rows | str] = {}
    if not folder.is_dir():
        return found
    for path in sorted(folder.glob(f"*{SUFFIX}")):
        try:
            if path.stat().st_size > MAX_FILE_BYTES:
                found[path.name] = "file too large"
            else:
                found[path.name] = parse_rows(path.read_text(encoding="utf-8-sig"), path.name)
        except SignalError as error:
            found[path.name] = (error.translation_placeholders or {}).get("reason", "invalid")
        except OSError, UnicodeDecodeError:
            found[path.name] = "file cannot be read"
    return found


class CsvLibrary:
    """Holds the parsed replay files; call `async_refresh` to read the folder again."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Keep the instance; the folder is `<config>/hass_test_data_creator/csv`."""
        self._hass = hass
        self._files: dict[str, Rows | str] = {}

    async def async_refresh(self) -> None:
        """Read the folder again, off the event loop."""
        folder = Path(self._hass.config.path(*FOLDER))
        self._files = await self._hass.async_add_executor_job(_read_folder, folder)

    def names(self) -> list[str]:
        """Return the names of the files that can be used."""
        return [name for name, rows in self._files.items() if not isinstance(rows, str)]

    def table(self, file: str, step_s: float) -> tuple[Table, float]:
        """Return the table and the loop length of `file`, or raise TDC-SIG-004 or TDC-SIG-005."""
        rows = self._files.get(file)
        if rows is None:
            raise SignalError(ErrorCode.SIG_CSV_NOT_FOUND, file=file)
        if isinstance(rows, str):
            raise SignalError(ErrorCode.SIG_CSV_INVALID, file=file, reason=rows)
        return build_table(rows, step_s)
