import React, { useEffect, useState } from "react";
import { socket } from "./socket"; // adjust path if needed

function Notifications() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Listen for 'alert' events from backend
    socket.on("alert", (alert) => {
      console.log("Received alert:", alert);
      setAlerts((prev) => [alert, ...prev]);
    });

    return () => {
      socket.off("alert");
    };
  }, []);

  return (
    <div>
      <h2>Real-time Alerts</h2>
      <ul>
        {alerts.map((alert, index) => (
          <li key={index}>
            <strong>{alert.type}</strong> from <em>{alert.sender}</em>: {alert.message} 
            <small> ({new Date(alert.reportedAt).toLocaleTimeString()})</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Notifications;
