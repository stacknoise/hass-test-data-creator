"""Error codes and exception classes of the integration (concept 13.3)."""

from __future__ import annotations

from enum import StrEnum

from homeassistant.exceptions import HomeAssistantError

from ..const import DOMAIN


class ErrorCode(StrEnum):
    """Every error code of the integration, format TDC-<AREA>-<NNN>; never reuse or renumber."""

    CFG_NOT_TEST_ENV = "TDC-CFG-001"
    """The confirmation that this is a test environment was not given."""

    CFG_NOT_LOADED = "TDC-CFG-002"
    """A command arrived while the integration is not loaded."""

    TPL_NOT_FOUND = "TDC-TPL-001"
    """The requested template does not exist."""

    TPL_INVALID = "TDC-TPL-002"
    """A template file or a custom entity definition does not match the schema."""

    TPL_UNKNOWN_SHAPE = "TDC-TPL-003"
    """A template or custom entity names a signal shape that does not exist."""

    GEN_LIMIT = "TDC-GEN-001"
    """A creation job would exceed MAX_DEVICES."""

    GEN_BATCH = "TDC-GEN-002"
    """A creation job asks for more than MAX_BATCH devices."""

    GEN_NAME_PATTERN = "TDC-GEN-003"
    """The name pattern uses a placeholder that does not exist."""

    GEN_ENTITY_LIMIT = "TDC-GEN-004"
    """A device would have more than MAX_ENTITIES_PER_DEVICE entities."""

    GEN_TICK_SLOW = "TDC-GEN-005"
    """One tick took longer than half of the tick interval."""

    SIG_UNKNOWN_SHAPE = "TDC-SIG-001"
    """The signal shape is not registered in the SignalFactory."""

    SIG_INVALID_RANGE = "TDC-SIG-002"
    """The minimum of a signal is greater than its maximum."""

    SCH_UNKNOWN_ACTION = "TDC-SCH-001"
    """The platform of the entity does not support the requested action."""

    SCH_TARGET_NOT_FOUND = "TDC-SCH-002"
    """The device or entity of an action does not exist or is not loaded."""

    SCH_INVALID_TRIGGER = "TDC-SCH-003"
    """The trigger of a schedule does not match the schema of its type."""

    SCH_NOT_FOUND = "TDC-SCH-004"
    """The schedule does not exist."""

    OUT_UNSUPPORTED = "TDC-OUT-001"
    """The requested output is not available in this version."""

    REM_FAILED = "TDC-REM-001"
    """A step of a removal failed; the removal can be run again."""

    WS_INVALID_REQUEST = "TDC-WS-001"
    """The request does not match the schema of the command."""

    INT_UNEXPECTED = "TDC-INT-001"
    """An unexpected error; the details are in the Home Assistant log."""


class TdcError(HomeAssistantError):
    """Base of every error of the integration; carries an ErrorCode."""

    default_code: ErrorCode = ErrorCode.INT_UNEXPECTED

    def __init__(self, code: ErrorCode | None = None, **placeholders: str) -> None:
        """Create the error; `placeholders` fill the `{name}` fields of the translated text."""
        self.code = code or self.default_code
        super().__init__(
            translation_domain=DOMAIN,
            translation_key=self.code.name.lower(),
            translation_placeholders=placeholders or None,
        )


class ConfigError(TdcError):
    """Error in the configuration or the setup of the integration."""

    default_code = ErrorCode.CFG_NOT_LOADED


class TemplateError(TdcError):
    """Error in a template or a custom entity definition."""

    default_code = ErrorCode.TPL_INVALID


class GenerationError(TdcError):
    """Error while creating devices."""

    default_code = ErrorCode.GEN_LIMIT


class SignalError(TdcError):
    """Error in a signal definition."""

    default_code = ErrorCode.SIG_UNKNOWN_SHAPE


class ScheduleError(TdcError):
    """Error in an action, a schedule or a fault."""

    default_code = ErrorCode.SCH_UNKNOWN_ACTION


class OutputError(TdcError):
    """Error in an output adapter."""

    default_code = ErrorCode.OUT_UNSUPPORTED


class RemovalError(TdcError):
    """Error while removing generated data."""

    default_code = ErrorCode.REM_FAILED


class RequestError(TdcError):
    """Error in the format of a WebSocket request."""

    default_code = ErrorCode.WS_INVALID_REQUEST


class InternalError(TdcError):
    """Unexpected error that is not caused by the user."""

    default_code = ErrorCode.INT_UNEXPECTED
