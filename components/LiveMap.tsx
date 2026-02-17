
import React, { useEffect, useRef } from 'react';
import { SavedLocation } from '../types';

declare const L: any;

interface LiveMapProps {
  location: { lat: number; lng: number };
  accessibilityMode: boolean;
  geofences?: SavedLocation[];
  showTrail?: boolean;
}

const LiveMap: React.FC<LiveMapProps> = ({ location, accessibilityMode, geofences = [], showTrail = false }) => {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geofenceLayers = useRef<any[]>([]);
  const trailRef = useRef<any>(null);
  const pathCoordinates = useRef<[number, number][]>([]);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map-container', {
        zoomControl: false,
        attributionControl: false
      }).setView([location.lat, location.lng], 15);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

      const userIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="relative">
                <div class="absolute -inset-2 bg-blue-500/20 rounded-full animate-ping"></div>
                <div style="background-color: #2563eb; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(37,99,235,0.4); position: relative; z-index: 10;"></div>
               </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      markerRef.current = L.marker([location.lat, location.lng], { icon: userIcon }).addTo(mapRef.current);
      
      trailRef.current = L.polyline([], {
        color: '#2563eb',
        weight: 3,
        opacity: 0.5,
        dashArray: '5, 10'
      }).addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      const newPos: [number, number] = [location.lat, location.lng];
      markerRef.current.setLatLng(newPos);
      
      if (showTrail) {
        pathCoordinates.current.push(newPos);
        if (pathCoordinates.current.length > 50) pathCoordinates.current.shift();
        trailRef.current.setLatLngs(pathCoordinates.current);
      } else {
        pathCoordinates.current = [];
        trailRef.current.setLatLngs([]);
      }
      
      mapRef.current.panTo(newPos, { animate: true });
    }
  }, [location, showTrail]);

  useEffect(() => {
    if (!mapRef.current) return;
    geofenceLayers.current.forEach(layer => mapRef.current.removeLayer(layer));
    geofenceLayers.current = [];

    geofences.filter(g => g.geofenceEnabled && g.geofenceRadius).forEach(g => {
      const circle = L.circle([g.lat, g.lng], {
        color: accessibilityMode ? '#fff' : '#2563eb',
        fillColor: accessibilityMode ? '#fff' : '#2563eb',
        fillOpacity: accessibilityMode ? 0.3 : 0.1,
        weight: 2,
        radius: g.geofenceRadius
      }).addTo(mapRef.current);
      
      geofenceLayers.current.push(circle);
    });
  }, [geofences, accessibilityMode]);

  return (
    <div className="relative w-full h-full">
      <div id="map-container" className={`w-full h-full rounded-2xl shadow-inner border transition-all ${accessibilityMode ? 'border-white' : 'border-slate-200'}`}></div>
      <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
        <div className={`px-4 py-2 rounded-xl shadow-xl flex items-center gap-3 backdrop-blur-md ${accessibilityMode ? 'bg-black/80 border border-white text-white' : 'bg-white/90 border border-slate-200 text-slate-800'}`}>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-bold tracking-tight">LIVE GPS FEED</span>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
