import { ControlRoomOfficer } from '../types/controlRoom';

export interface DemoControlCentrePreset {
  controlCentreId: string;
  controlCentreName: string;
  officerName: string;
  designation: string;
  division: string;
  zone: string;
  shiftCode: string;
  badgeNumber: string;
}

export const DEMO_CONTROL_CENTRES: DemoControlCentrePreset[] = [
  {
    controlCentreId: 'CC-DLI-MAIN',
    controlCentreName: 'Delhi Central Operational Control Hub',
    officerName: 'Rajesh Kumar Sharma',
    designation: 'Chief Section Controller (Grade-I)',
    division: 'Delhi (DLI)',
    zone: 'Northern Railway (NR)',
    shiftCode: 'SHIFT-A (06:00 - 14:00)',
    badgeNumber: 'NR-DLI-OPS-4412'
  },
  {
    controlCentreId: 'CC-WR-MUMBAI',
    controlCentreName: 'Mumbai Central Western Corridor Control Room',
    officerName: 'Priya Mukherjee',
    designation: 'Senior Divisional Operating Manager',
    division: 'Mumbai Central (MMCT)',
    zone: 'Western Railway (WR)',
    shiftCode: 'SHIFT-B (14:00 - 22:00)',
    badgeNumber: 'WR-MMCT-OPS-8109'
  },
  {
    controlCentreId: 'CC-NCR-KANPUR',
    controlCentreName: 'Kanpur Central High-Density Chord Control',
    officerName: 'Amitabh Verma',
    designation: 'Section Movement Controller',
    division: 'Prayagraj (PRYJ)',
    zone: 'North Central Railway (NCR)',
    shiftCode: 'SHIFT-A (06:00 - 14:00)',
    badgeNumber: 'NCR-CNB-OPS-3302'
  },
  {
    controlCentreId: 'CC-ER-HOWRAH',
    controlCentreName: 'Howrah Terminal Control & Dispatch Office',
    officerName: 'Debashis Roy',
    designation: 'Chief Train Controller',
    division: 'Howrah (HWH)',
    zone: 'Eastern Railway (ER)',
    shiftCode: 'SHIFT-NIGHT (22:00 - 06:00)',
    badgeNumber: 'ER-HWH-OPS-9011'
  }
];

class ControlRoomAuthServiceImpl {
  private currentOfficer: ControlRoomOfficer | null = null;
  private listeners: Set<(officer: ControlRoomOfficer | null) => void> = new Set();
  private readonly STORAGE_KEY = 'ry_control_room_officer_session';

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const stored = window.sessionStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.isLoggedIn) {
            this.currentOfficer = parsed;
          }
        }
      }
    } catch {
      // In case sessionStorage is restricted in iframe
    }
  }

  private saveSession(): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        if (this.currentOfficer && this.currentOfficer.isLoggedIn) {
          window.sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentOfficer));
        } else {
          window.sessionStorage.removeItem(this.STORAGE_KEY);
        }
      }
    } catch {
      // Ignore storage errors in sandboxed iframes
    }
  }

  public getOfficer(): ControlRoomOfficer | null {
    return this.currentOfficer;
  }

  public isLoggedIn(): boolean {
    return !!(this.currentOfficer && this.currentOfficer.isLoggedIn);
  }

  public login(params: {
    controlCentreId: string;
    controlCentreName?: string;
    officerName: string;
    designation: string;
    division?: string;
    zone?: string;
    password?: string;
  }): { success: boolean; message: string; officer?: ControlRoomOfficer } {
    const cleanCC = (params.controlCentreId || '').trim();
    const cleanName = (params.officerName || '').trim();
    const cleanDesig = (params.designation || '').trim();

    if (!cleanCC) {
      return { success: false, message: 'Control Centre / Station ID is required' };
    }
    if (!cleanName) {
      return { success: false, message: 'Officer Name is required' };
    }
    if (!cleanDesig) {
      return { success: false, message: 'Designation is required' };
    }

    // Match preset if exists or populate realistic defaults
    const preset = DEMO_CONTROL_CENTRES.find(
      (p) => p.controlCentreId.toLowerCase() === cleanCC.toLowerCase()
    );

    const officer: ControlRoomOfficer = {
      controlCentreId: cleanCC.toUpperCase(),
      controlCentreName: params.controlCentreName || preset?.controlCentreName || `${cleanCC.toUpperCase()} Control Desk`,
      officerName: cleanName,
      designation: cleanDesig,
      division: params.division || preset?.division || 'Divisional Traffic Control',
      zone: params.zone || preset?.zone || 'Indian Railways (Central Operational Bus)',
      shiftCode: preset?.shiftCode || 'ACTIVE GENERAL DUTY',
      badgeNumber: preset?.badgeNumber || `IR-OPS-${Math.floor(1000 + Math.random() * 9000)}`,
      isLoggedIn: true,
      loginTimestamp: new Date().toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) + ' IST'
    };

    this.currentOfficer = officer;
    this.saveSession();
    this.notify();
    return { success: true, message: 'Authenticated successfully', officer };
  }

  public logout(): void {
    this.currentOfficer = null;
    this.saveSession();
    this.notify();
  }

  public subscribe(listener: (officer: ControlRoomOfficer | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => {
      try {
        fn(this.currentOfficer);
      } catch (err) {
        console.error('Error in auth listener:', err);
      }
    });
  }
}

export const controlRoomAuthService = new ControlRoomAuthServiceImpl();
