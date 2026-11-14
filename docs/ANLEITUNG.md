# Eigene App auf die HUAWEI WATCH GT 6 bringen (mit Gadgetbridge)

Diese Anleitung bringt **Iris Slots** (`slots/`) auf deine Uhr. Der Weg ist für jede eigene App
derselbe, später auch für die Iris-App (`watch/`).

> **Was belegt ist, was nicht.** Die Schritte 1–7 folgen den Anleitungen von Leuten, die genau das
> mit einer **GT 3 SE** geschafft haben (Projekt HuaSideload, Quellen unten). Mit einer **GT 6** und
> der Installation über **Gadgetbridge** hat es nach allem, was ich gefunden habe, noch niemand
> öffentlich bestätigt. Stellen, die ich nicht prüfen konnte, sind mit ⚠️ markiert.

## Worum es geht

Die Uhr installiert eine App nur, wenn sie **mit einem Debug-Profil von Huawei signiert** ist, in
dem die **Geräte-ID (UDID) genau deiner Uhr** steht. Das prüft die Uhr selbst. Root auf dem Handy
oder der Uhr hilft dagegen nicht. Das Profil bekommst du kostenlos mit einem Huawei-Entwicklerkonto.
Die App bleibt privat: Debug-Apps werden nirgends veröffentlicht und laufen nur auf deiner Uhr.

```
Huawei-Entwicklerkonto ─▶ Zertifikat + Uhr (UDID) + Profil in AppGallery Connect
                                     │
Quellcode (slots/) ─▶ bauen ─▶ signieren ─▶ Slots.bin ─▶ Gadgetbridge ─▶ Uhr
```

## Bevor du anfängst

- **Zeit:** etwa ein bis zwei Stunden beim ersten Mal, danach Minuten pro Update.
- **Kosten:** keine.
- **Du brauchst:** einen Computer (Windows, macOS oder Linux), dein Handy mit Gadgetbridge, die Uhr.
- ⚠️ **HarmonyOS 6.1:** Gadgetbridge meldet, dass ab HarmonyOS 6.1 keine **Zifferblätter** mehr
  installiert werden können (Gadgetbridge-Issue #6199). Die GT 6 hat 6.1 bekommen. Ob auch **Apps**
  betroffen sind, steht dort nicht. Schau in den Einstellungen der Uhr nach deiner Version
  (Einstellungen › Über).
- ⚠️ **Ablauf:** Laut einem Gadgetbridge-Kommentar gelten Debug-Zertifikate drei Monate. Danach
  neues Zertifikat und Profil erstellen und die App neu signieren.

## 1. Huawei-Entwicklerkonto anlegen

1. Öffne **developer.huawei.com/consumer/en** (die internationale Seite, nicht die chinesische).
2. Melde dich mit deiner HUAWEI ID an (die, die du für Gadgetbridge angelegt hast, geht) und wähle
   **Individual developer** (Einzelperson).
3. Wenn die Seite eine Identitätsprüfung verlangt, führe sie durch.
   ⚠️ Welche Nachweise Huawei für Konten aus Deutschland heute verlangt, konnte ich nicht prüfen.

## 2. Werkzeuge installieren

| Werkzeug | Version | Wofür |
|---|---|---|
| DevEco Studio | 3.1 | bringt das SDK mit |
| OpenHarmony SDK | **API 9**, Teile `js` und `toolchains` | Compiler und Signier-Werkzeug |
| Node.js | **16** (neuere gehen nicht) | Compiler der Uhr-Apps |
| Java | 11 oder neuer | Packen und Signieren |
| Python | 3 | Prüf-Skript |

1. DevEco Studio 3.1 installieren (Huaweis Download-Archiv für ältere Versionen).
2. In DevEco Studio: **Settings › SDK › OpenHarmony**, **API 9** auswählen, Häkchen bei **js** und
   **toolchains**, installieren. Merke dir den SDK-Ordner, unten heißt er `$SDK`
   (auf dem Mac standardmäßig `~/Library/Huawei/Sdk/openharmony/9`).
3. Node 16 (zum Beispiel mit `nvm install 16`), Java 17 und Python 3 installieren.

## 3. Schlüssel und Zertifikatsantrag erzeugen

In einem Arbeitsordner, zum Beispiel `signing/` (**nie ins Repo einchecken**):

```bash
java -jar $SDK/toolchains/lib/hap-sign-tool.jar generate-keypair \
  -keyAlias mykey -keyAlg ECC -keySize NIST-P-256 \
  -keystoreFile mykey.p12 -keyPwd DEINPASSWORT -keystorePwd DEINPASSWORT
```

```bash
java -jar $SDK/toolchains/lib/hap-sign-tool.jar generate-csr \
  -keyAlias mykey -keyPwd DEINPASSWORT -keystoreFile mykey.p12 -keystorePwd DEINPASSWORT \
  -subject "C=DE,O=Dein Name,OU=Dein Name,CN=mykey" -signAlg SHA256withECDSA -outFile mykey.csr
```

Ergebnis: `mykey.p12` (dein privater Schlüssel) und `mykey.csr` (der Antrag für Huawei).

## 4. Die UDID deiner Uhr herausfinden

Das ist der schwierigste Schritt mit Gadgetbridge. Die Uhr schickt ihre UDID beim Koppeln mit
(Feld `0x05` der Sicherheitsaushandlung), aber **Gadgetbridge wertet dieses Feld nicht aus und zeigt
es nirgends an** (geprüft im Gadgetbridge-Quelltext, `DeviceConfig.SecurityNegotiation`).

Möglichkeiten:

- **A) Gadgetbridge-Fork, der die UDID anzeigt** (empfohlen). Eine kleine Änderung: Feld `0x05`
  lesen und in den Geräteinformationen zeigen. Sag Bescheid, dann baue ich ihn.
