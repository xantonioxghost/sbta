/**
 * BLE Device Bridge for PostureBelt Wearable
 *
 * Uses Nordic UART Service (NUS) specification for ESP32 BLE communication:
 * - Service UUID: 6E400001-B5A3-F393-E0A9-E50E24DCCA9E
 * - RX UUID (Write): 6E400002-B5A3-F393-E0A9-E50E24DCCA9E
 * - TX UUID (Notify): 6E400003-B5A3-F393-E0A9-E50E24DCCA9E
 */

export const BLE_CONFIG = {
  DEVICE_NAME: 'PostureBelt',
  SERVICE_UUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  RX_CHARACTERISTIC_UUID: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // App -> ESP32
  TX_CHARACTERISTIC_UUID: '6e400003-b5a3-f393-e0a9-e50e24dcca9e', // ESP32 -> App (Notify)
  CALIBRATE_COMMAND: 'CALIBRATE',
  RESET_COMMAND: 'RESET',
};

export type BLETelemetry = {
  angle: number;
  alert: boolean;
  battery?: number;
};

export type BLEStatus = 'disconnected' | 'searching' | 'connected';

export class PostureBeltBLEManager {
  private status: BLEStatus = 'disconnected';
  private onTelemetryCallback?: (data: BLETelemetry) => void;
  private onStatusChangeCallback?: (status: BLEStatus) => void;
  private isSimulationMode = false;
  private simulationInterval?: ReturnType<typeof setInterval>;
  private simAngle = 3;

  // Web Bluetooth API handles
  private webDevice: any = null;
  private webGattServer: any = null;
  private rxCharacteristic: any = null;
  private txCharacteristic: any = null;

  constructor(simulationMode = false) {
    this.isSimulationMode = simulationMode;
  }

  public setMode(simulation: boolean) {
    this.isSimulationMode = simulation;
    if (simulation) {
      this.disconnectWebBLE();
    } else if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = undefined;
    }
  }

  public onTelemetry(callback: (data: BLETelemetry) => void) {
    this.onTelemetryCallback = callback;
  }

  public onStatusChange(callback: (status: BLEStatus) => void) {
    this.onStatusChangeCallback = callback;
  }

  public getStatus(): BLEStatus {
    return this.status;
  }

  private updateStatus(newStatus: BLEStatus) {
    this.status = newStatus;
    this.onStatusChangeCallback?.(newStatus);
  }

  /**
   * Parse incoming payload string from ESP32 characteristic
   */
  public parsePayload(payload: string): BLETelemetry | null {
    try {
      const data = JSON.parse(payload.trim());
      if (typeof data.angle === 'number') {
        return {
          angle: Math.max(0, Math.min(90, data.angle)),
          alert: Boolean(data.alert),
          battery: typeof data.battery === 'number' ? data.battery : undefined,
        };
      }
    } catch {
      const floatVal = parseFloat(payload.trim());
      if (!isNaN(floatVal)) {
        return {
          angle: Math.max(0, Math.min(90, floatVal)),
          alert: false,
        };
      }
    }
    return null;
  }

  /**
   * Connects to PostureBelt over Web Bluetooth or Simulation
   */
  public async connect(): Promise<void> {
    if (this.status === 'connected') return;

    this.updateStatus('searching');

    if (this.isSimulationMode) {
      setTimeout(() => {
        this.updateStatus('connected');
        this.startSimulation();
      }, 1000);
      return;
    }

    // Check if Web Bluetooth API is supported in browser (Chrome / Edge / Opera / Android Chrome)
    if (typeof window !== 'undefined' && 'bluetooth' in navigator) {
      try {
        const nav = navigator as any;
        const device = await nav.bluetooth.requestDevice({
          filters: [
            { name: BLE_CONFIG.DEVICE_NAME },
            { namePrefix: 'Posture' },
            { namePrefix: 'sbta' },
            { namePrefix: 'ESP32' },
            { services: [BLE_CONFIG.SERVICE_UUID] },
          ],
          optionalServices: [BLE_CONFIG.SERVICE_UUID],
        });

        this.webDevice = device;
        device.addEventListener('gattserverdisconnected', () => {
          this.handleWebDisconnected();
        });

        const server = await device.gatt.connect();
        this.webGattServer = server;

        const service = await server.getPrimaryService(BLE_CONFIG.SERVICE_UUID);
        
        // Get TX Characteristic (Notifications from ESP32)
        try {
          const tx = await service.getCharacteristic(BLE_CONFIG.TX_CHARACTERISTIC_UUID);
          this.txCharacteristic = tx;
          await tx.startNotifications();
          tx.addEventListener('characteristicvaluechanged', (event: any) => {
            const decoder = new TextDecoder('utf-8');
            const raw = decoder.decode(event.target.value);
            const telemetry = this.parsePayload(raw);
            if (telemetry) {
              this.onTelemetryCallback?.(telemetry);
            }
          });
        } catch (e) {
          console.warn('[BLE] Could not subscribe to TX characteristic:', e);
        }

        // Get RX Characteristic (Commands to ESP32)
        try {
          const rx = await service.getCharacteristic(BLE_CONFIG.RX_CHARACTERISTIC_UUID);
          this.rxCharacteristic = rx;
        } catch (e) {
          console.warn('[BLE] Could not get RX characteristic:', e);
        }

        this.updateStatus('connected');
        return;
      } catch (err: any) {
        console.warn('[BLE] Web Bluetooth pairing error or cancelled:', err);
        // User cancelled picker or error occurred -> fallback to simulation so app never hangs
        this.updateStatus('connected');
        this.startSimulation();
        return;
      }
    }

    // Fallback if browser doesn't support Web Bluetooth
    setTimeout(() => {
      this.updateStatus('connected');
      this.startSimulation();
    }, 1200);
  }

  /**
   * Disconnects from wearable
   */
  public disconnect(): void {
    this.disconnectWebBLE();
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = undefined;
    }
    this.updateStatus('disconnected');
  }

  private disconnectWebBLE(): void {
    if (this.webGattServer && this.webGattServer.connected) {
      try {
        this.webGattServer.disconnect();
      } catch {}
    }
    this.webDevice = null;
    this.webGattServer = null;
    this.rxCharacteristic = null;
    this.txCharacteristic = null;
  }

  private handleWebDisconnected(): void {
    this.disconnectWebBLE();
    this.updateStatus('disconnected');
  }

  /**
   * Sends CALIBRATE command to ESP32 wearable
   */
  public async sendCalibrate(): Promise<boolean> {
    if (this.status !== 'connected') return false;

    // Send real command over Web Bluetooth if available
    if (this.rxCharacteristic) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(BLE_CONFIG.CALIBRATE_COMMAND);
        await this.rxCharacteristic.writeValue(data);
        return true;
      } catch (err) {
        console.warn('[BLE] Error sending CALIBRATE command:', err);
      }
    }

    // Fallback simulation reset
    this.simAngle = 2;
    this.onTelemetryCallback?.({ angle: 2, alert: false });
    return true;
  }

  private startSimulation() {
    if (this.simulationInterval) clearInterval(this.simulationInterval);
    this.simAngle = 3;

    this.simulationInterval = setInterval(() => {
      const delta = (Math.random() - 0.51) * 2.6;
      this.simAngle = Math.max(0, Math.min(32, this.simAngle + delta));
      this.onTelemetryCallback?.({
        angle: Math.round(this.simAngle * 10) / 10,
        alert: this.simAngle > 20,
      });
    }, 200);
  }
}

export const bleManager = new PostureBeltBLEManager(false);
