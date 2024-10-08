
import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Rectangle, useMap, FeatureGroup } from 'react-leaflet';
import { useParams, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import * as ReactLeafletDraw from 'react-leaflet-draw';
import LoadingOverlay from '../Loading/LoadingOverlay';
import styled from 'styled-components';

const MapWrapper = styled.div`
  height: 500px;
  width: 100%;
  z-index: 0;
`;

const Banner = styled.h1`
  text-align: center;
  color: #4CAF50;
`;

const CoordinateInput = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 10px;
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
`;

const ButtonContainer = styled.div`
  margin: 20px 20px;

    display: flex;
  justify-content: center; /* Center horizontally */
  align-items: center;     /* Center vertically */
`;

const MapEventHandler = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const FarmSelectionMap = () => {
  const { stateName } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [boundingBox, setBoundingBox] = useState(null);

  const [chartInfo, setChartInfo] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log(boundingBox, "boundingBox")
  const handleCreated = async (e) => {
    const { layer } = e;
    if (layer instanceof L.Rectangle) {
      setBoundingBox(layer.getBounds());
      const bounds = layer.getBounds()
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      console.log('Selected Area:');
      console.log('Southwest:', sw.lat, sw.lng);
      console.log('Northeast:', ne.lat, ne.lng);

      setLatitude((sw.lat + ne.lat)/2)
      setLongitude((sw.lng + ne.lng)/2)
    }
  };

  // useEffect(() => {
  //   if(chartInfo) {
  //     navigate(`/farm-view/${stateName}`, {
  //       state: {
  //         // north: _northEast.lat,
  //         // south: _southWest.lat,
  //         // east: _northEast.lng,
  //         // west: _southWest.lng,
  //         latitude: latitude,
  //         longitude: longitude,
  //         data: chartInfo
  //       }
  //     });
  //   }
  // }, [chartInfo])

  const handleViewFarm = async () => {
    if (boundingBox) {
      const { _northEast, _southWest } = boundingBox;
      try {
        setLoading(true);

        const data = await fetch('http://localhost:8000/api/location-input/', {
          method: 'POST',
          credentials: 'include',

          headers: {
            'Content-Type': 'application/json',

            // Add any other headers you need
          },
          body: JSON.stringify({
            // Your data goes here
            latitude: latitude,
            longitude: longitude,
            area: 2
          })
        }).then(response => response.json())
        console.log("Data", data)
        // setChartInfo(data);
        setLoading(false);
        navigate(`/farm-view/${stateName}`, {
          state: {
            // north: _northEast.lat,
            // south: _southWest.lat,
            // east: _northEast.lng,
            // west: _southWest.lng,
            latitude: latitude,
            longitude: longitude,
            data: data
          }});
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }

     
    }
  };

  // State center coordinates
  const stateCenters = {
    'California': [36.7783, -119.4179],
    'Texas': [31.9686, -99.9018],
    'New York': [42.1657, -74.9481],
    'Illinois': [40.0417, -89.1965],
    // Add more states as needed
  };

  const center = stateCenters[stateName] || [39.8283, -98.5795]; // Default to US center if state not found
  const zoom = 5.5;

  const [marker, setMarker] = useState(center);
  const [inputLat, setInputLat] = useState('');
  const [inputLng, setInputLng] = useState('');

  const handleMapClick = (e) => {
    setMarker(e.latlng);
  };

  const handleGoToLocation = () => {
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      const newCenter = [lat, lng];
      setMarker(L.latLng(lat, lng));
      mapRef.current.setView(newCenter, zoom);
    }
  };

return (
    <div>
            <LoadingOverlay isLoading={loading} />

      <Banner>Select your farm in {stateName}</Banner>
      <MapWrapper>
        
        <MapContainer 
          center={center}
          zoom={zoom} 
          style={{ height: '100%', width: '100%' }}
          whenCreated={mapInstance => { mapRef.current = mapInstance; }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <FeatureGroup>
          <ReactLeafletDraw.EditControl
            position="topright"
            onCreated={handleCreated}
            draw={{
              rectangle: true,
              polygon: false,
              polyline: false,
              circle: false,
              marker: false,
              circlemarker: false,
            }}
          />
          {boundingBox && <Rectangle bounds={boundingBox} />}
          </FeatureGroup>

          {/* <MapEventHandler center={center} zoom={zoom} /> */}
        </MapContainer>
      </MapWrapper>
      <ButtonContainer>
        <Button onClick={handleViewFarm} disabled={!boundingBox}>View Farm</Button>
      </ButtonContainer>
    </div>
  );
};


export default FarmSelectionMap;