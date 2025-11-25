import React, { useState, useEffect } from "react";
import {
  Avatar,
  Grid,
  Stack,
  Typography,
  Box,
  Divider,
  Chip,
  CircularProgress,
  Button, // Added for loading state
} from "@mui/material";
import {
  CalendarMonth,
  Email,
  Event,
  Group,
  Home,
  MapOutlined,
  PermIdentity,
  Phone,
  Public,
  Work, // New icon for Job Title/Dept
  SupervisorAccount,
} from "@mui/icons-material";
import { useAuth } from "../../../context/AuthContext";
// Import the mock service functions
import {
  fetchEmployeeProfile,
  fetchColleagues,
} from "../../../services/employees.service"; // Adjust path as needed
import type { Employee } from "../../../types/Employee";
import OpenPDFDialogBox from "../../admin/OpenPDFDialogBox/OpenPDFDialogBox";
import usersService from "../../../services/users.service";
// Helper function from your original code (retained)
const renderRow = (
  icon: React.ReactNode,
  label: string,
  content: React.ReactNode
) => (
  <Stack
    direction="row"
    spacing={1.5}
    alignItems="flex-start"
    sx={{ minHeight: 24 }}
  >
    <Box
      sx={{
        color: "action.active",
        display: "flex",
        pt: 0.3,
        "& svg": { fontSize: 18 },
      }}
    >
      {icon}
    </Box>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ minWidth: 70, pt: 0.5, fontWeight: 500 }}
    >
      {label}
    </Typography>
    <Box sx={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
      {typeof content === "string" ? (
        <Typography variant="body2" color="text.primary" fontWeight={500}>
          {content}
        </Typography>
      ) : (
        content
      )}
    </Box>
  </Stack>
);

