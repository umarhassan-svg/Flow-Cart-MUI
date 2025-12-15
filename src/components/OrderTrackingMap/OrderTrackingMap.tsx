/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useState } from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { startPollingLiveData, type Position } from "../../utils/getLiveData";

// 1. Import Polyline
import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";

const DEFAULT_ZOOM = 15;

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 33.6684722,
  lng: 72.9966856,
};

const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Options for the Polyline visual style
const polylineOptions = {
  strokeColor: "#1976d2", // Blue to match your marker fill
  strokeOpacity: 0.8,
  strokeWeight: 5,
  fillColor: "#1976d2",
  fillOpacity: 0.35,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
  radius: 30000,
  zIndex: 1,
};

interface OrderTrackingMapProps {
  trackingId?: string;
}

const OrderTrackingMap: React.FC<OrderTrackingMapProps> = ({ trackingId }) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: googleApiKey || "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [position, setPosition] = useState<Position | null>(null);

  // 2. Add state for the trail (path history)
  const [pathHistory, setPathHistory] = useState<Position[]>([]);

  const onLoad = useCallback(
    function callback(mapInstance: google.maps.Map) {
      mapInstance.setCenter(center);
      mapInstance.setZoom(DEFAULT_ZOOM);
      setMap(mapInstance);
    },
    [] // Removed [center] dependency to prevent re-centering loop if center obj changes
  );

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    rotateControl: false,
    scaleControl: false,
  };

  // Live Data
  useEffect(() => {
    if (!trackingId) return;

    // Reset path when ID changes
    setPathHistory([]);

    const stopPolling = startPollingLiveData(
      trackingId,
      (pos) => {
        setPosition(pos);

        // 3. Update Path History (Keep only last 20 points)
        setPathHistory((prevPath) => {
          const newPath = [...prevPath, pos];
          // If length > 20, slice to keep the last 20
          if (newPath.length > 100) {
            return newPath.slice(-100);
          }
          return newPath;
        });

        if (map) {
          map.panTo({ lat: pos.lat, lng: pos.lng });
        }
      },
      2000
    );

    return stopPolling;
  }, [trackingId, map]);

  return (
    <Card
      elevation={3}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: "400px",
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: "#e0e0e0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={DEFAULT_ZOOM}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={mapOptions}
          >
            {/* 4. Render the Polyline */}
            {pathHistory.length > 0 && (
              <Polyline path={pathHistory} options={polylineOptions} />
            )}

            {position && (
              <Marker
                position={{ lat: position.lat, lng: position.lng }}
                icon={
                  position.heading != null
                    ? ({
                        path: window.google.maps.SymbolPath
                          .FORWARD_CLOSED_ARROW,
                        scale: 5,
                        rotation: position.heading,
                        fillColor: "#1976d2",
                        fillOpacity: 1,
                        strokeWeight: 0,
                      } as google.maps.Symbol)
                    : ({
                        url: "/car-icon.png",
                        scaledSize: new window.google.maps.Size(40, 40),
                        anchor: new window.google.maps.Point(20, 20),
                      } as google.maps.Icon)
                }
              />
            )}
          </GoogleMap>
        ) : (
          <Typography variant="h6" color="text.secondary">
            [ Google Maps Live View ]
          </Typography>
        )}

        {trackingId && (
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              bottom: 10,
              right: 10,
              bgcolor: "rgba(255,255,255,0.8)",
              px: 1,
              borderRadius: 1,
            }}
          >
            ID: {trackingId}
          </Typography>
        )}
      </Box>

      <CardContent sx={{ borderTop: "1px solid #eee" }}>
        <Typography variant="h6">
          Logistics Partner: FlowCart Express
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vehicle: Delivery Van (FC-9982)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Current Location:{" "}
          {pathHistory.length > 0 ? "Tracking Active" : "Waiting for signal..."}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default OrderTrackingMap;
