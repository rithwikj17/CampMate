import React, { useEffect, useState, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, GeolocateControl, Source, Layer } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { MapPin, Navigation, Info } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';

const ICON_STYLES = {
  Campus: { colorClass: 'text-indigo-600', bgClass: 'bg-indigo-100', borderClass: 'border-indigo-500', pinColor: 'border-t-indigo-500' },
  Hostel: { colorClass: 'text-purple-600', bgClass: 'bg-purple-100', borderClass: 'border-purple-500', pinColor: 'border-t-purple-500' },
};

const CustomMarker = ({ category, onClick }) => {
  const style = ICON_STYLES[category] || ICON_STYLES.Campus;
  
  // 3D Isometric building SVG
  const svgIcon = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>;

  return (
    <div className="relative flex flex-col items-center group cursor-pointer drop-shadow-2xl" onClick={onClick}>
      <div className="absolute inset-0 bg-black/40 rounded-full blur-md transform translate-y-4 scale-75 group-hover:scale-100 transition-transform"></div>
      <div className={`relative w-12 h-12 ${style.bgClass} rounded-xl border-2 ${style.borderClass} flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 shadow-inner overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-transparent"></div>
        <div className={`${style.colorClass} drop-shadow-md z-10`}>{svgIcon}</div>
      </div>
      <div className={`w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] ${style.pinColor} mt-[-2px] transform transition-all duration-300 group-hover:-translate-y-2`}></div>
    </div>
  );
};

const mockLocations = [
  { id: 1, name: 'BVRIT Main Campus', lat: 17.7252584, lng: 78.2571511, type: 'Campus', desc: 'Padmasri Dr. B.V Raju Institute of Technology' },
  { id: 2, name: 'BVRIT Boys Hostel 1', lat: 17.7262000, lng: 78.2560000, type: 'Hostel', desc: 'Main Boys Residential Hostel' },
  { id: 3, name: 'BVRIT Boys Hostel 2', lat: 17.7268000, lng: 78.2562000, type: 'Hostel', desc: 'New Boys Residential Hostel' },
];

const CampusMap = () => {
  const [viewState, setViewState] = useState({
    longitude: 78.2571511,
    latitude: 17.7252584,
    zoom: 17,
    pitch: 0,
    bearing: 0
  });

  const [popupInfo, setPopupInfo] = useState(null);

  const BUILDINGS_GEOJSON = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: 'Main Block', height: 35, base_height: 0, color: '#e0f2fe' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [78.2568, 17.7256], [78.2575, 17.7256], [78.2575, 17.7249], [78.2568, 17.7249], [78.2568, 17.7256]
          ]]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'Boys Hostel 1', height: 25, base_height: 0, color: '#f3e8ff' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [78.2558, 17.7264], [78.2562, 17.7264], [78.2562, 17.7260], [78.2558, 17.7260], [78.2558, 17.7264]
          ]]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'Boys Hostel 2', height: 25, base_height: 0, color: '#f3e8ff' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [78.2560, 17.7270], [78.2564, 17.7270], [78.2564, 17.7266], [78.2560, 17.7266], [78.2560, 17.7270]
          ]]
        }
      }
    ]
  };

  const pins = useMemo(
    () =>
      mockLocations.map((loc, index) => (
        <Marker 
          key={`marker-${index}`} 
          longitude={loc.lng} 
          latitude={loc.lat} 
          anchor="bottom"
        >
          <CustomMarker 
            category={loc.type} 
            onClick={(e) => {
              e.stopPropagation();
              setPopupInfo(loc);
            }} 
          />
        </Marker>
      )),
    []
  );

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[85vh]">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Campus Navigator</h1>
        <p className="text-gray-500 mt-1">Find your way around the university facilities.</p>
      </div>

      <div className="flex-grow glass rounded-2xl overflow-hidden shadow-xl border border-gray-200 relative">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
          style={{ width: '100%', height: '100%' }}
          maxPitch={0}
          dragRotate={false}
          pitchWithRotate={false}
        >
          <FullscreenControl position="top-left" />
          <NavigationControl position="top-left" />
          <GeolocateControl position="top-left" />

          {/* 3D Buildings Layer using GEOJSON */}
          <Source id="custom-buildings" type="geojson" data={BUILDINGS_GEOJSON}>
            <Layer
              id="custom-3d-buildings"
              type="fill-extrusion"
              paint={{
                'fill-extrusion-color': ['get', 'color'],
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'base_height'],
                'fill-extrusion-opacity': 0.9
              }}
            />
          </Source>

          {/* Explicit HTML Text Labels for Buildings to prevent 3D WebGL occlusion */}
          <Marker longitude={78.25715} latitude={17.72525} anchor="center">
            <div className="text-gray-900 font-bold text-sm tracking-wide bg-white/50 px-2 py-0.5 rounded-md backdrop-blur-sm shadow-sm pointer-events-none whitespace-nowrap">Main Block</div>
          </Marker>
          <Marker longitude={78.2560} latitude={17.7262} anchor="center">
            <div className="text-gray-900 font-bold text-sm tracking-wide bg-white/50 px-2 py-0.5 rounded-md backdrop-blur-sm shadow-sm pointer-events-none whitespace-nowrap">Boys Hostel 1</div>
          </Marker>
          <Marker longitude={78.2562} latitude={17.7268} anchor="center">
            <div className="text-gray-900 font-bold text-sm tracking-wide bg-white/50 px-2 py-0.5 rounded-md backdrop-blur-sm shadow-sm pointer-events-none whitespace-nowrap">Boys Hostel 2</div>
          </Marker>

          {pins}

          {popupInfo && (
            <Popup
              anchor="top"
              longitude={Number(popupInfo.lng)}
              latitude={Number(popupInfo.lat)}
              onClose={() => setPopupInfo(null)}
              className="z-[500]"
              closeOnClick={false}
            >
              <div className="p-1 min-w-[200px]">
                <h3 className="font-bold text-gray-900 text-lg mb-1">{popupInfo.name}</h3>
                <span className="inline-block px-2 py-0.5 bg-brand-50 text-brand-600 rounded text-xs font-semibold mb-2">
                  {popupInfo.type}
                </span>
                <p className="text-gray-600 text-sm">{popupInfo.desc}</p>
                
                <button 
                  className="mt-3 w-full bg-brand-600 text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-brand-700 transition-colors"
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${popupInfo.lat},${popupInfo.lng}`, '_blank')}
                >
                  <Navigation size={14} /> Get Directions
                </button>
              </div>
            </Popup>
          )}

        </Map>
        
        {/* Map Overlay info box */}
        <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur shadow-lg rounded-xl p-4 w-64 border border-gray-100 hidden md:block">
          <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
            <Info size={16} className="text-brand-500" />
            Map Legend
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2"><MapPin size={14} className="text-blue-500"/> Campus Buildings</li>
            <li className="flex items-center gap-2"><MapPin size={14} className="text-red-500"/> Dining & Cafes</li>
            <li className="flex items-center gap-2"><MapPin size={14} className="text-green-500"/> Entrances</li>
            <li className="flex items-center gap-2"><MapPin size={14} className="text-purple-500"/> Hostels</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CampusMap;
