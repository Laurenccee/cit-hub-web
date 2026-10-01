"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface LogEntry {
  id: string;
  cardUid: string;
  userName: string;
  userRole: string;
  status: "SUCCESS" | "FAILED" | string;
  timestamp: string;
  eventType?: "ENTRY" | "EXIT";
}

type Tab = "logs" | "events";

export default function RFIDLoginPage() {
  const [buffer, setBuffer] = useState("");
  const [manualUid, setManualUid] = useState("");
  const [status, setStatus] = useState<string>("Ready for RFID Scan...");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("logs");

  const bufferRef = useRef("");

  // Fetch access log history from the API
  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/rfid/login");
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  }, []);

  // Poll for new logs every 4 seconds
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 4000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  // Listen for USB HID RFID Reader Keystrokes
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept input if the user is typing in the manual input field
      if (e.target instanceof HTMLInputElement) return;

      // RFID scanners emit 'Enter' at the end of the barcode/UID
      if (e.key === "Enter") {
        const scannedUid = bufferRef.current.trim();
        if (scannedUid.length >= 4) {
          processRFIDLogin(scannedUid);
        }
        bufferRef.current = "";
        setBuffer("");
        return;
      }

      // Append printable characters to the buffer
      if (e.key.length === 1) {
        bufferRef.current += e.key;
        setBuffer(bufferRef.current);

        // Reset buffer if typing pauses
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          bufferRef.current = "";
          setBuffer("");
        }, 150);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timeout);
    };
  }, []);

  async function processRFIDLogin(cardUid: string) {
    setLoading(true);
    setStatus(`Processing Card: ${cardUid}...`);

    try {
      const res = await fetch("/api/rfid/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardUid }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(`Success! Welcome ${data.user.name}`);
      } else {
        setStatus(`Denied: ${data.message || "Invalid Card"}`);
      }

      // Refresh log history table immediately after scan
      await fetchLogs();
    } catch (err) {
      setStatus("Server connection error");
    } finally {
      setLoading(false);
      setManualUid("");
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUid.trim()) {
      processRFIDLogin(manualUid.trim());
    }
  };

  const formatDateTime = (timestamp: string) => {
    const dateObj = new Date(timestamp);
    return `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`;
  };

  const getEventType = (log: LogEntry): "ENTRY" | "EXIT" => {
    return log.eventType || (log.status === "SUCCESS" ? "ENTRY" : "EXIT");
  };

  const getEventColor = (eventType: "ENTRY" | "EXIT") => {
    return eventType === "ENTRY" ? "green" : "orange";
  };

  const getEventIcon = (eventType: "ENTRY" | "EXIT") => {
    return eventType === "ENTRY" ? "→" : "←";
  };

  return (
    <div
      style={{
        maxWidth: "850px",
        margin: "2rem auto",
        padding: "1rem",
        fontFamily: "sans-serif",
      }}
    >
      {/* RFID Scanner Terminal */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: "1.5rem",
          borderRadius: "8px",
          textAlign: "center",
          marginBottom: "2rem",
        }}
      >
        <h1>RFID Login Terminal</h1>
        <p
          style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            color: loading
              ? "orange"
              : status.startsWith("Success")
                ? "green"
                : status.startsWith("Denied")
                  ? "red"
                  : "#333",
          }}
        >
          {status}
        </p>

        {buffer && (
          <p style={{ color: "#666" }}>
            Reading input: <code>{buffer}</code>
          </p>
        )}

        {/* Manual Card Entry Fallback */}
        <form onSubmit={handleManualSubmit} style={{ marginTop: "1rem" }}>
          <input
            type="text"
            placeholder="Or enter Card UID manually..."
            value={manualUid}
            onChange={(e) => setManualUid(e.target.value)}
            disabled={loading}
            style={{
              padding: "0.5rem",
              width: "260px",
              marginRight: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <button
            type="submit"
            disabled={loading || !manualUid.trim()}
            style={{
              padding: "0.5rem 1rem",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            Submit Scan
          </button>
        </form>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          borderBottom: "2px solid #eee",
          marginBottom: "1rem",
        }}
      >
        {["logs", "events"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as Tab)}
            style={{
              padding: "0.75rem 1.5rem",
              cursor: "pointer",
              border: "none",
              background: "transparent",
              fontSize: "1rem",
              fontWeight: activeTab === tab ? "bold" : "normal",
              color: activeTab === tab ? "#8B1A1A" : "#666",
              borderBottom: `3px solid ${activeTab === tab ? "#8B1A1A" : "transparent"}`,
              marginBottom: "-2px",
              transition: "all 0.2s",
            }}
          >
            {tab === "logs" ? "📋 Access Logs" : "📅 Events"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2>{activeTab === "logs" ? "Access Log History" : "Event Timeline"}</h2>
          <button
            onClick={fetchLogs}
            style={{
              padding: "0.4rem 0.8rem",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            Refresh
          </button>
        </div>

        {activeTab === "logs" ? (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #ddd",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
                <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                  Date & Time
                </th>
                <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                  Card UID
                </th>
                <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                  User Name
                </th>
                <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => {
                  const isSuccess = log.status === "SUCCESS";
                  return (
                    <tr key={log.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "10px" }}>{formatDateTime(log.timestamp)}</td>
                      <td style={{ padding: "10px" }}>
                        <code>{log.cardUid}</code>
                      </td>
                      <td style={{ padding: "10px" }}>{log.userName}</td>
                      <td
                        style={{
                          padding: "10px",
                          fontWeight: "bold",
                          color: isSuccess ? "green" : "red",
                        }}
                      >
                        {log.status}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      padding: "15px",
                      textAlign: "center",
                      color: "#888",
                    }}
                  >
                    No access logs recorded yet. Scan a card to test!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {logs.length > 0 ? (
              logs.map((log) => {
                const eventType = getEventType(log);
                const isSuccess = log.status === "SUCCESS";
                const color = getEventColor(eventType);
                const icon = getEventIcon(eventType);
                return (
                  <div
                    key={log.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "1rem",
                      padding: "1rem",
                      background: "#fafafa",
                      borderRadius: "8px",
                      borderLeft: `4px solid ${color}`,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: `${color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2rem",
                        color: color,
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    >
                      {icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: "bold", color: "#333" }}>{log.userName}</span>
                        <span
                          style={{
                            padding: "0.15rem 0.5rem",
                            borderRadius: "999px",
                            fontSize: "0.7rem",
                            fontWeight: "bold",
                            background: `${color}20`,
                            color: color,
                            textTransform: "uppercase",
                          }}
                        >
                          {eventType}
                        </span>
                        <span
                          style={{
                            padding: "0.15rem 0.5rem",
                            borderRadius: "999px",
                            fontSize: "0.7rem",
                            fontWeight: "bold",
                            background: isSuccess ? "#d4edda" : "#f8d7da",
                            color: isSuccess ? "#155724" : "#721c24",
                          }}
                        >
                          {log.status}
                        </span>
                      </div>
                      <div style={{ color: "#666", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                        <code style={{ background: "#f0f0f0", padding: "0.1rem 0.4rem", borderRadius: "3px" }}>
                          {log.cardUid}
                        </code>
                        {log.userRole !== "N/A" && (
                          <span style={{ marginLeft: "0.5rem" }}>{log.userRole}</span>
                        )}
                      </div>
                      <div style={{ color: "#999", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                        {formatDateTime(log.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "#888",
                  background: "#fafafa",
                  borderRadius: "8px",
                }}
              >
                No events recorded yet. Scan a card to test!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}