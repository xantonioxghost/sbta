# PostureBelt ESP32 Firmware & Hardware Guide

This folder contains the complete firmware for the **PostureBelt** wearable device, which pairs seamlessly with the Posture Monitor mobile app over Bluetooth Low Energy (BLE).

---

## Hardware Components Required

| Component | Quantity | Description |
| :--- | :--- | :--- |
| **ESP32 Dev Board** | 1 | NodeMCU ESP32, ESP32-WROOM-32, or Seeed Xiao ESP32-C3 |
| **MPU6050 Sensor** | 1 | 6-axis I2C accelerometer & gyroscope breakout board |
| **Vibration Motor** | 1 | 3V disc or cylinder coin vibration motor (or small piezo buzzer) |
| **NPN Transistor** | 1 | 2N2222 or similar (to drive vibration motor safely from 3.3V) |
| **Resistor** | 1 | 1kΩ (between ESP32 GPIO 25 and Transistor Base) |
| **Diode** | 1 | 1N4001 or 1N4148 (flyback diode across motor terminals) |
| **Battery / Power** | 1 | 3.7V LiPo battery with charging module (or standard 5V USB power bank) |

---

## Wiring Schematic & Pinout

```
+-----------------------------------------------------------+
|                        ESP32                              |
|                                                           |
|    3V3 -------------------------> MPU6050 VCC             |
|    GND -------------------------> MPU6050 GND             |
|    GPIO 21 (SDA) ---------------> MPU6050 SDA             |
|    GPIO 22 (SCL) ---------------> MPU6050 SCL             |
|                                                           |
|    GPIO 25 -----[ 1kΩ ]---------> Transistor Base         |
|    GND -------------------------> Transistor Emitter      |
|    3V3 -------------------------> Motor (+)               |
|    Transistor Collector --------> Motor (-)               |
+-----------------------------------------------------------+
```

> [!NOTE]
> Add a flyback diode in reverse-parallel with the vibration motor (cathode to 3V3, anode to collector) to protect the ESP32 from inductive voltage spikes.

---

## How to Flash the ESP32

### Option A: Using Arduino IDE (Recommended)

1. **Install Arduino IDE**: Download from [arduino.cc](https://www.arduino.cc).
2. **Add ESP32 Board Support**:
   - In Arduino IDE, go to **Settings** / **Preferences**.
   - Add this URL to *Additional Board Manager URLs*:
     ```
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     ```
   - Go to **Boards Manager**, search for `esp32` by Espressif Systems, and click **Install**.
3. **Open the Sketch**:
   - Open [`esp32_posture_belt/esp32_posture_belt.ino`](esp32_posture_belt/esp32_posture_belt.ino).
4. **Select Board & Port**:
   - Select **Tools** → **Board** → **ESP32 Dev Module** (or your specific board).
   - Select the USB serial port under **Tools** → **Port**.
5. **Upload**:
   - Click the **Upload** button (arrow icon).
   - Open **Serial Monitor** at `115200` baud to observe boot and sensor status.

---

## BLE Communication Protocol

- **Device Name**: `PostureBelt`
- **Service UUID**: `6E400001-B5A3-F393-E0A9-E50E24DCCA9E`
- **TX Characteristic (Notify)**: `6E400003-B5A3-F393-E0A9-E50E24DCCA9E`
  - Sends live 5Hz JSON packets:
    ```json
    {"angle": 12.4, "alert": false}
    ```
- **RX Characteristic (Write)**: `6E400002-B5A3-F393-E0A9-E50E24DCCA9E`
  - Receives ASCII commands from the mobile app:
    - `"CALIBRATE"`: Zeroes the current posture as the upright reference baseline.
