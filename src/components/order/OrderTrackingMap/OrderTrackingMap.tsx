/* eslint-disable react-hooks/set-state-in-effect */
// OrderTrackingMap_responsive.tsx

import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
  IconButton,
  Divider,
  Grid,
} from "@mui/material";
import {
  startPollingLiveData,
  type Position,
} from "../../../utils/getLiveData";
import {
  GoogleMap,
  OverlayView,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";

import { FaPhone, FaRoute, FaTruck, FaUser } from "react-icons/fa";
import CloseIcon from "@mui/icons-material/Close";

const DEFAULT_ZOOM = 15;
// This is the ideal shift at Zoom 15 to clear the popup
const BASE_LAT_SHIFT = 0.0025;

const defaultCenter = { lat: 33.6684722, lng: 72.9966856 };
const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const polylineOptions: google.maps.PolylineOptions = {
  strokeColor: "#1976d2",
  strokeOpacity: 0.8,
  strokeWeight: 5,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
  zIndex: 1,
};

interface OrderTrackingMapProps {
  trackingId?: string | null;
}

export const OrderTrackingMap: React.FC<OrderTrackingMapProps> = ({
  trackingId,
}) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: googleApiKey || "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [pathHistory, setPathHistory] = useState<Position[]>([]);
  const [popupOpen, setPopupOpen] = useState(false);

  // Track current zoom to calculate shift
  const [currentZoom, setCurrentZoom] = useState(DEFAULT_ZOOM);
  const [mapCenter] = useState(defaultCenter);

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const mapContainerStyle = {
    width: "100%",
    height: isSmall ? "320px" : "100%",
    minHeight: isSmall ? 320 : undefined,
  } as const;

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    mapInstance.setCenter(defaultCenter);
    mapInstance.setZoom(DEFAULT_ZOOM);
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => setMap(null), []);

  // Helper: Calculate shift based on zoom level
  // As zoom increases (zooming in), the required shift decreases.
  const getDynamicShift = (zoom: number) => {
    return BASE_LAT_SHIFT * Math.pow(2, DEFAULT_ZOOM - zoom);
  };

  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    rotateControl: false,
    scaleControl: false,
  };

  // 1. DATA POLLING
  useEffect(() => {
    if (!trackingId) return;
    setPathHistory([]);

    const stopPolling = startPollingLiveData(
      trackingId,
      (pos) => {
        setPosition(pos);
        setPathHistory((prev) => {
          const newPath = [...prev, pos];
          return newPath.length > 100 ? newPath.slice(-100) : newPath;
        });
      },
      2000
    );

    return stopPolling;
  }, [trackingId]);

  // 2. MAP MOVEMENT & CENTERING LOGIC
  useEffect(() => {
    if (map && position) {
      let targetLat = position.lat;

      if (popupOpen) {
        // Calculate shift dynamically based on current zoom
        const shift = getDynamicShift(currentZoom);
        targetLat = position.lat + shift;
      }

      map.panTo({ lat: targetLat, lng: position.lng });
    }
  }, [map, position, popupOpen, currentZoom]);

  const polylinePath: google.maps.LatLngLiteral[] = pathHistory.map((p) => ({
    lat: p.lat,
    lng: p.lng,
  }));

  return (
    <Card
      elevation={3}
      sx={{
        height: { xs: "auto", md: "100%" },
        display: "flex",
        flexDirection: "column",
        minHeight: 320,
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: "#e0e0e0",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
          position: "relative",
          width: "100%",
          height: { xs: mapContainerStyle.height, md: "100%" },
        }}
      >
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={DEFAULT_ZOOM}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={mapOptions}
            // Capture Zoom Changes
            onZoomChanged={() => {
              if (map) {
                setCurrentZoom(map.getZoom() || DEFAULT_ZOOM);
              }
            }}
          >
            {polylinePath.length > 0 && (
              <Polyline path={polylinePath} options={polylineOptions} />
            )}

            {position && (
              <OverlayView
                position={{ lat: position.lat, lng: position.lng }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div
                  style={{
                    position: "relative",
                    transform: "translate(-50%, -50%)",
                    width: "0px",
                    height: "0px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {/* --- POPUP --- */}
                  {popupOpen && (
                    <Paper
                      elevation={4}
                      sx={{
                        position: "absolute",
                        bottom: "45px",
                        minWidth: "260px",
                        p: 2,
                        borderRadius: 2,
                        zIndex: 1000,
                        cursor: "default",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          color="primary"
                        >
                          Vehicle Details
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPopupOpen(false);
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      <Divider sx={{ mb: 1.5 }} />

                      <Grid container spacing={1}>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="body2">
                            <strong>Type:</strong> Heavy Freight Truck
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="body2">
                            <strong>Model:</strong> Volvo FH16
                          </Typography>
                        </Grid>

                        <Grid
                          size={{ xs: 12 }}
                          display="flex"
                          alignItems="center"
                          gap={1}
                        >
                          <FaUser size={12} color="#666" />
                          <Typography variant="body2">
                            <strong>Driver:</strong> John Doe
                          </Typography>
                        </Grid>

                        <Grid
                          size={{ xs: 12 }}
                          display="flex"
                          alignItems="center"
                          gap={1}
                        >
                          <FaRoute size={12} color="#666" />
                          <Typography variant="body2">
                            <strong>Route:</strong> NYC to Boston (I-95)
                          </Typography>
                        </Grid>

                        <Grid
                          size={{ xs: 12 }}
                          display="flex"
                          alignItems="center"
                          gap={1}
                          mt={0.5}
                        >
                          <Box
                            bgcolor="#e3f2fd"
                            p={0.5}
                            borderRadius={1}
                            display="flex"
                            alignItems="center"
                            gap={1}
                            width="100%"
                          >
                            <FaPhone size={12} color="#1976d2" />
                            <Typography
                              variant="caption"
                              fontWeight="bold"
                              color="primary"
                            >
                              +1 (555) 019-2834
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <div
                        style={{
                          position: "absolute",
                          bottom: "-8px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 0,
                          height: 0,
                          borderLeft: "8px solid transparent",
                          borderRight: "8px solid transparent",
                          borderTop: "8px solid white",
                        }}
                      />
                    </Paper>
                  )}

                  {/* --- TRUCK ICON --- */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setPopupOpen(!popupOpen);
                    }}
                    style={{
                      transform: `rotate(${
                        (position.heading as number) - 90 || 0
                      }deg)`,
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <FaTruck size={40} color="#faab00ff" />
                  </div>
                </div>
              </OverlayView>
            )}
          </GoogleMap>
        ) : (
          <Typography variant="h6" color="text.secondary" sx={{ p: 2 }}>
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
              bgcolor: "rgba(255,255,255,0.9)",
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