const EmployeesOverView = () => {
  const { user } = useAuth(); // Assumed user object has at least { id, name, email }
  const [employeeData, setEmployeeData] = useState<Employee | null>(null);
  const [colleagues, setColleagues] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const employeeId = user?.id || "u2"; // Default to u2 (Sarah Manager) for display if user is null
  // required states (add near other useState declarations in ManageUser)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch main profile data
        const profile: Employee = await fetchEmployeeProfile(employeeId);
        setEmployeeData(profile);

        // Fetch colleagues for the second section
        const team: Employee[] = await fetchColleagues(employeeId);
        setColleagues(team);
      } catch (error) {
        console.error("Failed to fetch employee data:", error);
        setEmployeeData(null);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [employeeId]);

  if (loading) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!employeeData) {
    return (
      <Typography color="error" sx={{ p: 4 }}>
        Error loading employee profile.
      </Typography>
    );
  }

  function handleColleagueClick(colleague: Employee): void {
    // Handle colleague click here
    console.log(`Clicked on colleague: ${colleague.name}`);
    setEmployeeData(colleague);
  }

  // implement handler
  function handleEmployeeCard(
    id: string
  ): React.MouseEventHandler<HTMLButtonElement> | undefined {
    if (!id) return undefined;

    return async (e) => {
      e.stopPropagation();
      setPreviewLoading(true);
      try {
        // try fetching a stored server URL for this user's employee card
        const url = await usersService.getEmployeeCardUrl(id);
        if (!url) {
          alert("No employee card available for this user.");
          return;
        }

        // if the url is relative (e.g. "/api/..."), we can use it directly in iframe.
        // If you want a full absolute URL: const full = `${window.location.origin}${url}`;
        setPdfUrl(url);
        setPdfDialogOpen(true);
      } catch (err) {
        console.error("Failed to load employee card:", err);
        alert("Failed to load employee card.");
      } finally {
        setPreviewLoading(false);
      }
    };
  }

  return (
    <>
      <Box sx={{ p: 1 }}>
        <Grid container spacing={2}>
          {/* ==== SECTION 1: Profile Details (Left Sidebar) ==== */}
          <Grid
            size={{ xs: 12, md: 6, lg: 4 }} // Changed 'size' to 'item' and standard MUI breakpoints
            sx={{
              borderRight: { md: "1px solid" },
              borderColor: "divider",
              pr: { md: 2 },
            }}
          >
            <Stack spacing={2.5}>
              {/* 1. Avatar + Name Header */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={employeeData.avatar}
                  sx={{ width: 56, height: 56, boxShadow: 1 }}
                />
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    lineHeight={1.2}
                  >
                    {employeeData.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {employeeData.jobTitle}
                  </Typography>
                </Box>
              </Stack>

              <Button
                size="small"
                onClick={handleEmployeeCard(employeeData?.id ?? "")}
                disabled={!employeeData?.id || previewLoading}
              >
                {previewLoading ? "Loading..." : "View Card"}
              </Button>

              <Divider />

              {/* 2. Contact Section */}
              <Box>
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color="text.primary"
                  sx={{ mb: 1, display: "block", textTransform: "uppercase" }}
                >
                  Contact
                </Typography>
                <Stack spacing={1.2}>
                  {renderRow(<Phone />, "Phone", employeeData.phone)}
                  {renderRow(<Email />, "Email", employeeData.email)}
                </Stack>
              </Box>

              {/* 3. Address Section */}
              <Box>
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color="text.primary"
                  sx={{ mb: 1, display: "block", textTransform: "uppercase" }}
                >
                  Address
                </Typography>
                <Stack spacing={1.2}>
                  {renderRow(<Home />, "Street", employeeData.address.street)}
                  {renderRow(
                    <MapOutlined />,
                    "City",
                    employeeData.address.city
                  )}
                  {renderRow(
                    <Public />,
                    "Country",
                    employeeData.address.country
                  )}
                </Stack>
              </Box>

              <Divider />

              {/* 4. Employment & Security Details Section */}
              <Box>
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color="text.primary"
                  sx={{ mb: 1, display: "block", textTransform: "uppercase" }}
                >
                  Employment
                </Typography>
                <Stack spacing={1.2}>
                  {renderRow(<Work />, "Job Title", employeeData.jobTitle)}
                  {renderRow(<Group />, "Department", employeeData.department)}
                  {renderRow(
                    <SupervisorAccount />,
                    "Reports To",
                    employeeData.managerName
                  )}
                  {renderRow(<Event />, "Hire Date", employeeData.hireDate)}
                </Stack>
              </Box>

              {/* 5. Security & Admin Details Section */}
              <Box>
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color="text.primary"
                  sx={{ mb: 1, display: "block", textTransform: "uppercase" }}
                >
                  Security & Admin
                </Typography>
                <Stack spacing={1.2}>
                  {renderRow(<PermIdentity />, "CNIC", employeeData.cnic)}
                  {renderRow(<CalendarMonth />, "DOB", employeeData.dob)}

                  {renderRow(
                    <Group />,
                    "Roles",
                    employeeData.roles.map((role) => (
                      <Chip
                        key={role}
                        label={role.replace("_", " ").toUpperCase()}
                        size="small"
                        sx={{ height: 20, fontSize: "0.7rem" }}
                      />
                    ))
                  )}
                </Stack>
              </Box>
            </Stack>
          </Grid>

          {/* ==== SECTION 2: Colleagues/Peers ==== */}
          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            <Box
              sx={{
                p: 2,
                bgcolor: "action.hover",
                borderRadius: 2,
                height: "100%",
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color="text.primary"
                sx={{ mb: 2 }}
              >
                Total Employees ({colleagues.length})
              </Typography>

              <Stack spacing={1}>
                {colleagues.length > 0 ? (
                  colleagues.map((colleague) => (
                    <Stack
                      key={colleague.id}
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{
                        p: 1,
                        bgcolor: "background.paper",
                        borderRadius: 1,
                        cursor: "pointer",
                      }}
                      onClick={() => handleColleagueClick(colleague)}
                    >
                      <Avatar>{colleague.name[0]}</Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {colleague.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {colleague.jobTitle}
                        </Typography>
                      </Box>
                    </Stack>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No immediate colleagues found in this department.
                  </Typography>
                )}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <OpenPDFDialogBox
        open={pdfDialogOpen}
        pdfUrl={pdfUrl}
        title="Employee Card"
        onClose={() => {
          setPdfDialogOpen(false);
          // optionally clear url after closing:
          // setPdfUrl(null);
        }}
      />
    </>
  );
};

export default EmployeesOverView;
