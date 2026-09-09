/**
 * ==============================================================================
 * PostureBelt - ESP32 Wearable Posture Monitor Firmware
 * ==============================================================================
 * 
 * Hardware:
 * - ESP32 Development Board (NodeMCU / WROOM-32 / Xiao ESP32-C3)
 * - MPU6050 Accelerometer & Gyroscope (I2C)
 * - Vibration Motor / Haptic Buzzer on GPIO 25
 * 
 * Communication:
 * - Bluetooth Low Energy (BLE) using Nordic UART Service (NUS)
 * - Advertising Name: "PostureBelt"
 * - Service UUID: 6E400001-B5A3-F393-E0A9-E50E24DCCA9E
 * - RX (Write from App): 6E400002-B5A3-F393-E0A9-E50E24DCCA9E
 * - TX (Notify to App):  6E400003-B5A3-F393-E0A9-E50E24DCCA9E
 * 
 * ==============================================================================
 */

#include <Wire.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// ------------------------------------------------------------------------------
// Pin Definitions
// ------------------------------------------------------------------------------
#define SDA_PIN 21
#define SCL_PIN 22
#define HAPTIC_PIN 25
#define LED_STATUS_PIN 2 // Built-in LED on most ESP32 boards

// ------------------------------------------------------------------------------
// MPU6050 I2C Configuration
// ------------------------------------------------------------------------------
#define MPU6050_ADDR 0x68
#define MPU6050_PWR_MGMT_1 0x6B
#define MPU6050_ACCEL_XOUT_H 0x3B

// ------------------------------------------------------------------------------
// BLE UUID Definitions (Nordic UART Service)
// ------------------------------------------------------------------------------
#define SERVICE_UUID           "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_RX "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_TX "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"

// ------------------------------------------------------------------------------
// Posture Tracking & Calibration Variables
// ------------------------------------------------------------------------------
float baselinePitch = 0.0;
float baselineRoll = 0.0;
bool isCalibrated = false;

// Default alert thresholds (can also be updated from app)
float alertThresholdDegrees = 15.0;
unsigned long badPostureDurationMs = 0;
const unsigned long alertDelayMs = 8000; // 8 seconds before on-device vibration
bool alertActive = false;

// ------------------------------------------------------------------------------
// BLE Server & Characteristics
// ------------------------------------------------------------------------------
BLEServer *pServer = NULL;
BLECharacteristic *pTxCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;

// ------------------------------------------------------------------------------
// BLE Server Callbacks
// ------------------------------------------------------------------------------
class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *pServer) {
    deviceConnected = true;
    digitalWrite(LED_STATUS_PIN, HIGH);
    Serial.println("[BLE] Mobile companion connected!");
  }

  void onDisconnect(BLEServer *pServer) {
    deviceConnected = false;
    digitalWrite(LED_STATUS_PIN, LOW);
    digitalWrite(HAPTIC_PIN, LOW);
    alertActive = false;
    Serial.println("[BLE] Mobile companion disconnected.");
  }
};

// ------------------------------------------------------------------------------
// BLE Characteristic Callback (Commands received from App)
// ------------------------------------------------------------------------------
class MyCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *pCharacteristic) {
    String rxValue = pCharacteristic->getValue();
    if (rxValue.length() > 0) {
      Serial.print("[BLE] Command received: ");
      Serial.println(rxValue);

      // Handle CALIBRATE command
      if (rxValue.indexOf("CALIBRATE") >= 0) {
        calibrateBaseline();
      }
    }
  }
};

// ------------------------------------------------------------------------------
// MPU6050 Initialization
// ------------------------------------------------------------------------------
bool initMPU6050() {
  Wire.begin(SDA_PIN, SCL_PIN, 400000);
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(MPU6050_PWR_MGMT_1);
  Wire.write(0x00); // Wake up MPU6050
  byte error = Wire.endTransmission();

  if (error == 0) {
    Serial.println("[MPU6050] Sensor connected and active.");
    return true;
  } else {
    Serial.print("[MPU6050] Error connecting to sensor, code: ");
    Serial.println(error);
    return false;
  }
}

// ------------------------------------------------------------------------------
// Read Raw Accelerometer & Compute Angles
// ------------------------------------------------------------------------------
void readAngles(float &pitch, float &roll) {
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(MPU6050_ACCEL_XOUT_H);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU6050_ADDR, 6, true);

  if (Wire.available() >= 6) {
    int16_t rawX = (Wire.read() << 8) | Wire.read();
    int16_t rawY = (Wire.read() << 8) | Wire.read();
    int16_t rawZ = (Wire.read() << 8) | Wire.read();

    float ax = (float)rawX / 16384.0;
    float ay = (float)rawY / 16384.0;
    float az = (float)rawZ / 16384.0;

    // Calculate pitch and roll angles in degrees
    pitch = atan2(ay, sqrt(ax * ax + az * az)) * 180.0 / PI;
    roll = atan2(-ax, az) * 180.0 / PI;
  }
}

