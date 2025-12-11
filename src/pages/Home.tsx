import HeroSection from "../components/home_components/HeroSection/HeroSection";
import LayoutMain from "../components/layout/layoutMain";
import SlidingReviews from "../components/home_components/SlidingReviews/SlidingReviews";
import SecuritySection from "../components/home_components/SecuritySection/SecuritySection";
// import { Box, Button, Grid, Stack, Typography } from "@mui/material";

const Home = () => {
  return (
    <>
      <LayoutMain>
        <HeroSection />
        {/* Additional home page sections can be added here */}
        {/* Reviews*/}
        <SlidingReviews />
        <SecuritySection />
      </LayoutMain>
    </>
  );
};

export default Home;
