"use client";

import { useState, KeyboardEvent, ChangeEvent } from "react";
import { Layers, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import axiosClient from "@/lib/axiosClient";

export default function UserLoginFlow() {
  const router = useRouter();
  const [step, setStep] = useState<"social" | "otp">("social");
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSocialSubmit = (): void => {
    setStep("otp");
  };

  const handleEmailSubmit = async (): Promise<void> => {
    if (!email || !email.includes("@")) {
      return;
    }

    setIsSendingOtp(true);
    setError("");

    try {
      const response = await axiosClient.post("/otp/send/login", {
        email,
      });

      if (response.status === 200 || response.status === 201) {
        setError("");
        setStep("otp");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string): void => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      const nextInput = document.getElementById(
        `otp-${index + 1}`
      ) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: KeyboardEvent<HTMLInputElement>
  ): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(
        `otp-${index - 1}`
      ) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpSubmit = async (): Promise<void> => {
    const otpValue = otp.join("");
    if (otpValue.length !== 4) {
      return;
    }

    setIsVerifyingOtp(true);
    setError("");

    try {
      const response = await axiosClient.post("/otp/verify", {
        email,
        otp: otpValue,
      });

      if (response.status === 200 || response.status === 201) {
        // Save tenant ID to localStorage (required for subsequent requests)
        // Backend response example:
        // { success: true, message: "Email verified successfully", data: { tenant: { id: "..." }, ... } }
        const apiData = response.data;
        const innerData = apiData?.data;

        const tenantId =
          innerData?.tenantId ||
          innerData?.tenant?.id ||
          innerData?.id ||
          apiData?.tenantId ||
          apiData?.tenant?.id ||
          apiData?.id;

        if (!tenantId) {
          // If backend does not return a tenantId, do not proceed
          setError(
            "No tenant found for this account. Please complete signup or contact support."
          );
          return;
        }

        localStorage.setItem("tenantId", tenantId);

        setError("");
        router.push("/profile");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Invalid OTP. Please try again."
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleBack = (): void => {
    setError("");
    if (step === "otp") setStep("social");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Social Login & Email Step */}
        {step === "social" && (
          <div className="border border-blue-500 rounded-lg p-8 bg-black">
            <div className="flex justify-center mb-8">
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <Layers className="w-7 h-7 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Welcome back
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Sign in to your account
            </p>

            <div className="space-y-4 mb-6">
              <button
                onClick={handleSocialSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition duration-200"
              >
                Continue with Google
              </button>
              <button
                onClick={handleSocialSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition duration-200"
              >
                Continue with Microsoft
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-400">
                  Or continue with email
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-white text-sm font-medium mb-2"
              >
                Work email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                  e.key === "Enter" && handleEmailSubmit()
                }
                placeholder="you@company.com"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            <button
              onClick={handleEmailSubmit}
              disabled={!email || !email.includes("@") || isSendingOtp}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition duration-200 flex items-center justify-center"
            >
              {isSendingOtp ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </>
              ) : (
                "Continue with email"
              )}
            </button>

            <p className="text-gray-400 text-sm text-center mt-6">
              Don't have an account?{" "}
              <a href="/register" className="text-blue-500 hover:text-blue-400">
                Sign up
              </a>
            </p>
          </div>
        )}

        {/* OTP Step */}
        {step === "otp" && (
          <div className="border border-blue-500 rounded-lg p-8 bg-black">
            <div className="flex justify-center mb-8">
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <Layers className="w-7 h-7 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Enter verification code
            </h1>
            <p className="text-gray-400 text-center mb-8">
              We've sent a 4-digit code to
              <br />
              <span className="text-white">{email}</span>
            </p>
            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-center mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleOtpChange(index, e.target.value)
                  }
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                    handleOtpKeyDown(index, e)
                  }
                  className="w-12 h-14 bg-gray-900 border border-gray-700 rounded-lg text-white text-center text-xl font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              ))}
            </div>

            <button
              onClick={handleOtpSubmit}
              disabled={otp.join("").length !== 4 || isVerifyingOtp}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition duration-200 flex items-center justify-center"
            >
              {isVerifyingOtp ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="text-center mt-6">
              <button
                onClick={handleBack}
                className="text-blue-500 hover:text-blue-400 text-sm"
              >
                ← Back to sign in
              </button>
              <p className="text-gray-400 text-sm mt-4">
                Didn't receive the code?{" "}
                <button
                  onClick={handleEmailSubmit}
                  disabled={isSendingOtp}
                  className="text-blue-500 hover:text-blue-400 disabled:text-gray-600 disabled:cursor-not-allowed"
                >
                  {isSendingOtp ? "Sending..." : "Resend"}
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
