import { Container, Stack, Typography, Tabs, Tab, Box } from "@mui/material";
import LayoutMain from "../components/layout/layoutMain";
import EmployeesOverView from "../components/user/EmployeesOverView/EmployeesOverView";
import { useState } from "react";

const ProfilePage = () => {
  const [tab, setTab] = useState(0);

  return (
    <LayoutMain>
      <Container
        sx={{ px: { xs: 3, sm: 2, md: 0 }, py: { xs: 3, sm: 2, md: 0 } }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ py: 3 }} // better vertical spacing
        >
          <Typography
            variant="h2"
            component="h1"
            fontWeight="bold"
            sx={{ mb: 0 }}
          >
            Employees
          </Typography>

          {/* <Button variant="contained" color="primary" startIcon={<EmailIcon />}>
            Add New Employee
          </Button> */}
        </Stack>

        {/* Small Nav Below Header */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons={false}
          >
            <Tab label="Overview" />
          </Tabs>
        </Box>

        {/* Content (optional example) */}
        {tab === 0 && <EmployeesOverView />}
      </Container>
    </LayoutMain>
  );
};

export default ProfilePage;
