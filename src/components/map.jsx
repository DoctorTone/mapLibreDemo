import React, { useRef, useEffect, useState } from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import "@babylonjs/materials";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "../css/map.css";

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const LONG = 148.9819;
  const LAT = -35.3981;
  const ZOOM = 18;
  const PINCH = 60;
  const API_KEY = "p47xAmvxV6awt2xre9CN";
  const [mapType, setMapType] = useState("topographic");

  // World matrix parameters
  const worldOrigin = [LONG, LAT];
  const worldAltitude = 0;

  // Maplibre.js default coordinate system (no rotations)
  // +x east, -y north, +z up
  //var worldRotate = [0, 0, 0];

  // Babylon.js default coordinate system
  // +x east, +y up, +z north
  const worldRotate = [Math.PI / 2, 0, 0];

  // Calculate mercator coordinates and scale
  const worldOriginMercator = maplibregl.MercatorCoordinate.fromLngLat(
    worldOrigin,
    worldAltitude
  );
  const worldScale = worldOriginMercator.meterInMercatorCoordinateUnits();

  // Calculate world matrix
  const worldMatrix = BABYLON.Matrix.Compose(
    new BABYLON.Vector3(worldScale, worldScale, worldScale),
    BABYLON.Quaternion.FromEulerAngles(
      worldRotate[0],
      worldRotate[1],
      worldRotate[2]
    ),
    new BABYLON.Vector3(
      worldOriginMercator.x,
      worldOriginMercator.y,
      worldOriginMercator.z
    )
  );

  const handleMapTypeChange = (type) => {
    setMapType(type);
  };

  // Function to get style URL based on map type
  const getStyleUrl = (type) => {
    switch (type) {
      case "topographic":
        return `https://api.maptiler.com/maps/basic-v2/style.json?key=${API_KEY}`;
      case "satellite":
        return `https://api.maptiler.com/maps/satellite/style.json?key=${API_KEY}`;
      case "3Dbuildings":
        return `https://api.maptiler.com/maps/e3502d9d-91d8-41e3-ab8d-de7965bc0fde/style.json?key=${API_KEY}`;
      case "Terrain":
        return `https://api.maptiler.com/maps/winter-v2/style.json?key=${API_KEY}`;
      default:
        return `https://api.maptiler.com/maps/basic-v2/style.json?key=${API_KEY}`;
    }
  };

  // configuration of the custom layer for a 3D model per the CustomLayerInterface
  const customLayer = {
    id: "3d-model",
    type: "custom",
    renderingMode: "3d",
    onAdd(map, gl) {
      this.engine = new BABYLON.Engine(
        gl,
        true,
        {
          useHighPrecisionMatrix: true, // Important to prevent jitter at mercator scale
        },
        true
      );
      this.scene = new BABYLON.Scene(this.engine);
      this.scene.autoClear = false;
      this.scene.detachControl();

      this.scene.beforeRender = () => {
        this.engine.wipeCaches(true);
      };

      // create simple camera (will have its project matrix manually calculated)
      this.camera = new BABYLON.Camera(
        "Camera",
        new BABYLON.Vector3(0, 0, 0),
        this.scene
      );

      // create simple light
      const light = new BABYLON.HemisphericLight(
        "light1",
        new BABYLON.Vector3(0, 0, 100),
        this.scene
      );
      light.intensity = 0.7;

      // Add debug axes viewer, positioned at origin, 10 meter axis lengths
      new BABYLON.AxesViewer(this.scene, 10);

      // load GLTF model in to the scene
      BABYLON.SceneLoader.LoadAssetContainerAsync(
        "https://maplibre.org/maplibre-gl-js/docs/assets/34M_17/34M_17.gltf",
        "",
        this.scene
      ).then((modelContainer) => {
        modelContainer.addAllToScene();

        const rootMesh = modelContainer.createRootMesh();

        // If using maplibre.js coordinate system (+z up)
        //rootMesh.rotation.x = Math.PI/2

        // Create a second mesh
        const rootMesh2 = rootMesh.clone();

        // Position in babylon.js coordinate system
        rootMesh2.position.x = 25; // +east, meters
        rootMesh2.position.z = 25; // +north, meters
      });

      this.map = map;
    },
    render(gl, matrix) {
      const cameraMatrix = BABYLON.Matrix.FromArray(matrix);

      // world-view-projection matrix
      const wvpMatrix = worldMatrix.multiply(cameraMatrix);

      this.camera.freezeProjectionMatrix(wvpMatrix);

      this.scene.render(false);
      this.map.triggerRepaint();
    },
  };

  useEffect(() => {
    if (map.current) {
      // Set any other attributes that need changing here
      map.current.setStyle(getStyleUrl(mapType));
      return;
    }

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: getStyleUrl(mapType), // Map style based on the current map type
      center: [LONG, LAT], // Example center coordinates
      zoom: ZOOM,
      pinch: PINCH,
    });

    map.current.on("style.load", () => {
      map.current.addLayer(customLayer);
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
