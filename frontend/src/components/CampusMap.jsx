import React, { useState, useEffect, useRef, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, GeolocateControl, Source, Layer } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import L from 'leaflet';
import axios from 'axios';
import { Search, MapPin, Navigation, Navigation2, Building, Coffee, Dumbbell, BookOpen } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';

// ==========================================
// Custom Icon Configurations
// ==========================================
const ICON_STYLES = {
  Campus: { colorClass: 'text-indigo-600', bgClass: 'bg-indigo-100', borderClass: 'border-indigo-500', pinColor: 'border-t-indigo-500' },
  Hostel: { colorClass: 'text-purple-600', bgClass: 'bg-purple-100', borderClass: 'border-purple-500', pinColor: 'border-t-purple-500' },
  Lab: { colorClass: 'text-violet-600', bgClass: 'bg-violet-100', borderClass: 'border-violet-500', pinColor: 'border-t-violet-500' },
  Cafeteria: { colorClass: 'text-orange-600', bgClass: 'bg-orange-100', borderClass: 'border-orange-500', pinColor: 'border-t-orange-500' },
  Sports: { colorClass: 'text-green-600', bgClass: 'bg-green-100', borderClass: 'border-green-500', pinColor: 'border-t-green-500' },
  Building: { colorClass: 'text-blue-600', bgClass: 'bg-blue-100', borderClass: 'border-blue-500', pinColor: 'border-t-blue-500' },
  Other: { colorClass: 'text-slate-600', bgClass: 'bg-slate-100', borderClass: 'border-slate-500', pinColor: 'border-t-slate-500' }
};

