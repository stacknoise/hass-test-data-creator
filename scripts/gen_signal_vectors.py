"""Generate tests/vectors/signals.json: expected signal values shared by pytest and Vitest.

Usage:
    python scripts/gen_signal_vectors.py

Loads engine/signals.py by path, so it runs without Home Assistant. The file is committed; the
tests of both languages compare against it (concept 9).
"""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
SIGNALS = ROOT / "custom_components" / "hass_test_data_creator" / "engine" / "signals.py"
OUTPUT = ROOT / "tests" / "vectors" / "signals.json"

TIMES = (0.0, 1.0, 59.0, 3600.0, 12345.678, 86399.0, 1_700_000_000.25)
BASE = {"min": 0, "max": 100, "period_s": 3600, "interval_s": 10, "decimals": 3}
CASES = (
    {"shape": "constant"},
    {"shape": "sine", "seed": 7},
    {"shape": "sine", "seed": 7, "phase": 0.25, "noise": 0.05},
    {"shape": "saw", "period_s": 600},
    {"shape": "square", "period_s": 100},
    {"shape": "triangle", "period_s": 900, "min": -20, "max": 40},
    {"shape": "noise", "seed": 123456789, "interval_s": 5},
    {"shape": "random_walk", "seed": 42, "period_s": 600},
    {"shape": "random_walk", "seed": 4_000_000_000, "period_s": 60, "noise": 0.1},
    {"shape": "counter", "min": 10, "rate_per_hour": 0.35, "origin": 100.0},
)


def load_signals():
    """Return the signals module loaded straight from its file."""
    spec = importlib.util.spec_from_file_location("tdc_signals", SIGNALS)
    module = importlib.util.module_from_spec(spec)
    sys.modules["tdc_signals"] = module
    spec.loader.exec_module(module)
    return module


def main() -> None:
    """Write the vector file."""
    signals = load_signals()
    hashes = [
        {"seed": seed, "n": n, "value": signals.hash01(seed, n)}
        for seed in (0, 1, 7, 4_000_000_000)
        for n in (-3, 0, 1, 2, 1_000_003)
    ]
    values = []
    for case in CASES:
        params = {**BASE, **case}
        spec = signals.SignalSpec(**params)
        for t in TIMES:
            values.append({"spec": params, "t": t, "value": signals.value_at(spec, t)})
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps({"hashes": hashes, "values": values}, indent=1) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    print(
        f"wrote {OUTPUT.relative_to(ROOT).as_posix()} ({len(hashes)} hashes, {len(values)} values)"
    )


if __name__ == "__main__":
    main()
