
import { AlertType, DeviceStatus, Alert, DeviceHealth, SavedLocation } from './types';

export const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    type: AlertType.SOS,
    timestamp: new Date().toISOString(),
    location: 'Main St & 5th Ave',
    lat: 40.7128,
    lng: -74.0060,
    status: 'Pending',
    severity: 'Critical'
  },
  {
    id: '2',
    type: AlertType.LOW_BATTERY,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    location: 'Current Location',
    lat: 40.7128,
    lng: -74.0060,
    status: 'Resolved',
    severity: 'Warning'
  }
];

export const MOCK_DEVICE: DeviceHealth = {
  battery: 82,
  signalStrength: 4,
  gpsStatus: 'Active',
  lastSeen: new Date().toISOString(),
  status: DeviceStatus.ONLINE
};

export const MOCK_LOCATIONS: SavedLocation[] = [
  { 
    id: '1', 
    name: 'Home', 
    address: '123 Peace Lane', 
    lat: 40.7128, 
    lng: -74.0060, 
    type: 'Home',
    geofenceRadius: 200,
    geofenceEnabled: true 
  },
  { 
    id: '2', 
    name: 'Central Hospital', 
    address: '456 Med Blvd', 
    lat: 40.7228, 
    lng: -74.0160, 
    type: 'Hospital',
    geofenceRadius: 500,
    geofenceEnabled: false 
  },
  { 
    id: '3', 
    name: 'Office', 
    address: '789 Tech Park', 
    lat: 40.7028, 
    lng: -73.9960, 
    type: 'Work',
    geofenceRadius: 300,
    geofenceEnabled: false 
  }
];
