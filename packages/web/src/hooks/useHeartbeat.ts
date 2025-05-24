import { AuthService } from "@services/authService";
import React from "react";

export function useHeartbeat() {
  React.useEffect(() => {
    setInterval(AuthService.heartbeat, 5 * 60 * 1000);
    AuthService.heartbeat();
  }, []);
}
