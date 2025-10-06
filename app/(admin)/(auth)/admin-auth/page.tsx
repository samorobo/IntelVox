"use client";

import { useState, KeyboardEvent, ChangeEvent } from "react";
import { Layers, ArrowLeft } from "lucide-react";

export default function AuthFlow() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);

  const handleEmailSubmit = (): void => {
    if (email && email.includes("@")) {
      setStep("otp");
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

    if (value && index < 5) {
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

  const handleOtpSubmit = (): void => {
    const otpValue = otp.join("");
    if (otpValue.length === 6) {
      console.log("OTP submitted:", otpValue);
    }
  };

  const handleBackToEmail = (): void => {
    setStep("email");
    setOtp(["", "", "", "", "", ""]);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step === "email" ? (
          <div className="border border-blue-500 rounded-lg p-8 bg-black">
            <div className="flex justify-center mb-8">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Layers className="w-7 h-7 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Welcome back superadmin
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Sign in to manage tenants, users, and AI agents.
            </p>

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

            <button
              onClick={handleEmailSubmit}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-lg transition duration-200"
            >
              Continue with email
            </button>

            <p className="text-gray-400 text-sm text-center mt-6">
              By signing up, you agree to our{" "}
              <a href="#" className="text-blue-500 hover:text-blue-400">
                Terms of service
              </a>{" "}
              &{" "}
              <a href="#" className="text-blue-500 hover:text-blue-400">
                Privacy policy
              </a>
            </p>
          </div>
        ) : (
          <div className="border border-blue-500 rounded-lg p-8 bg-black">
            <div className="flex justify-center mb-8">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Layers className="w-7 h-7 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Enter verification code
            </h1>
            <p className="text-gray-400 text-center mb-8">
              We've sent a 6-digit code to
              <br />
              <span className="text-white">{email}</span>
            </p>

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
              disabled={otp.join("").length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition duration-200"
            >
              Proceed
            </button>

            <div className="text-center mt-6">
              <button
                onClick={handleBackToEmail}
                className="text-blue-500 hover:text-blue-400 text-sm"
              >
                ← Back to email
              </button>
              <p className="text-gray-400 text-sm mt-4">
                Didn't receive the code?{" "}
                <button className="text-blue-500 hover:text-blue-400">
                  Resend
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
