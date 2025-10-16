"use client";

import { useState, KeyboardEvent, ChangeEvent } from "react";
import { Layers, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserLoginFlow() {
  const router = useRouter();
  const [step, setStep] = useState<"social" | "otp">("social");
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);

  const handleSocialSubmit = (): void => {
    setStep("otp");
  };

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

    if (value && index < 3) {
      const nextInput = document.getElementById(
        `otp-${index + 1}`
      ) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }

    const currentOtp = [...newOtp].join("");
    if (currentOtp.length === 4 && currentOtp === "2468") {
      handleOtpSubmit();
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
    if (otpValue.length === 4) {
      if (otpValue === "2468") {
        router.push("/dashboard");
      }
    }
  };

  const handleBack = (): void => {
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

            <button
              onClick={handleEmailSubmit}
              disabled={!email || !email.includes("@")}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition duration-200"
            >
              Continue with email
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
              <br />
              <span className="text-blue-400 text-sm mt-2 block">
                Use static OTP: <strong>2468</strong>
              </span>
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
              disabled={otp.join("").length !== 4}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition duration-200"
            >
              Sign In
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