// ------------------------------------------------------------------------------
// Calibrate Baseline (Zero-Reference)
// ------------------------------------------------------------------------------
void calibrateBaseline() {
  Serial.println("[POSTURE] Calibrating zero-deviation baseline...");
  float sumPitch = 0.0;
  float sumRoll = 0.0;
  const int samples = 15;

  for (int i = 0; i < samples; i++) {
    float p, r;
    readAngles(p, r);
    sumPitch += p;
    sumRoll += r;
    delay(40);
  }

  baselinePitch = sumPitch / samples;
  baselineRoll = sumRoll / samples;
  isCalibrated = true;
  badPostureDurationMs = 0;
  alertActive = false;
  digitalWrite(HAPTIC_PIN, LOW);

  // Quick double pulse for haptic calibration feedback
  digitalWrite(HAPTIC_PIN, HIGH);
  delay(90);
  digitalWrite(HAPTIC_PIN, LOW);
  delay(80);
  digitalWrite(HAPTIC_PIN, HIGH);
  delay(90);
  digitalWrite(HAPTIC_PIN, LOW);

  Serial.print("[POSTURE] Calibration complete. Baseline Pitch: ");
  Serial.print(baselinePitch);
  Serial.print("°, Roll: ");
  Serial.println(baselineRoll);
}

// ------------------------------------------------------------------------------
// Arduino Setup
// ------------------------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n--- PostureBelt Wearable Booting ---");

  pinMode(HAPTIC_PIN, OUTPUT);
  pinMode(LED_STATUS_PIN, OUTPUT);
  digitalWrite(HAPTIC_PIN, LOW);
  digitalWrite(LED_STATUS_PIN, LOW);

  // 1. Initialize sensor
  initMPU6050();

  // 2. Initial baseline calibration
  calibrateBaseline();

  // 3. Initialize BLE Device
  BLEDevice::init("PostureBelt");

  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create the BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create TX Characteristic (Notifications to App)
  pTxCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID_TX,
    BLECharacteristic::PROPERTY_NOTIFY
  );
  pTxCharacteristic->addDescriptor(new BLE2902());

  // Create RX Characteristic (Commands from App)
  BLECharacteristic *pRxCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID_RX,
    BLECharacteristic::PROPERTY_WRITE
  );
  pRxCharacteristic->setCallbacks(new MyCallbacks());

  // Start the service
  pService->start();

  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

  Serial.println("[BLE] Advertising as 'PostureBelt'. Ready to pair.");
}

// ------------------------------------------------------------------------------
// Main Loop (Runs at ~5Hz / 200ms)
// ------------------------------------------------------------------------------
void loop() {
  static unsigned long lastUpdate = 0;
  unsigned long now = millis();

  if (now - lastUpdate >= 200) {
    unsigned long dt = now - lastUpdate;
    lastUpdate = now;

    float pitch, roll;
    readAngles(pitch, roll);

    // Calculate total angular deviation from calibrated baseline
    float dPitch = pitch - baselinePitch;
    float dRoll = roll - baselineRoll;
    float deviation = sqrt(dPitch * dPitch + dRoll * dRoll);

    bool badPosture = deviation > alertThresholdDegrees;

    // Check sustained bad posture for haptic reminder
    if (badPosture) {
      badPostureDurationMs += dt;
      if (badPostureDurationMs >= alertDelayMs) {
        alertActive = true;
        digitalWrite(HAPTIC_PIN, HIGH); // Pulse vibration motor
      }
    } else {
      badPostureDurationMs = 0;
      if (alertActive) {
        alertActive = false;
        digitalWrite(HAPTIC_PIN, LOW); // Turn off vibration
      }
    }

    // Transmit telemetry to app if connected
    if (deviceConnected && pTxCharacteristic != NULL) {
      // Build JSON payload: {"angle": 12.4, "alert": false}
      String payload = "{\"angle\":" + String(deviation, 1) +
                       ",\"alert\":" + (alertActive ? "true" : "false") + "}";

      pTxCharacteristic->setValue((uint8_t*)payload.c_str(), payload.length());
      pTxCharacteristic->notify();
    }
  }

  // Handle auto-reconnect advertising
  if (!deviceConnected && oldDeviceConnected) {
    delay(500); // Give Bluetooth stack time to settle
    pServer->startAdvertising();
    Serial.println("[BLE] Restarting advertising...");
    oldDeviceConnected = deviceConnected;
  }
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }
}
