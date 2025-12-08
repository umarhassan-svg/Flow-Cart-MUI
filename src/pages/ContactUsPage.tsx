// src/pages/ContactUs/ContactUsPage.tsx
import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Slide,
  useTheme,
  alpha,
  Container,
  Grid,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/EmailOutlined";
import SmartToyIcon from "@mui/icons-material/SmartToyOutlined";
import ContactForm from "../components/forms/ContactForm";
import ChatAIAgent from "../components/ChatAIAgent/ChatAIAgent";
import LayoutMain from "../components/layout/layoutMain";

const ContactUsPage: React.FC = () => {
  const theme = useTheme();
  const [mode, setMode] = useState<"form" | "chat">("form");

  const handleMode = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: "form" | "chat" | null
  ) => {
    if (newMode) setMode(newMode);
  };

  const toggleBtnSx = useMemo(() => ({
    border: "none",
    borderRadius: 0,
    px: 3,
    py: 1.5,
    textTransform: "none",
    fontWeight: 600,
    color: theme.palette.text.secondary,
    transition: "all 0.3s ease",
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
      border: 'none',
    },
    "&.Mui-selected": {
      backgroundColor: 'transparent',
      color: theme.palette.primary.main,
      borderBottom: `3px solid ${theme.palette.primary.main}`,
      borderLeft: 'none',
      borderRight: 'none',
      borderTop: 'none',
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: 'transparent',
      }
    },
  }), [theme]);

  const toggleGroupSx = {
    border: 'none',
    backgroundColor: 'transparent',
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRadius: 0,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    gap : 2,
  };

  return (
    <LayoutMain>
      <Box
        sx={{
          minHeight: "80vh",
          background: theme.palette.mode === 'light' 
            ? theme.palette.background.default 
            : theme.palette.background.paper,
          display: "flex",
          alignItems: "center",
            py: 1,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            
            {/* Left Column: Title & Description */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  textAlign: { xs: 'center', md: 'left' },
                }}
              >
                
                <Typography
                  variant="h2"
                  component="h1"
                  fontWeight="800"
                  sx={{
                    mb: 3,
                    background: `linear-gradient(135deg, ${theme.palette.text.primary} 30%, ${theme.palette.primary.main} 90%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2,
                  }}
                >
                  How can we help you?
                </Typography>
                
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ 
                    fontSize: '1.1rem',
                    lineHeight: 1.7,
                    maxWidth: { xs: '100%', md: 450 },
                    mx: { xs: 'auto', md: 0 }
                  }}
                >
                  Choose between instant AI-powered assistance or detailed support via email. 
                  We're here to help you get answers fast.
                </Typography>
              </Box>
            </Grid>

            {/* Right Column: Fixed Height Container with Toggle & Content */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                sx={{
                  
                  minHeight: 500,
                  maxHeight: 500,
                  bgcolor: theme.palette.background.paper,
                  borderRadius: 3,
                  boxShadow: theme.shadows[8],
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  
                }}
              >
                {/* Toggle Tabs - Fixed at Top */}
                <Box 
                  sx={{ 
                    flexShrink: 0,
                    px: 3,
                    py: 1,
                    width: '100%',
                    
                  }}
                    
                >
                  <ToggleButtonGroup
                    value={mode}
                    exclusive
                    onChange={handleMode}
                    aria-label="contact mode"
                    sx={toggleGroupSx}
                  >
                    <ToggleButton value="form" sx={toggleBtnSx}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon fontSize="small" />
                        <span>Email Support</span>
                      </Box>
                    </ToggleButton>
                    
                    <ToggleButton value="chat" sx={toggleBtnSx}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <SmartToyIcon fontSize="small" />
                        <span>Live AI Chat</span>
                      </Box>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {/* Content Area - Fills Remaining Space */}
                <Box 
                  sx={{ 
                    flexGrow: 1,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Contact Form Slide */}
                  <Slide 
                    direction="right" 
                    in={mode === "form"} 
                    mountOnEnter 
                    unmountOnExit 
                    timeout={400}
                  >
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      <ContactForm />
                    </Box>
                  </Slide>

                  {/* Chat Agent Slide */}
                  <Slide 
                    direction="left" 
                    in={mode === "chat"} 
                    mountOnEnter 
                    unmountOnExit 
                    timeout={400}
                  >
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      <ChatAIAgent />
                    </Box>
                  </Slide>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </LayoutMain>
  );
};

export default ContactUsPage;