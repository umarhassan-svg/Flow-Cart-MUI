import { Edit } from "@mui/icons-material";
import { Button, Paper, Stack, Typography } from "@mui/material";
import { useAuth } from "../../../context/AuthContext";

const ProfileCard = ({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit?: (title: string) => void;
  children: React.ReactNode;
}) => {
  const { can } = useAuth();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 3, // Rounded corners like image
        mb: 3,
        boxShadow: "0px 4px 20px rgba(0,0,0,0.05)", // Very subtle shadow
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Typography
          variant="h6"
          sx={{ color: "text.primary", fontWeight: 700 }}
        >
          {title}
        </Typography>
        {can("profile:edit") && onEdit && (
          <Button
            variant="contained"
            startIcon={<Edit sx={{ fontSize: 18 }} />}
            onClick={() => onEdit(title.toLowerCase())}
          >
            Edit
          </Button>
        )}
      </Stack>
      {children}
    </Paper>
  );
};

export default ProfileCard;
