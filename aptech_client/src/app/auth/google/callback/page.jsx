"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function GoogleCallback() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      setError("No authentication data received");
      return;
    }

    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get("access_token");

    if (!accessToken) {
      setError("No access token received");
      return;
    }

    // Fetch user info from Google
    fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then(async (googleUser) => {
        // Send to our backend
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/user/google-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: googleUser.given_name || googleUser.name || "User",
            lastName: googleUser.family_name || "",
            email: googleUser.email,
            image: googleUser.picture || "",
            googleId: googleUser.sub,
          }),
        });

        const data = await res.json();

        if (data.success && data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.data));

          // Redirect to stored page or homepage
          const redirectTo = localStorage.getItem('authRedirect') || '/';
          localStorage.removeItem('authRedirect');
          router.push(redirectTo);
        } else {
          setError(data.message || "Login failed");
        }
      })
      .catch((err) => {
        setError(err.message || "Google login failed");
      });
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Login Failed</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-2 bg-[#41bfb8] text-white rounded-xl hover:bg-[#38a89d] transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#41bfb8] mb-4"></div>
        <h3 className="text-lg font-medium text-gray-800">Signing you in...</h3>
        <p className="text-gray-500 text-sm">Please wait while we verify your Google account</p>
      </div>
    </div>
  );
}
