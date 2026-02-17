
export enum DeviceStatus {
  ONLINE = 'Online',
  OFFLINE = 'Offline',
  CHARGING = 'Charging'
}

export enum AlertType {
  SOS = 'SOS',
  FALL = 'Fall Detected',
  LOW_BATTERY = 'Low Battery',
  GEOFENCE = 'Geofence Breach'
}

export interface UserLocation {
  lat: number;
  lng: number;
  timestamp: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  timestamp: string;
  location: string;
  lat: number;
  lng: number;
  status: 'Pending' | 'Resolved';
  severity: 'Critical' | 'Warning' | 'Info';
}

export interface DeviceHealth {
  battery: number;
  signalStrength: number;
  gpsStatus: 'Active' | 'Searching' | 'Inactive';
  lastSeen: string;
  status: DeviceStatus;
}

export interface SavedLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'Home' | 'Work' | 'Hospital' | 'Other';
  geofenceRadius?: number; // in meters
  geofenceEnabled?: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeFont: boolean;
  screenReaderOptimized: boolean;
}
