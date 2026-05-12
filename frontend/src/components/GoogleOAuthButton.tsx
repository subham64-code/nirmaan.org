"use client";

import { useEffect, useCallback } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement | null, options: any) => void;
        };
      };
    };
  }
}

interface GoogleOAuthButtonProps {
  onSuccess: (token: string, user: any) => void;
  onError: (error: string) => void;
  role: "student" | "teacher" | "admin";
}

export default function GoogleOAuthButton({ onSuccess, onError, role }: GoogleOAuthButtonProps) {
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;

  const handleCredentialResponse = useCallback(
    (response: any) => {
      // Send the ID token to backend
      fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: response.credential,
          role,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            onSuccess(data.data.token, data.data.user);
          } else {
            onError(data.message || "Authentication failed");
          }
        })
        .catch((err) => {
          onError("Network error. Please try again.");
        });
    },
    [onSuccess, onError, role]
  );

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google && GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(
          document.getElementById(`google-signin-button-${role}`),
          {
            theme: "outline",
            size: "large",
            width: 250,
            text: "signin_with",
            shape: "rectangular",
            logo_alignment: "left",
          }
        );
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [handleCredentialResponse, GOOGLE_CLIENT_ID, role]);

  return (
    <div className="w-full">
      <div id={`google-signin-button-${role}`} className="flex justify-center"></div>
      {!GOOGLE_CLIENT_ID && (
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <p>⚠️ Google OAuth Client ID not configured</p>
        </div>
      )}
    </div>
  );
}
