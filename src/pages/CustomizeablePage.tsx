import { Box, Typography } from "@mui/material";

const CusomizeableLayout  = () => {
    return (
      <Box sx={{ p: 4 , textAlign: 'center' }}>
            <Typography variant="h1" gutterBottom>
                This is a Customizeable Page
            </Typography>
            <Typography variant="body1">
                You can customize this page as per your requirements.
            </Typography>
            </Box>
    )
};

export default CusomizeableLayout ;