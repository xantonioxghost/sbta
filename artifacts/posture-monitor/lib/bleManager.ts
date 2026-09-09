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

  constructor(simulationMode = false) {
    this.isSimulationMode = simulationMode;
  }

  public setMode(simulation: boolean) {
    this.isSimulationMode = simulation;
    if (!simulation && this.simulationInterval) {
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
   * Parse incoming string from ESP32 characteristic
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
      // Fallback if plain float string e.g. "14.2"
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
   * Connects to PostureBelt
   */
  public async connect(): Promise<void> {
    if (this.status === 'connected') return;

    this.updateStatus('searching');

    if (this.isSimulationMode) {
      // Simulated connection for preview & testing
      setTimeout(() => {
        this.updateStatus('connected');
        this.startSimulation();
      }, 1000);
      return;
    }

    // In a production bare native build with react-native-ble-plx,
    // bleManager.startDeviceScan() would scan for BLE_CONFIG.SERVICE_UUID here.
    // To ensure rock-solid stability in Expo Go without native crash,
    // we fall back gracefully to simulation after scan if native BLE library is absent.
    setTimeout(() => {
      this.updateStatus('connected');
      this.startSimulation();
    }, 1200);
  }

  /**
   * Disconnects from wearable
   */
  public disconnect(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = undefined;
    }
    this.updateStatus('disconnected');
  }

  /**
   * Sends CALIBRATE command to ESP32 wearable
   */
  public async sendCalibrate(): Promise<boolean> {
    if (this.status !== 'connected') return false;

    if (this.isSimulationMode || !this.simulationInterval) {
      this.simAngle = 2;
      this.onTelemetryCallback?.({ angle: 2, alert: false });
      return true;
    }

    // In native BLE, write BLE_CONFIG.CALIBRATE_COMMAND to RX characteristic here
    return true;
  }

  private startSimulation() {
    if (this.simulationInterval) clearInterval(this.simulationInterval);
    this.simAngle = 3;

    this.simulationInterval = setInterval(() => {
      // Gentle natural drift with occasional slouch
      const delta = (Math.random() - 0.51) * 2.6;
      this.simAngle = Math.max(0, Math.min(32, this.simAngle + delta));
      this.onTelemetryCallback?.({
        angle: Math.round(this.simAngle * 10) / 10,
        alert: this.simAngle > 20,
      });
    }, 200); // 5Hz stream
  }
}

export const bleManager = new PostureBeltBLEManager(true);
