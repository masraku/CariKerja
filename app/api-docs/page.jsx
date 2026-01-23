"use client";

import { useEffect, useState } from "react";
import { swaggerSpec } from "@/lib/swagger";

export default function ApiDocsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Create a script element for Redoc
    const script = document.createElement("script");
    script.src =
      "https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js";
    script.async = true;

    script.onload = () => {
      try {
        // Wait a bit for Redoc to initialize
        setTimeout(() => {
          const container = document.getElementById("redoc-container");
          if (window.Redoc && container) {
            window.Redoc.init(
              swaggerSpec,
              {
                scrollYOffset: 60,
                hideDownloadButton: false,
                expandResponses: "200,201",
                requiredPropsFirst: true,
                pathInMiddlePanel: true,
                jsonSampleExpandLevel: 2,
                theme: {
                  colors: {
                    primary: { main: "#1e40af" },
                  },
                  typography: {
                    fontSize: "14px",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  },
                  sidebar: {
                    backgroundColor: "#fafafa",
                    width: "260px",
                  },
                  rightPanel: {
                    backgroundColor: "#1e293b",
                  },
                },
              },
              container,
            );
            setIsLoaded(true);
          }
        }, 100);
      } catch (err) {
        console.error("Redoc init error:", err);
        setError(err.message);
      }
    };

    script.onerror = () => {
      setError("Failed to load Redoc script from CDN");
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "20px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1 style={{ color: "#dc2626" }}>Failed to Load API Documentation</h1>
        <p style={{ color: "#666" }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            background: "#1e40af",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
        }
        .api-menu-logo {
          display: none !important;
        }
      `}</style>

      {!isLoaded && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "#fafafa",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #e0e0e0",
              borderTopColor: "#1e40af",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <p
            style={{
              marginTop: "16px",
              color: "#666",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Loading API Documentation...
          </p>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}

      <div
        id="redoc-container"
        style={{
          display: isLoaded ? "block" : "none",
        }}
      />
    </>
  );
}
