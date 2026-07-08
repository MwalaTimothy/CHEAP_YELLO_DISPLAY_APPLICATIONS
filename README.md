# Cheap Yellow Display — Web Flashing Application

## Overview

The **Cheap Yellow Display (CYD) Web Flashing Application** is a browser-based tool that lets you install, update, and manage firmware on the **ESP32-2432S028R** — a low-cost, all-in-one development board that combines an ESP32 microcontroller with a 2.8-inch 320×240 colour TFT touchscreen, all on a single PCB. Because the board is both capable and inexpensive it has earned the community nickname *Cheap Yellow Display* (CYD).

The flashing application runs entirely inside a modern web browser. There is nothing to download or install: open the page, connect your CYD board over USB, pick the firmware you want, and click **Flash**. Under the hood the tool uses the **Web Serial API** to communicate with the board at up to 921 600 baud, so the entire process takes only a few seconds.

---

## What Is the Cheap Yellow Display?

| Feature | Detail |
|---|---|
| Microcontroller | ESP32-D0WD (dual-core Xtensa LX6, up to 240 MHz) |
| Flash memory | 4 MB |
| RAM | 520 KB SRAM |
| Display | 2.8″ ILI9341 TFT, 320 × 240 px, SPI-connected |
| Touch | XPT2046 resistive touch controller |
| Wireless | Wi-Fi 802.11 b/g/n + Bluetooth 4.2 / BLE |
| USB | Micro-USB, CP2102 USB-to-UART bridge |
| Extras | SD-card slot, two RGB LEDs, LDR (light sensor) |

The board's integrated display and touch panel make it ideal for small dashboards, smart-home controllers, IoT sensors with local UI, and hobby projects that need a screen without the wiring complexity of a separate display module.

---

## Purpose of the Web Flashing Application

Traditional firmware installation requires the Arduino IDE, PlatformIO, or the `esptool.py` command-line utility — all of which demand a local development environment. The CYD Web Flashing Application removes that barrier by providing:

- **Zero-install onboarding** — works in any Chromium-based browser (Chrome, Edge, Brave, Opera) that supports the Web Serial API.
- **Guided firmware selection** — a curated catalogue of pre-built firmware images lets users choose the right build for their use-case (e.g. ESPHome, LVGL demos, home-automation dashboards, games).
- **One-click flashing** — the tool handles erasing, writing, and verifying flash in a single automated sequence.
- **Instant feedback** — a real-time progress bar and log console show every step of the flashing process.
- **Recovery support** — includes an option to wipe the board to factory defaults when a device is stuck in a boot loop.

---

## How It Works

```
Browser  ──(Web Serial API)──►  CP2102 USB-UART  ──►  ESP32 boot-loader
   │                                                         │
   │  1. Enumerate serial ports                              │
   │  2. Assert DTR/RTS to enter boot mode (GPIO0 LOW)       │
   │  3. Handshake with ESP32 ROM boot-loader (115 200 baud) │
   │  4. Negotiate flash speed (up to 921 600 baud)          │
   │  5. Erase target flash regions                          │
   │  6. Write firmware binary in 4 KB blocks                │
   │  7. Verify each block with MD5 checksum                 │
   │  8. Reset board into normal run mode (GPIO0 HIGH + RST) │
   └─────────────────────────────────────────────────────────┘
```

1. **Port detection** — the application lists all available serial ports. The user selects the port that corresponds to the CYD (typically labelled *CP2102 USB to UART Bridge*).
2. **Firmware manifest** — a JSON manifest file describes available firmware images, their version numbers, download URLs, and target flash addresses.
3. **Binary download** — the selected firmware binary is fetched from a CDN or bundled directly in the page.
4. **ESP-IDF stub upload** — a small stub application is uploaded to the ESP32 RAM first. This stub accelerates flash operations compared to the slow ROM boot-loader.
5. **Flash write** — binary data is split into chunks and written sequentially. Each chunk is acknowledged by the device before the next is sent.
6. **Verification** — the tool reads back the MD5 hash of each written region and compares it against the expected value.
7. **Boot** — the board is reset and the new firmware starts running automatically.

---

## System Requirements

### Browser
- Google Chrome 89+, Microsoft Edge 89+, Brave, or Opera (any Chromium 89+ build)
- Firefox and Safari are **not** supported because they do not implement the Web Serial API

### Operating System
- **Windows 10 / 11** — the CP2102 driver is usually installed automatically; if not, download it from Silicon Labs.
- **macOS 10.14+** — CP2102 drivers are built into macOS.
- **Linux** — no additional driver is needed; add your user to the `dialout` group (`sudo usermod -aG dialout $USER`) and log out/in.

### Hardware
- ESP32-2432S028R (CYD) board
- Micro-USB cable that carries data (not charge-only)

---

## Flashing Instructions

1. **Open** the web flashing application in a supported browser.
2. **Connect** the CYD to your computer using a micro-USB cable.
3. **Click "Connect"** — the browser will show a port-picker dialogue. Select the *CP2102* entry and click **Connect**.
4. **Choose firmware** — browse or search the firmware catalogue and select the image you want to install.
5. **Click "Flash"** — the tool will erase the necessary flash sectors, write the firmware, and verify the result. The progress bar updates in real time.
6. **Done** — once flashing completes the board resets automatically and the new firmware starts running.

> **Tip:** If the board is not detected, hold the **BOOT** button (GPIO0) while inserting the USB cable to force the ESP32 into download mode manually.

---

## Available Firmware Images

The firmware catalogue hosted by this application includes (but is not limited to):

| Firmware | Description |
|---|---|
| **ESPHome** | Integrate the CYD into Home Assistant with full YAML configuration |
| **LVGL UI Demo** | Showcase of the LittlevGL graphics library with widgets and animations |
| **WLED** | LED controller firmware adapted for the CYD's built-in RGB LEDs |
| **Tasmota** | General-purpose IoT firmware with MQTT, rules, and home-automation integrations |
| **Factory Reset** | Erase all user data and restore the board to its out-of-box state |

Community-contributed firmware images can be submitted via a pull request to the firmware manifest repository.

---

## Troubleshooting

| Symptom | Likely Cause | Solution |
|---|---|---|
| No ports listed | USB cable is charge-only, or driver missing | Use a data-capable cable; install CP2102 driver |
| "Failed to connect" error | Board not in download mode | Hold BOOT button and reconnect USB |
| Verification error after flash | Corrupted download or loose USB connection | Retry flashing; try a different cable or port |
| Browser shows no "Connect" button | Browser does not support Web Serial | Switch to Chrome or Edge 89+ |
| Board stuck in boot loop after flash | Wrong firmware variant selected | Flash the Factory Reset image, then re-flash the correct variant |

---

## Security & Privacy

- The application communicates only with the locally connected USB device. No firmware data, serial port information, or device identifiers are transmitted to any remote server beyond downloading the firmware binary itself.
- Firmware binaries are served over HTTPS and include SHA-256 checksums in the manifest for integrity verification.
- The Web Serial API requires an explicit user gesture (clicking "Connect") before any serial port access is granted; the browser enforces this permission model.

---

## Acknowledgements

- The ESP32 flashing protocol implementation is based on **esptool.py** by Espressif Systems.
- The Web Serial API integration follows the patterns established by the **ESP Web Tools** open-source project.
- The CYD community on Reddit (r/esp32) and the Brian Lough Discord server provided invaluable hardware documentation.

---

## License

See [LICENSE](LICENSE) for terms and conditions.