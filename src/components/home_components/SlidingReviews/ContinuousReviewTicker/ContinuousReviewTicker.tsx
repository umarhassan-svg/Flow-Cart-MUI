/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Box, Rating, Stack, Typography } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "./ContinuousReviewTicker.css";
/* Review card */
const ReviewCard = ({
  rating,
  message,
  customername,
}: {
  rating: number;
  message: string;
  customername: string;
}) => (
  <Box
    sx={{
      width: "100%",
      height: 200, // Fixed height for consistency
      backgroundColor: "white",
      borderRadius: 4,
      padding: 3,
      boxSizing: "border-box",
      boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    <Stack direction="column" spacing={1}>
      <Rating name="read-only" value={rating} precision={0.5} readOnly />
      <Typography
        variant="body1"
        sx={{ mt: 1, fontWeight: 500, fontSize: "0.95rem" }}
      >
        "{message}"
      </Typography>
    </Stack>

    <Typography
      variant="subtitle2"
      sx={{ mt: 2, fontWeight: 700, color: "text.secondary" }}
    >
      - {customername}
    </Typography>
  </Box>
);

const reviewList = [
  { rating: 5, message: "Great product!", customername: "John Doe" },
  { rating: 5, message: "Absolutely loved it!", customername: "Jane Smith" },
  { rating: 5, message: "Exceeded my expectations!", customername: "Alice J." },
  { rating: 5, message: "Fantastic quality!", customername: "Robert B." },
  { rating: 5, message: "Will buy again for sure!", customername: "Emily D." },
  { rating: 5, message: "Superb! Worth every penny.", customername: "Mike W." },
];

const ContinuousReviewTicker: React.FC = () => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        py: 4,
        overflow: "hidden",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "100%" }}>
        {/* CSS for Responsive Slide Widths */}
        <style>{`
          .myContinuousSwiper .swiper-wrapper {
            transition-timing-function: linear !important;
            align-items: center;
          }
          .myContinuousSwiper .swiper-slide {
             box-sizing: border-box;
             display: flex;
             justify-content: center;
          }
          
          /* Mobile: 1 card (85% width) */
          @media (max-width: 899px) {
            .myContinuousSwiper .swiper-slide {
              width: 85% !important; 
              flex: 0 0 85% !important;
            }
          }

          /* Desktop: 3 cards (33% width) */
          @media (min-width: 900px) {
            .myContinuousSwiper .swiper-slide {
              width: 30% !important;
              flex: 0 0 30% !important;
            }
          }
        `}</style>

        <Swiper
          className="myContinuousSwiper"
          modules={[Autoplay, FreeMode]}
          slidesPerView="auto" // Handled by CSS
          spaceBetween={20}
          loop={true}
          speed={6000} // Speed of the scrolling
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          allowTouchMove={true}
        >
          {/* Render List Twice for seamless loop */}
          {[...reviewList, ...reviewList].map((r, idx) => (
            <SwiperSlide key={idx}>
              <Box sx={{ width: "100%", px: 1 }}>
                <ReviewCard
                  rating={r.rating}
                  message={r.message}
                  customername={r.customername}
                />
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Box>
  );
};

export default ContinuousReviewTicker;
