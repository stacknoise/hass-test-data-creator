# Testinstanz von Home Assistant (dev/)

Anleitung für alle, die die laufende Home-Assistant-Testinstanz nutzen oder eine eigene Integration darin ausprobieren wollen, auch aus einem anderen Projekt. Sie braucht keinen weiteren Kontext.

## Wo und was

- Rechner: SKYNET-GHOST (Windows 11, Docker Desktop). Läuft Docker nicht (`docker info` schlägt fehl), `C:\Program Files\Docker\Docker\Docker Desktop.exe` starten und warten.
- Ordner: `D:\Projekte\GitHub\Stacknoise\hass-test-data-creator-main`, ein Git-Worktree auf `origin/main` dieses Repos. Compose-Datei: `dev/docker-compose.yml`, Compose-Projektname `dev`.
- Container: `dev-homeassistant-1` und `dev-mosquitto-1`, Restart-Policy `unless-stopped`.
- Home Assistant: Image `ghcr.io/home-assistant/home-assistant:stable`, erreichbar unter `http://localhost:18123` (Host-Port 18123 auf Container-Port 8123).
- MQTT-Broker: `eclipse-mosquitto:2`, Host-Port 11883, im Docker-Netz `mosquitto:1883`. Anonym und ohne Persistenz, nie außerhalb eines Testnetzes freigeben.

## Volumes und Mounts

- `dev/config` wird als `/config` eingebunden (lesen und schreiben). Dort liegt die komplette HA-Instanz mit Onboarding, Benutzern, Config-Einträgen, Datenbank und `.storage`.
- `custom_components/hass_test_data_creator` wird nach `/config/custom_components/hass_test_data_creator` eingebunden (nur lesen).
- `dev/mosquitto.conf` wird als `/mosquitto/config/mosquitto.conf` eingebunden (nur lesen).

## Eine Integration einbinden

1. Den Ordner der Integration nach `/config/custom_components/<domain>` mounten, als zusätzliche Zeile unter `volumes` des Dienstes `homeassistant` in `dev/docker-compose.yml`.
2. Container neu erstellen: `docker compose -f dev/docker-compose.yml up -d --force-recreate`. Die Config bleibt erhalten.
3. In Home Assistant unter Einstellungen → Geräte & Dienste → Integration hinzufügen die Integration einrichten.

## Login

Die `configuration.yaml` aktiviert `trusted_networks` für `172.16.0.0/12` und `192.168.65.0/24` (Anfragen vom Host über das Docker-Netz) und zusätzlich den normalen Passwort-Login. Im Browser auf dem Rechner den Benutzer wählen und „Anmelden“ klicken, ohne Passwort. Rechner im LAN brauchen das Passwort. Passwörter und Tokens gehören nicht in Notizen oder Commits.

## Starten, Aktualisieren, Logs

Alles im Worktree-Ordner ausführen:

```bash
docker compose -f dev/docker-compose.yml up -d
docker compose -f dev/docker-compose.yml restart
docker logs dev-homeassistant-1 --since 5m
```

- Neuer Code: `git fetch origin main`, `git checkout --detach origin/main`, dann `restart`. Das Panel danach im Browser mit Strg+F5 neu laden.
- Prüfen: `http://localhost:18123/manifest.json` liefert HTTP 200, im Log nach `Traceback` und `ERROR` suchen. Die Browser-Meldung zur doppelten Registrierung von `tdc-dialog` kommt von bereits offenen Tabs und verschwindet nach Strg+F5.

## Regeln

- `dev/config` nie ersetzen, verschieben, löschen, neu anlegen oder darüber kopieren. Beim Kopieren in einen vorhandenen Ordner entsteht `config/config` und die Instanz startet leer. Updates betreffen nur Code und Container.
- Im Haupt-Checkout `hass-test-data-creator` kein `git pull`, dort stehen Branches anderer Arbeiten. Den Container nur aus dem Worktree `hass-test-data-creator-main` steuern.
- Vor riskanten Änderungen am HA-Speicher die betroffene Datei in `.storage` kopieren.
- Auf dem Rechner prüft eine Berechtigungsprüfung jede Aktion. Öffentlich wirksame Schritte wie das Pushen von Git-Tags oder Häkchen wie „Das ist eine Testumgebung“ wurden bisher blockiert. In dem Fall nicht umgehen, sondern den Besitzer fragen.
