# Submitting to the HACS default repositories

The integration is installable today as a custom repository. This page is the checklist for getting it into the default list of HACS (`hacs/default`), and the text of the pull request. The rules are at <https://www.hacs.xyz/docs/publish/include/>.

## Requirements and where this repository stands

| Requirement | Status |
| --- | --- |
| Public on GitHub, not archived, not a fork | yes |
| Description, issues enabled, topics (`hacs`, `hacs-integration`, `home-assistant`) | yes, see the repository settings |
| Licence that GitHub identifies and the OSI approves | Apache-2.0 (`LICENSE`) |
| `hacs.json` with at least `name` | yes (`name`, `homeassistant`, `render_readme`) |
| One integration in `custom_components/hass_test_data_creator/` | yes |
| `manifest.json` with `domain`, `documentation`, `issue_tracker`, `codeowners`, `name`, `version` | yes |
| Brand directory with at least `icon.png` | `custom_components/hass_test_data_creator/brand/` (`icon.png`, `icon@2x.png`) |
| No domain conflict with Home Assistant core | `hass_test_data_creator` |
| HACS action without `ignore` | `.github/workflows/validate.yml`, `category: integration`, no `ignore` key |
| hassfest action | same workflow |
| A full GitHub release, created after the actions passed | `release.yml` creates it from the tag `vX.Y.Z`; the version in `manifest.json` must equal the tag |
| Images in the README render in HACS | absolute `raw.githubusercontent.com` links, see the README |

Before the pull request:

1. Release the version to submit (`vX.Y.Z`, see `docs/development.md`, section "Releases") and wait until the workflow `Release` has created the GitHub release.
2. Check that `Validate` is green on `main` for the commit of the release (HACS validation and hassfest).
3. Open the pull request from a **personal** account of the owner or a major contributor, not from an organisation account.

## The change in `hacs/default`

Fork `hacs/default`, branch from `master` and add one line to the file `integration`, in alphabetical order (not at the end):

```text
stacknoise/hass-test-data-creator
```

The lint checks require valid, sorted JSON.

## Text of the pull request

Fill the template of the pull request completely; an incomplete template closes the request. All boxes are ticked, and the links are:

```text
Link to current release: https://github.com/stacknoise/hass-test-data-creator/releases/tag/vX.Y.Z
Link to successful HACS action (without the `ignore` key): <URL of the job "HACS validation" of the Validate run on main>
Link to successful hassfest action (if integration): <URL of the job "hassfest" of the same run>
```

Find the URLs with `gh run list --branch main --workflow Validate` and `gh run view <id> --json jobs`.

## After submitting

- Never ask for a review and never comment on the request: that is against the HACS rules and closes it. The review can take months.
- If the HACS team drafts the request, fix what they name and set it to ready again.
- A release of a new version needs nothing from HACS; users get it through the normal update.
