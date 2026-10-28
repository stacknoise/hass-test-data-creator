"""Pure parsing of replay files: text to rows, rows to the table of a signal."""

from __future__ import annotations

import csv
from itertools import pairwise
import math

from ..core.errors import ErrorCode, SignalError

MAX_ROWS = 100_000
MIN_ROWS = 2

Table = tuple[tuple[float, float], ...]
Rows = tuple[tuple[float | None, float], ...]


def _invalid(file: str, reason: str) -> SignalError:
    """Return TDC-SIG-005 for `file` with the reason."""
    return SignalError(ErrorCode.SIG_CSV_INVALID, file=file, reason=reason)


def _number(text: str, decimal_comma: bool) -> float:
    """Return `text` as a finite number; a comma is the decimal mark if the delimiter is `;`."""
    value = float((text.strip().replace(",", ".")) if decimal_comma else text.strip())
    if not math.isfinite(value):
        raise ValueError(text)
    return value


def _is_header(cells: list[str], decimal_comma: bool) -> bool:
    """Whether the first row names its columns instead of holding numbers."""
    try:
        [_number(cell, decimal_comma) for cell in cells]
    except ValueError:
        return True
    return False


def parse_rows(text: str, file: str) -> Rows:
    """Return the rows of a replay file: `(None, value)` for one column, `(seconds, value)` for two.

    Blank lines and lines that start with `#` are skipped, a first row of names is skipped, and
    the delimiter is `,` or `;` (then a comma is the decimal mark). Seconds must rise. A file that
    does not fit raises TDC-SIG-005 with the reason.
    """
    lines = [
        line for line in text.splitlines() if line.strip() and not line.lstrip().startswith("#")
    ]
    if not lines:
        raise _invalid(file, "no data")
    decimal_comma = ";" in lines[0]
    cells = list(csv.reader(lines, delimiter=";" if decimal_comma else ","))
    if _is_header(cells[0], decimal_comma):
        cells = cells[1:]
    if not MIN_ROWS <= len(cells) <= MAX_ROWS:
        raise _invalid(file, f"{MIN_ROWS} to {MAX_ROWS} rows needed")
    width = len(cells[0])
    if width not in (1, 2) or any(len(row) != width for row in cells):
        raise _invalid(file, "one or two columns needed")
    try:
        rows: Rows = tuple(
            (None, _number(row[0], decimal_comma))
            if width == 1
            else (_number(row[0], decimal_comma), _number(row[1], decimal_comma))
            for row in cells
        )
    except ValueError as error:
        raise _invalid(file, "a cell is not a number") from error
    times = [time for time, _ in rows if time is not None]
    if any(later <= earlier for earlier, later in pairwise(times)):
        raise _invalid(file, "seconds must rise")
    return rows


def build_table(rows: Rows, step_s: float) -> tuple[Table, float]:
    """Return the table of `(seconds, value)` points from 0 and the loop length in seconds.

    One column is spread over `step_s` seconds per value and joins its last value to the first;
    two columns keep their seconds (shifted to start at 0) and loop after the last one.
    """
    if rows[0][0] is None:
        return tuple((index * step_s, value) for index, (_, value) in enumerate(rows)), len(
            rows
        ) * step_s
    first = rows[0][0] or 0.0
    table = tuple(((time or 0.0) - first, value) for time, value in rows)
    return table, table[-1][0]
