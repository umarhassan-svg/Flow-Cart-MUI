// src/components/ChatAIAgent/ChatAIAgent.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Avatar,
  Divider,
  useTheme,
  alpha,
  Tooltip,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SmartToyTwoToneIcon from "@mui/icons-material/SmartToyTwoTone";
import PersonIcon from "@mui/icons-material/Person";
import { useGrokChat } from "../../hooks/useGrokChat";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

const ChatAIAgent: React.FC = () => {
  const theme = useTheme();
  const { messages, connected, sendMessage, clearChat } = useGrokChat({ backendUrl });
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (listRef.current) {
      requestAnimationFrame(() => {
        listRef.current!.scrollTop = listRef.current!.scrollHeight;
      });
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: theme.palette.background.paper,
      }}
    >
      {/* FIXED HEADER */}
      <Box
        sx={{
          flexShrink: 0,
          p: 2.5,
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 60,
          maxHeight: 60,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box position="relative">
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 44,
                height: 44,
                boxShadow: theme.shadows[2],
              }}
            >
              <SmartToyTwoToneIcon sx={{ color: "#fff" }} />
            </Avatar>
            {/* Status Indicator */}
            <Box
              sx={{
                position: "absolute",
                bottom: 2,
                right: 2,
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: connected ? "success.main" : "error.main",
                border: `2px solid ${theme.palette.background.paper}`,
                boxShadow: theme.shadows[2],
              }}
            />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="700" lineHeight={1.2}>
              FlowCart Assistant
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {connected ? "Online & Ready" : "Connecting..."}
            </Typography>
          </Box>
        </Box>

        <Tooltip title="Clear conversation">
          <IconButton 
            onClick={clearChat} 
            size="small" 
            sx={{ 
              color: "text.secondary",
              '&:hover': {
                color: 'error.main',
                bgcolor: alpha(theme.palette.error.main, 0.08),
              }
            }}
          >
            <DeleteOutlineRoundedIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* SCROLLABLE MESSAGES AREA */}
      <Box
        ref={listRef}
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          bgcolor: theme.palette.mode === 'light' 
            ? alpha(theme.palette.grey[50], 0.5)
            : theme.palette.background.default,
          '&::-webkit-scrollbar': { 
            width: '8px' 
          },
          '&::-webkit-scrollbar-track': { 
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.primary.main, 0.2),
            borderRadius: '10px',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.3),
            }
          },
        }}
      >
        {/* Empty State */}
        {messages.length === 0 && (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.5,
            }}
          >
            <SmartToyTwoToneIcon 
              sx={{ 
                fontSize: 64, 
                color: "text.disabled", 
                mb: 2 
              }} 
            />
            <Typography variant="h6" color="text.disabled" fontWeight="600">
              Start a Conversation
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
              Ask me anything about FlowCart
            </Typography>
          </Box>
        )}

        {/* Messages */}
        {messages.map((m) => {
          const isUser = m.sender === "user";
          return (
            <Box
              key={m.id}
              sx={{
                display: "flex",
                flexDirection: isUser ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: 1.5,
                animation: 'fadeIn 0.3s ease-in',
                '@keyframes fadeIn': {
                  from: { opacity: 0, transform: 'translateY(10px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              {/* Avatar */}
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: isUser ? "grey.400" : "primary.main",
                  boxShadow: theme.shadows[2],
                }}
              >
                {isUser ? (
                  <PersonIcon fontSize="small" sx={{ color: '#fff' }} />
                ) : (
                  <SmartToyTwoToneIcon fontSize="small" sx={{ color: '#fff' }} />
                )}
              </Avatar>

              {/* Message Bubble */}
              <Box maxWidth="75%">
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: isUser 
                      ? "18px 18px 4px 18px" 
                      : "18px 18px 18px 4px",
                    bgcolor: isUser 
                      ? theme.palette.primary.main 
                      : theme.palette.background.paper,
                    color: isUser 
                      ? theme.palette.primary.contrastText 
                      : theme.palette.text.primary,
                    boxShadow: isUser 
                      ? theme.shadows[3] 
                      : theme.shadows[1],
                    border: isUser 
                      ? 'none' 
                      : `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      whiteSpace: "pre-wrap", 
                      lineHeight: 1.6,
                      wordBreak: 'break-word',
                    }}
                  >
                    {m.text}
                  </Typography>
                </Paper>
                
                {/* Timestamp */}
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{
                    display: "block",
                    mt: 0.5,
                    px: 0.5,
                    textAlign: isUser ? "right" : "left",
                    fontSize: "0.7rem",
                  }}
                >
                  {new Date(m.time).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      <Divider sx={{ flexShrink: 0 }} />

      {/* FIXED INPUT AREA */}
      <Box 
        sx={{ 
          flexShrink: 0,
          p: 2.5, 
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            gap: 1.5,
            bgcolor: alpha(theme.palette.divider, 0.08),
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            p: "10px 16px",
            transition: 'all 0.2s ease',
            '&:focus-within': {
              borderColor: theme.palette.primary.main,
              bgcolor: 'transparent',
            }
          }}
        >
          <TextField
            fullWidth
            variant="standard"
            placeholder="Type your message..."
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            InputProps={{
              disableUnderline: true,
              sx: { 
                fontSize: "0.95rem",
                '& textarea': {
                  '&::-webkit-scrollbar': { width: '6px' },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.3),
                    borderRadius: '10px',
                  }
                }
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!input.trim()}
            sx={{
              bgcolor: input.trim() ? "primary.main" : "transparent",
              color: input.trim() ? "#fff" : "action.disabled",
              "&:hover": { 
                bgcolor: input.trim() ? "primary.dark" : "transparent",
              },
              width: 40,
              height: 40,
              transition: 'all 0.2s ease',
            }}
          >
            <SendRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatAIAgent;