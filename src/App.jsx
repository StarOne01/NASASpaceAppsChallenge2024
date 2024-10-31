import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import { csv } from 'd3-fetch';
import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';
import { Card, CardContent, CardHeader, CardTitle } from '../node_modules/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import 'leaflet/dist/leaflet.css';

// Placeholder data - replace with actual data loading logic
const crimeData = [
  { id: 1, type: 'Theft', lat: 40.7128, lng: -74.006, severity: 3 },
  { id: 2, type: 'Assault', lat: 40.7300, lng: -73.9950, severity: 5 },
  // ... more crime data
];

const publicPlacesData = [
  { id: 1, name: 'Central Park', type: 'Park', lat: 40.7829, lng: -73.9654 },
  { id: 2, name: 'Times Square', type: 'Plaza', lat: 40.7580, lng: -73.9855 },
  // ... more public places data
];

const crimeTypes = ['All', 'Theft', 'Assault', 'Burglary', 'Robbery'];
const placeTypes = ['All', 'Park', 'Plaza', 'Museum', 'Library'];

const colorScale = scaleLinear()
  .domain(extent(crimeData, d => d.severity))
  .range(['#ffeda0', '#f03b20']);

const App = () => {
  const [selectedCrimeType, setSelectedCrimeType] = useState('All');
  const [selectedPlaceType, setSelectedPlaceType] = useState('All');
  const [dateRange, setDateRange] = useState([new Date('2023-01-01'), new Date('2023-12-31')]);
  
  const filteredCrimes = crimeData.filter(crime => 
    (selectedCrimeType === 'All' || crime.type === selectedCrimeType)
  );

  const filteredPlaces = publicPlacesData.filter(place => 
    (selectedPlaceType === 'All' || place.type === selectedPlaceType)
  );

  const crimeStats = crimeTypes.slice(1).map(type => ({
    name: type,
    value: crimeData.filter(crime => crime.type === type).length
  }));

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold">NYC Crime and Public Places Map</h1>
      </header>
      <main className="flex-grow flex">
        <aside className="w-1/4 p-4 bg-gray-100 overflow-y-auto">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Crime Type</label>
                  <Select onValueChange={setSelectedCrimeType} defaultValue={selectedCrimeType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {crimeTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-2">Place Type</label>
                  <Select onValueChange={setSelectedPlaceType} defaultValue={selectedPlaceType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {placeTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-2">Date Range</label>
                  <Slider
                    defaultValue={[0, 100]}
                    max={100}
                    step={1}
                    onValueChange={(value) => {
                      const start = new Date('2023-01-01');
                      const end = new Date('2023-12-31');
                      const range = end.getTime() - start.getTime();
                      setDateRange([
                        new Date(start.getTime() + range * (value[0] / 100)),
                        new Date(start.getTime() + range * (value[1] / 100))
                      ]);
                    }}
                  />
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>{dateRange[0].toLocaleDateString()}</span>
                    <span>{dateRange[1].toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Crime Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={crimeStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {crimeStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colorScale(index / crimeStats.length)} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </aside>
        <section className="w-3/4 p-4">
          <MapContainer center={[40.7128, -74.0060]} zoom={11} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {filteredCrimes.map(crime => (
              <GeoJSON
                key={crime.id}
                data={{
                  type: 'Feature',
                  properties: crime,
                  geometry: {
                    type: 'Point',
                    coordinates: [crime.lng, crime.lat]
                  }
                }}
                pointToLayer={(feature, latlng) => L.circleMarker(latlng, {
                  radius: 8,
                  fillColor: colorScale(feature.properties.severity),
                  color: '#000',
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 0.8
                })}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">{crime.type}</h3>
                    <p>Severity: {crime.severity}</p>
                  </div>
                </Popup>
              </GeoJSON>
            ))}
            {filteredPlaces.map(place => (
              <GeoJSON
                key={place.id}
                data={{
                  type: 'Feature',
                  properties: place,
                  geometry: {
                    type: 'Point',
                    coordinates: [place.lng, place.lat]
                  }
                }}
                pointToLayer={(feature, latlng) => L.marker(latlng)}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">{place.name}</h3>
                    <p>Type: {place.type}</p>
                  </div>
                </Popup>
              </GeoJSON>
            ))}
          </MapContainer>
        </section>
      </main>
    </div>
  );
};

export default App;