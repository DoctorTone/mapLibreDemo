import React, { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "../css/map.css";

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng] = useState(1.1);
  const [lat] = useState(52.9);
  const [zoom] = useState(14);
  const [API_KEY] = useState("p47xAmvxV6awt2xre9CN");
  const [mapType, setMapType] = useState("topographic");

  const handleMapTypeChange = (type) => {
    setMapType(type);
  };

  // Function to get style URL based on map type
  const getStyleUrl = (type) => {
    switch (type) {
      case "topographic":
        return "https://api.maptiler.com/maps/basic-v2/style.json?key=p47xAmvxV6awt2xre9CN";
      case "satellite":
        return "https://api.maptiler.com/maps/satellite/style.json?key=p47xAmvxV6awt2xre9CN";
      case "3Dbuildings":
        return "https://api.maptiler.com/maps/e3502d9d-91d8-41e3-ab8d-de7965bc0fde/style.json?key=p47xAmvxV6awt2xre9CN";
      case "Terrain":
        return "https://api.maptiler.com/maps/winter-v2/style.json?key=p47xAmvxV6awt2xre9CN";
      default:
        return "https://api.maptiler.com/maps/basic-v2/style.json?key=p47xAmvxV6awt2xre9CN";
    }
  };

  useEffect(() => {
    if (map.current) {
      map.current.setStyle(getStyleUrl(mapType));
      return;
    }

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: getStyleUrl(mapType), // Map style based on the current map type
      center: [lng, lat],
      zoom: zoom,
    });
  }, [mapType]);

  return (
    <>
      <div id="mapOptions">
        <select onChange={(e) => handleMapTypeChange(e.target.value)}>
          <option value="topographic">Topographic Map</option>
          <option value="satellite">Satellite Map</option>
          <option value="3Dbuildings">3D Building Map</option>
          <option value="Terrain">Terrain Map</option>
        </select>
      </div>
      <div className="map-wrap">
        <div ref={mapContainer} className="map" />
      </div>
    </>
  );
}