- **B) HuaSideload auf einem iPhone:** zeigt nach dem Koppeln unter Status › **Show identity** die
  UDID und kopiert sie mit **Copy UDID**. Achtung: Ein anderes Handy koppeln kann die Gadgetbridge-
  Kopplung lösen.
- ⚠️ **C) Gadgetbridge-Debug-Log:** Ob die rohen Pakete dort mit der UDID landen, habe ich nicht geprüft.

## 5. AppGallery Connect einrichten

In **AppGallery Connect** (developer.huawei.com, oben rechts **Console**):

1. **Certificates, App ID and Profiles › Certificates › New**
   - Typ **Debug**, `mykey.csr` hochladen, das Zertifikat herunterladen und als
     `signing/mykey-debug.cer` speichern.
2. **Devices › Add**
   - Typ **Sports watch** (die GT-Uhren sind „Lite Wearables"), UDID aus Schritt 4 einfügen.
3. **My projects › Projekt anlegen › Add app**
   - **HarmonyOS app**, Gerät **Sports watch**, Paketname **`dev.madebycli.slots`**.
   - **Keine** Fähigkeiten und **keine** Berechtigungen auswählen.
4. **Profiles › Add**
   - App wählen, Typ **Debug**, dein Zertifikat, deine Uhr. Das Profil herunterladen und als
     `signing/dev.madebycli.slots.p7b` speichern.

Für jede weitere App (zum Beispiel später die Iris-App `dev.madebycli.irisclock`) nur die Schritte 3
und 4 wiederholen. Schlüssel, Zertifikat und Uhr bleiben gleich.

## 6. Bauen und signieren

Die Uhr-Apps werden zu einer **`.bin`-Datei** gebaut: Compiler (ace-loader) › Ressourcen (restool) ›
Umwandlung in `.bin` (haptobin_tool) › Signatur (hap-sign-tool, `sign-app -inForm bin`).

- **Weg 1 (belegt, für die GT 3 SE):** das Bau-Skript von HuaSideload, `tools/build-watch-app.sh`.
  Repo `hinzwifi/huawei-watch-sideload-ios` klonen, `signing/signing.env.example` nach
  `signing/signing.env` kopieren und dort deine Dateien aus Schritt 3 und 5 eintragen. Den Ordner
  `slots/` als `watch-apps/slots` hineinlegen und bauen:
  ```bash
  tools/build-watch-app.sh watch-apps/slots
  ```
  Ergebnis: `WatchApps/Iris Slots.bin` (der Name kommt aus `resources/base/element/string.json`).
  ⚠️ Das Skript ist für macOS geschrieben. Unter Linux oder Windows musst du die Pfade zum SDK
  anpassen.
- ⚠️ **Weg 2 (nicht geprüft):** in DevEco Studio 3.1 ein neues Projekt für **Lite Wearable** (JS)
  anlegen, die Ordner `entry/src/main/js` und `entry/src/main/resources` aus `slots/` hineinkopieren,
  unter **File › Project Structure › Signing Configs** deine Dateien eintragen und bauen.

**Vor dem Installieren prüfen:**

```bash
python3 tools/check-watch-bin.py "WatchApps/Iris Slots.bin"
```

Meldet das Skript „WILL NOT INSTALL", steht der Grund dabei.

## 7. Mit Gadgetbridge installieren

1. Die `.bin` aufs Handy kopieren.
2. In Gadgetbridge auf der Karte deiner Uhr die **drei Punkte** oben rechts › **File Installer**
   (Dateiinstallation) und die Datei wählen. Oder im Dateimanager die `.bin` mit **Öffnen mit ›
   Gadgetbridge (FW/App Installer)** öffnen.
3. **Installieren** tippen und warten, bis die Uhr fertig meldet.
4. Auf der Uhr in der App-Liste **Iris Slots** öffnen.

⚠️ Gadgetbridge nennt die App-Installation für Huawei „Basic support … limited functionality, not
supported by all devices". Ob die GT 6 dazugehört, steht nicht dort.

## Wenn etwas nicht klappt

| Was passiert | Ursache | Lösung |
|---|---|---|
| Installation bricht mit **103** ab | kleines Icon fehlt | `resources/base/media/icon_small.png` (41×41), ist in `slots/` vorhanden |
| Installation bricht mit **103** ab | UDID nicht im Profil, falscher Paketname oder falsches Zertifikat | Schritte 4 und 5 prüfen, `check-watch-bin.py` laufen lassen |
| Installation bricht mit **103** ab | Versionsnummer nicht höher als die installierte | in `config.json` `version.code` erhöhen |
| Schwarzer Bildschirm beim Start | `import … from '@system.wearengine'` | `requireModule('@system.wearengine')` in try/catch (betrifft nur die Iris-App) |
| App friert beim Start ein | Verbindung zum Handy schon auf der ersten Seite | erst eine Startseite zeigen, dann mit `router.replace` weiter (betrifft nur die Iris-App) |
| Zertifikat abgelaufen | Debug-Zertifikate gelten etwa drei Monate | neues Zertifikat und Profil in Schritt 5, neu bauen |
| ⚠️ Krone dreht die Walzen nicht | das Ereignis `onrotation` geht auf der GT 6 vielleicht nicht | stattdessen nach unten wischen oder DREHEN tippen |

## Updates

Bei jeder neuen Version `version.code` in `slots/entry/src/main/config.json` um eins erhöhen, neu
bauen und über Gadgetbridge installieren. Der App-Name darf höchstens 30 Zeichen lang sein.

## Quellen

- HuaSideload (Signieren, Bauen, Fehler): <https://github.com/hinzwifi/huawei-watch-sideload-ios>
- VoiceGPT für Huawei-Uhren (gleicher Weg): <https://github.com/eymnyld/VoiceGPTforHuaweiWatch>
- Gadgetbridge, Huawei/Honor: <https://gadgetbridge.org/basics/topics/huawei-honor/>
- Gadgetbridge, App-Installation für Huawei: <https://codeberg.org/Freeyourgadget/Gadgetbridge/issues/4175>
- Gadgetbridge, Zifferblätter ab HarmonyOS 6.1: Issue #6199
- Gadgetbridge, Zertifikate und Wear Engine: <https://codeberg.org/Freeyourgadget/Gadgetbridge/issues/5552>
