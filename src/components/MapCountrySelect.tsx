import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'motion/react';
import { audioManager } from '../audio';

interface MapCountrySelectProps {
  targetCountry: string;
  mapCenter?: { lat: number; lng: number };
  mapZoom?: number;
  onSelect: (countryId: string) => void;
  disabled?: boolean;
}

// Ensure the map resizes nicely
const MapUpdater = ({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom, { animate: true });
    map.invalidateSize();
  }, [center, zoom, map]);
  return null;
};

export function MapCountrySelect({ targetCountry, mapCenter, mapZoom, onSelect, disabled }: MapCountrySelectProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGeo, setSelectedGeo] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
      .then(r => r.json())
      .then(data => {
        setGeoData(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const center = mapCenter || { lat: 48.8566, lng: 2.3522 }; // default to Europe
  const zoom = mapZoom || 4;

  const styleFeature = (feature: any) => {
    const isTarget = selectedGeo === feature.properties.name;
    return {
      fillColor: disabled && feature.properties.name === targetCountry ? '#5CB85C' : (isTarget ? '#C16757' : 'transparent'),
      weight: 2,
      opacity: 1,
      color: '#E0E0E0', 
      dashArray: '3',
      fillOpacity: disabled && feature.properties.name === targetCountry ? 0.6 : (isTarget ? 0.6 : 0.0) // transparent unless selected or revealing
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    layer.on({
      mouseover: (e: any) => {
        if (!disabled && selectedGeo !== feature.properties.name) {
          const l = e.target;
          l.setStyle({
            weight: 3,
            color: '#D4A373',
            fillOpacity: 0.3
          });
          l.bringToFront();
        }
      },
      mouseout: (e: any) => {
        if (!disabled) {
          // Reset style
          const l = e.target;
          l.setStyle(styleFeature(feature));
        }
      },
      click: (e: any) => {
        if (!disabled) {
          audioManager.playSfx('click');
          setSelectedGeo(feature.properties.name);
        }
      }
    });
  };

  return (
    <div className="relative w-full flex-1 min-h-0 h-full rounded-xl overflow-hidden border-4 border-[#2D2D2D] shadow-[8px_8px_0px_#2D2D2D] bg-[#AEC6C2]">
      {loading ? (
         <div className="absolute inset-0 flex items-center justify-center font-black uppercase text-2xl text-white drop-shadow-md z-[1001]">
            Loading map...
         </div>
      ) : (
        <MapContainer center={[center.lat, center.lng]} zoom={zoom} scrollWheelZoom={false} className="w-full h-full cursor-crosshair">
          <MapUpdater center={center} zoom={zoom} />
          {/* Base Map Tiles */}
          <TileLayer
             url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {/* Interactive GeoJSON */}
          {geoData && (
             <GeoJSON 
               key="world"
               data={geoData} 
               style={styleFeature}
               onEachFeature={onEachFeature}
             />
          )}
        </MapContainer>
      )}

      {/* Target hint overlay */}
      {!disabled && (
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-4 left-0 right-0 mx-auto w-max z-[1000] bg-white/90 px-6 py-3 border-4 border-[#2D2D2D] shadow-[4px_4px_0px_#2D2D2D] rounded-full pointer-events-none text-center"
        >
          <span className="font-bold text-gray-500 mr-2 uppercase tracking-widest text-sm block md:inline">Find</span>
          <span className="font-black text-[#2D2D2D] text-xl uppercase tracking-tighter block md:inline">{targetCountry}</span>
        </motion.div>
      )}

      {/* Help Tooltip */}
      {showTooltip && !disabled && (
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="absolute top-24 left-0 right-0 mx-auto w-[90%] max-w-sm z-[1000] bg-[#FFF9C4] border-4 border-[#2D2D2D] rounded-2xl p-4 shadow-[4px_4px_0_#2D2D2D] flex flex-col gap-2 pointer-events-auto"
        >
           <p className="font-black text-[#2D2D2D] uppercase tracking-wide text-center">
              Tap on the map to place a pin on the correct country!
           </p>
           <button
              onClick={(e) => {
                 e.stopPropagation();
                 audioManager.playSfx('click');
                 setShowTooltip(false);
              }}
              className="mt-2 bg-[#2D2D2D] text-white font-bold py-2 rounded-lg hover:bg-black uppercase tracking-widest text-xs"
           >
              Got it!
           </button>
        </motion.div>
      )}

      {!disabled && selectedGeo && (
         <motion.div
           initial={{ y: 50, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="absolute bottom-4 left-0 right-0 z-[1000] flex justify-center px-4"
         >
           <button
             onClick={() => onSelect(selectedGeo)}
             className="w-full max-w-sm bg-[#C16757] text-white border-4 border-[#2D2D2D] shadow-[4px_4px_0_#2D2D2D] py-3 rounded-xl font-black text-xl hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all uppercase"
           >
             Confirm: {selectedGeo}
           </button>
         </motion.div>
      )}
    </div>
  );
}