const CustomMarker = ({ category, onClick }) => {
  const style = ICON_STYLES[category] || ICON_STYLES.Other;
  
  // 3D Isometric building SVG
  const svgIcon = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>;

  return (
    <div className="relative flex flex-col items-center group cursor-pointer drop-shadow-2xl" onClick={(e) => { e.stopPropagation(); if (onClick) onClick(); }}>
      <div className="absolute inset-0 bg-black/40 rounded-full blur-md transform translate-y-4 scale-75 group-hover:scale-100 transition-transform"></div>
      <div className={`relative w-12 h-12 ${style.bgClass} rounded-xl border-2 ${style.borderClass} flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 shadow-inner overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-transparent"></div>
        <div className={`${style.colorClass} drop-shadow-md z-10`}>{svgIcon}</div>
      </div>
      <div className={`w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] ${style.pinColor} mt-[-2px] transform transition-all duration-300 group-hover:-translate-y-2`}></div>
    </div>
  );
};

// Removed MapController due to Mapbox architecture

const CampusMap = () => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Set Mock Locations (Since API is unavailable)
  useEffect(() => {
    const mockData = [
      {
        id: 1,
        location_name: 'BVRIT Main Campus',
        description: 'Padmasri Dr. B.V Raju Institute of Technology',
        latitude: 17.7252584,
        longitude: 78.2571511
      },
      {
        id: 2,
        location_name: 'Boys Hostel 1',
        description: 'Main Boys Residential Hostel',
        latitude: 17.7262000,
        longitude: 78.2560000
      },
      {
        id: 3,
        location_name: 'Boys Hostel 2',
        description: 'New Boys Residential Hostel',
        latitude: 17.7268000,
        longitude: 78.2562000
      }
    ];
    setLocations(mockData);
    setFilteredLocations(mockData);
  }, []);

  // Filter logic
  useEffect(() => {
    if (!searchTerm) {
      setFilteredLocations(locations);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = locations.filter(loc =>
      (loc.location_name || loc.name)?.toLowerCase().includes(term) ||
      loc.description?.toLowerCase().includes(term)
    );
    setFilteredLocations(filtered);
  }, [searchTerm, locations]);

  const [viewState, setViewState] = useState({
    longitude: 78.2571511,
    latitude: 17.7252584,
    zoom: 16,
    pitch: 0,
    bearing: 0
  });

  // Request User Geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        setLocationError('Unable to retrieve your location');
      }
    );
  }, []);

  // Sync selected location to view state
  useEffect(() => {
    if (selectedLocation) {
      setViewState(prev => ({
        ...prev,
        longitude: selectedLocation.longitude,
        latitude: selectedLocation.latitude,
        zoom: 18,
        transitionDuration: 1000
      }));
    }
  }, [selectedLocation]);
  
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

  // Determine Category based on Name
  const getCategory = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('lab') || lowerName.includes('computer')) return 'Lab';
    if (lowerName.includes('cafeteria') || lowerName.includes('canteen') || lowerName.includes('food')) return 'Cafeteria';
    if (lowerName.includes('ground') || lowerName.includes('sport') || lowerName.includes('gym')) return 'Sports';
    if (lowerName.includes('block') || lowerName.includes('building') || lowerName.includes('hall')) return 'Building';
    if (lowerName.includes('hostel')) return 'Hostel';
    if (lowerName.includes('campus')) return 'Campus';
    return 'Other';
  };

  const getCategoryDetails = (category) => {
    switch (category) {
      case 'Lab': return { icon: BookOpen, color: 'text-violet-600', bg: 'bg-violet-100' };
      case 'Cafeteria': return { icon: Coffee, color: 'text-orange-600', bg: 'bg-orange-100' };
      case 'Sports': return { icon: Dumbbell, color: 'text-green-600', bg: 'bg-green-100' };
      case 'Building': return { icon: Building, color: 'text-blue-600', bg: 'bg-blue-100' };
      default: return { icon: MapPin, color: 'text-slate-600', bg: 'bg-slate-100' };
    }
  };

  const openGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] bg-slate-50 w-full overflow-hidden">

      {/* Sidebar Navigation */}
      <div className="w-full md:w-80 bg-white shadow-xl z-20 flex flex-col shrink-0 border-r border-slate-200">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-blue-950 flex items-center mb-4">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" /> Campus Map
          </h2>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search locations, labs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium placeholder-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredLocations.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No locations found.</div>
          ) : (
            filteredLocations.map((loc) => {
              const name = loc.location_name || loc.name;
              const category = getCategory(name);
              const CatIcon = getCategoryDetails(category).icon;
              const isSelected = selectedLocation?.id === loc.id;

              return (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc)}
                  className={`w-full flex items-start p-3 rounded-xl transition-all text-left ${isSelected ? 'bg-blue-50 border border-blue-200 shadow-sm' : 'hover:bg-slate-50 border border-transparent'}`}
                >
                  <div className={`p-2 rounded-lg mr-3 ${getCategoryDetails(category).bg}`}>
                    <CatIcon className={`w-4 h-4 ${getCategoryDetails(category).color}`} />
                  </div>
                  <div className="flex-1 pr-2">
                    <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-blue-800' : 'text-slate-800'}`}>{name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">{loc.description}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* User Location Status bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs font-semibold flex items-center text-slate-600">
          {userLocation ? (
            <><div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div> Location Sync Active</>
          ) : locationError ? (
            <><div className="w-2 h-2 rounded-full bg-rose-500 mr-2"></div> {locationError}</>
          ) : (
            <><div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2"></div> Acquiring Location...</>
          )}
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative h-[50vh] md:h-full z-0">
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

          {filteredLocations.map(loc => {
            const name = loc.location_name || loc.name;
            const category = getCategory(name);

            return (
              <Marker
                key={`marker-${loc.id}`}
                longitude={loc.longitude}
                latitude={loc.latitude}
                anchor="bottom"
              >
                <CustomMarker 
                  category={category}
                  onClick={() => setSelectedLocation(loc)}
                />
              </Marker>
            )
          })}

          {selectedLocation && (
            <Popup
              anchor="top"
              longitude={Number(selectedLocation.longitude)}
              latitude={Number(selectedLocation.latitude)}
              onClose={() => setSelectedLocation(null)}
              className="z-[500]"
              closeOnClick={false}
            >
              <div className="p-1 min-w-[200px]">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`p-1.5 rounded-md ${getCategoryDetails(getCategory(selectedLocation.location_name || selectedLocation.name)).bg}`}>
                    {React.createElement(getCategoryDetails(getCategory(selectedLocation.location_name || selectedLocation.name)).icon, { className: `w-3 h-3 ${getCategoryDetails(getCategory(selectedLocation.location_name || selectedLocation.name)).color}` })}
                  </div>
                  <h3 className="font-bold text-[15px] text-slate-800 m-0">{selectedLocation.location_name || selectedLocation.name}</h3>
                </div>
                <p className="text-[13px] text-slate-600 mb-3 leading-snug">{selectedLocation.description}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); openGoogleMaps(selectedLocation.latitude, selectedLocation.longitude); }}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white text-[12px] font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  <Navigation2 className="w-3 h-3" />
                  <span>Open in Directions</span>
                </button>
              </div>
            </Popup>
          )}

          {userLocation && (
            <Marker longitude={userLocation[1]} latitude={userLocation[0]}>
              <div className="relative flex h-5 w-5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600 border-2 border-white shadow"></span>
              </div>
            </Marker>
          )}
        </Map>

        {/* Live Location Reset Floating Button */}
        {userLocation && (
          <button
            onClick={() => setSelectedLocation({ latitude: userLocation[0], longitude: userLocation[1] })}
            className="absolute bottom-6 right-6 z-[400] bg-white p-3 rounded-full shadow-lg border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition tooltip"
            title="Fly to My Location"
          >
            <Navigation className="w-5 h-5 fill-current opacity-70" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CampusMap;
