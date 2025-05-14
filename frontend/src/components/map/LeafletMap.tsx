import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../map/defaultIcon';

interface ComplaintLocation {
  id: string;
  latitude: number;
  longitude: number;
  status: string;
  category: string;
}

interface LeafletMapProps {
  locations: ComplaintLocation[];
  height?: string;
}

const LeafletMap = ({ locations, height = '400px'  }: LeafletMapProps) => {
  const calculateCenter = () => {
    if (!locations.length) return [20, 0]; 
    
    const sumLat = locations.reduce((sum, loc) => sum + loc.latitude, 0);
    const sumLng = locations.reduce((sum, loc) => sum + loc.longitude, 0);
    
    return [sumLat / locations.length, sumLng / locations.length];
  };

  const center = calculateCenter();
  const zoom = locations.length ? 5 : 2;

  const getMarkerIcon = (status: string) => {
    const iconUrl = status === 'resolved' ? '/resolved-marker.png' : 
                     status === 'in-progress' ? '/in-progress-marker.png' : 
                     '/marker-icon.png';
                     
    return L.icon({
      iconUrl: '/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: '/marker-shadow.png',
      shadowSize: [41, 41]
    });
  };

  return (
    <MapContainer 
      center={center as [number, number]} 
      zoom={zoom} 
      style={{ height, width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {locations.map(location => (
        <Marker
          key={location.id}
          position={[location.latitude, location.longitude]}
          icon={getMarkerIcon(location.status)}
        >
          <Popup>
            <div className="text-sm">
              <p><strong>Status:</strong> {location.status}</p>
              <p><strong>Category:</strong> {location.category}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LeafletMap;
