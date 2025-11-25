"use client";

import React, { useState, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { Layers, ArrowLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import axiosClient from "@/lib/axiosClient";

export default function UserSignupFlow() {
  const router = useRouter();
  const [step, setStep] = useState<
    "social" | "otp" | "profile" | "subscription"
  >("social");
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [profile, setProfile] = useState({
    name: ""
  });
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [hasAgreedPrivacy, setHasAgreedPrivacy] = useState(false);
  const [hasScrolledPrivacy, setHasScrolledPrivacy] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isCreatingTenant, setIsCreatingTenant] = useState(false);
  const [error, setError] = useState<string>("");

  // Fetch subscription plans from backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axiosClient.get("/plans");
        const data = Array.isArray(response.data) ? response.data : [];
        setPlans(data);
        if (data.length > 0) {
          setSelectedPlan(data[0].id);
        }
      } catch (err: any) {
        console.error("Failed to load plans:", err);
        setError(
          err?.response?.data?.message ||
            "Failed to load plans. Please refresh and try again."
        );
      }
    };

    fetchPlans();
  }, []);

  const steps = [
    { id: "social", name: "Sign Up" },
    { id: "otp", name: "Verify" },
    { id: "profile", name: "Profile" },
    { id: "subscription", name: "Plan" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === step);

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
      const response = await axiosClient.post("/otp/send", {
        email,
        purpose: "signup",
      });

      if (response.status === 200 || response.status === 201) {
        setIsOtpSent(true);
        setError("");
        setStep("otp");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message
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
        setError("");
        setStep("profile");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Invalid OTP. Please try again."
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleProfileSubmit = (): void => {
    if (profile.name) {
      setStep("subscription");
    }
  };

  const handleProfileChange = (field: string, value: string): void => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubscriptionSubmit = async (): Promise<void> => {
    if (!profile.name || !email || !selectedPlan) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsCreatingTenant(true);
    setError("");

    try {
      const response = await axiosClient.post("/tenant", {
        name: profile.name,
        email,
        planId: selectedPlan,
      });

      if (response.status === 200 || response.status === 201) {
        // Save tenant ID to localStorage
        const tenantData = response.data?.tenant || response.data;
        const tenantId =
          tenantData?.tenantId ||
          tenantData?.id ||
          response.data?.tenantId ||
          response.data?.id;
        if (tenantId) {
          localStorage.setItem("tenantId", tenantId);
        }

        const tenantName = tenantData?.name || profile.name;
        if (tenantName) {
          localStorage.setItem("tenantName", tenantName.trim());
        }

        const tenantEmail = tenantData?.email || email;
        if (tenantEmail) {
          localStorage.setItem("tenantEmail", tenantEmail);
        }

        router.push("/profile");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to create account. Please try again."
      );
    } finally {
      setIsCreatingTenant(false);
    }
  };

  const handlePrivacyScroll = (
    e: React.UIEvent<HTMLDivElement, UIEvent>
  ): void => {
    const target = e.currentTarget;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 10) {
      setHasScrolledPrivacy(true);
    }
  };

  const handleBack = (): void => {
    setError("");
    if (step === "otp") setStep("social");
    else if (step === "profile") setStep("otp");
    else if (step === "subscription") setStep("profile");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Step Indicator - Show for all steps except social */}
        {step !== "social" && (
          <div className="mb-8">
            <div className="flex justify-center">
              <div className="flex items-center space-x-4">
                {steps.map((stepItem, index) => (
                  <div key={stepItem.id} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index < currentStepIndex
                          ? "bg-blue-600 text-white"
                          : index === currentStepIndex
                          ? "bg-blue-600 text-white border-2 border-blue-400"
                          : "bg-gray-800 text-gray-400"
                      }`}
                    >
                      {index < currentStepIndex ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={`ml-2 text-sm ${
                        index <= currentStepIndex
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      {stepItem.name}
                    </span>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-12 h-0.5 mx-4 ${
                          index < currentStepIndex
                            ? "bg-blue-600"
                            : "bg-gray-700"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Social Login & Email Step */}
        {step === "social" && (
          <div className="border border-blue-500 rounded-lg p-8 bg-black max-w-md mx-auto">
            <div className="flex justify-center mb-8">
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <Layers className="w-7 h-7 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Welcome
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Sign up to get started with our platform
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
              By signing up, you agree to our{" "}
              <a href="#" className="text-blue-500 hover:text-blue-400">
                Terms of service
              </a>{" "}
              &{" "}
              <a href="#" className="text-blue-500 hover:text-blue-400">
                Privacy policy
              </a>
            </p>
            <p className="text-gray-400 text-sm text-center mt-6">
              Already have an account?{" "}
              <a href="/" className="text-blue-500 hover:text-blue-400">
                Sign in
              </a>
            </p>
          </div>
        )}

        {/* OTP Step */}
        {step === "otp" && (
          <div className="border border-blue-500 rounded-lg p-8 bg-black max-w-md mx-auto">
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
                "Verify & Continue"
              )}
            </button>

            <div className="text-center mt-6">
              <button
                onClick={handleBack}
                className="text-blue-500 hover:text-blue-400 text-sm"
              >
                ← Back to sign up
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

        {/* Profile Step */}
        {step === "profile" && (
          <div className="border border-blue-500 rounded-lg p-8 bg-black max-w-md mx-auto">
            <div className="flex justify-center mb-8">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                <Layers className="w-7 h-7 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Complete your profile
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Add your basic details to personalize your IntelVox.ai account.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Tenant Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={profile.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleProfileChange("name", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-email"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                />
              </div>

              {/* <div>
                <label
                  htmlFor="phone"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Phone number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleProfileChange("phone", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="Enter your phone number"
                />
              </div> */}
              
            </div>

            <button
              onClick={handleProfileSubmit}
              disabled={!profile.name || !hasAgreedPrivacy}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition duration-200"
            >
              Proceed
            </button>

            <div className="mt-4 flex items-center justify-center text-xs text-gray-400">
              <button
                type="button"
                onClick={() => {
                  setHasScrolledPrivacy(false);
                  setIsPrivacyModalOpen(true);
                }}
                className={`mr-2 inline-flex items-center justify-center w-4 h-4 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-black ${
                  hasAgreedPrivacy
                    ? "border-blue-500 bg-blue-600"
                    : "border-gray-600 bg-transparent"
                }`}
                aria-label="Open privacy policy"
              >
                {hasAgreedPrivacy && <Check className="w-3 h-3 text-white" />}
              </button>
              <span>
                By continuing, you must review and agree to our{" "}
                <button
                  type="button"
                  onClick={() => {
                    setHasScrolledPrivacy(false);
                    setIsPrivacyModalOpen(true);
                  }}
                  className="text-blue-500 hover:text-blue-400 underline-offset-2 hover:underline ml-1"
                >
                  Privacy policy
                </button>
                .
              </span>
            </div>

            <div className="text-center mt-6">
              <button
                onClick={handleBack}
                className="text-blue-500 hover:text-blue-400 text-sm"
              >
                ← Back to verification
              </button>
            </div>
          </div>
        )}

        {/* Subscription Step */}
        {step === "subscription" && (
          <div className="border border-blue-500 rounded-lg p-8 bg-black">
            <div className="flex justify-center mb-8">
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <Layers className="w-7 h-7 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Choose your plan
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Select the plan that works best for you
            </p>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-900 rounded-lg p-1">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    billingCycle === "monthly"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    billingCycle === "yearly"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>

            {/* Horizontal Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-6 cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? "border-blue-500 bg-blue-900/20"
                      : "border-gray-700 hover:border-blue-500"
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-white font-semibold text-lg">
                      {plan.name}
                    </h3>
                    {selectedPlan === plan.id && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  <p className="text-gray-400 text-sm mb-4">
                    {plan.description}
                  </p>

                  <div className="mb-4">
                    <div className="text-white font-bold text-2xl">
                      {billingCycle === "monthly"
                        ? plan.billing.monthly.price
                        : plan.billing.yearly.price}
                    </div>
                    {plan.billing[billingCycle].originalPrice && (
                      <div className="text-gray-400 text-sm line-through">
                        {plan.billing[billingCycle].originalPrice}
                      </div>
                    )}
                  </div>

                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature: string, index: number) => (
                      <li
                        key={index}
                        className="text-gray-400 text-sm flex items-center"
                      >
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="text-gray-400 text-sm">
                    {plan.totalSubscribers}+ subscribers
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            <button
              onClick={handleSubscriptionSubmit}
              disabled={isCreatingTenant}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition duration-200 flex items-center justify-center"
            >
              {isCreatingTenant ? (
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
                  Creating Account...
                </>
              ) : (
                "Complete Signup"
              )}
            </button>

            <div className="text-center mt-6">
              <button
                onClick={handleBack}
                className="text-blue-500 hover:text-blue-400 text-sm"
              >
                ← Back to profile
              </button>
            </div>
          </div>
        )}

        {/* Privacy Policy Modal */}
        {/* Privacy Policy Modal */}
{isPrivacyModalOpen && (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div
      className="fixed inset-0 bg-black/50"
      onClick={() => {
        setIsPrivacyModalOpen(false);
        setHasScrolledPrivacy(false);
      }}
    ></div>

    <div className="flex min-h-full items-center justify-center p-4">
      <div
        className="relative bg-black border border-blue-500 rounded-lg shadow-2xl w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mt-6 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
            <Layers className="w-7 h-7 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-1">
          Privacy Policy
        </h1>
        <p className="text-gray-400 text-center mb-6 text-sm">
          Please review our subscription terms and conditions carefully.
        </p>

        <div className="px-6 pb-6">
          <div className="border border-gray-700 rounded-xl p-6 max-h-80 overflow-y-auto" onScroll={handlePrivacyScroll}>
            <div className="text-center mb-6 pb-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white mb-2">
                Subscription Terms & Conditions
              </h2>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Last Updated: November 19, 2025
              </p>
            </div>
            
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p className="text-sm">
                These Terms &amp; Conditions ("Terms") govern the use of paid
                subscription services provided by IntelVox.ai ("Company",
                "we", "our", "us"). By purchasing a paid subscription,
                you ("Client", "you", "your") agree to be bound by these
                Terms.
              </p>

              <div className="pt-4">
                <h3 className="text-base font-bold text-white mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">1.</span>
                  Subscription Services
                </h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400 font-medium">1.1</span> IntelVox.ai provides AI-powered inbound and outbound
                    voice automation tools, dashboards, analytics, and related
                    features ("Services").
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">1.2</span> Subscription plans, features, and pricing are displayed
                    on our website or shared directly with you.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-base font-bold text-white mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">2.</span>
                  Account Registration
                </h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400 font-medium">2.1</span> You must provide accurate, current, and complete
                    information when creating an account.
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">2.2</span> You are responsible for maintaining the
                    confidentiality of your login credentials.
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">2.3</span> You are responsible for all actions taken under your
                    account.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-base font-bold text-white mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">3.</span>
                  Payment &amp; Billing
                </h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400 font-medium">3.1</span> Subscription fees are billed in advance on a monthly or
                    annual basis, depending on your chosen plan.
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">3.2</span> All payments are non-refundable unless required by law.
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">3.3</span> If a payment fails, we may suspend or terminate your
                    access to the Services.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-base font-bold text-white mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">4.</span>
                  Use of Client Data
                </h3>
                <p className="text-xs text-gray-400 italic mb-3 pl-6">
                  (Consent for Website &amp; Marketing Use)
                </p>
                <div className="pl-6 space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400 font-medium">4.1</span> By purchasing a paid subscription, you grant
                    IntelVox.ai permission to use the following information for
                    marketing, promotional, and website display purposes: your
                    company name, company logo, industry description, and a
                    general description of your non-confidential use case.
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">4.2</span> This consent allows us to display your details on our
                    website (for example in "Our Clients" or "Trusted By"
                    sections), in marketing materials, and in case studies,
                    presentations, or pitch decks.
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">4.3</span> You confirm that you have the authority to grant this
                    consent on behalf of your company.
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">4.4</span> You may withdraw this consent at any time by emailing
                    support@intelvox.ai. Once withdrawn, we will remove your
                    details from future marketing materials and update our
                    website within a reasonable timeframe.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-base font-bold text-white mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">5.</span>
                  Client Responsibilities
                </h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400 font-medium">5.1</span> You agree not to use the Services for unlawful,
                    harmful, or fraudulent activities.
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">5.2</span> You are responsible for all content, data, and
                    communication processed through the platform using your
                    account.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-base font-bold text-white mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">6.</span>
                  Intellectual Property
                </h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400 font-medium">6.1</span> IntelVox.ai retains all rights to its platform,
                    software, AI models, trademarks, branding, and all related
                    materials.
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">6.2</span> Your subscription grants you a limited,
                    non-exclusive, non-transferable licence to use the
                    Services.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-base font-bold text-white mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">7.</span>
                  Service Availability &amp; Updates
                </h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400 font-medium">7.1</span> We aim to provide reliable uptime but do not guarantee
                    uninterrupted service.
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">7.2</span> We may update, modify, or discontinue features without
                    notice.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-base font-bold text-white mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">8.</span>
                  Confidentiality
                </h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400 font-medium">8.1</span> Both parties agree to keep non-public business
                    information confidential.
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">8.2</span> This does not apply to information already publicly
                    available or independently developed.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-base font-bold text-white mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">9.</span>
                  Data Protection &amp; Privacy
                </h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400 font-medium">9.1</span> IntelVox.ai processes personal data in accordance with
                    applicable data protection laws, including GDPR. Full
                    details are available in our Privacy Policy.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-base font-bold text-white mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">10.</span>
                  Limitation of Liability
                </h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400 font-medium">10.1</span> The Services are provided on an "as-is" basis.
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">10.2</span> IntelVox.ai is not liable for indirect, incidental, or
                    consequential damages.
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">10.3</span> Our maximum liability shall not exceed the total
                    subscription fees paid by you in the previous 12 months.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-base font-bold text-white mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">11.</span>
                  Termination
                </h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400 font-medium">11.1</span> You may cancel at any time from your dashboard or by
                    contacting support.
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">11.2</span> We may terminate or suspend your account for breach of
                    these Terms.
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">11.3</span> Upon termination, your access to the Services ends
                    immediately.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-base font-bold text-white mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">12.</span>
                  Changes to Terms
                </h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400 font-medium">12.1</span> IntelVox.ai may update these Terms at any time.
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">12.2</span> We will notify you of significant changes via email or
                    dashboard notifications.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-base font-bold text-white mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">13.</span>
                  Governing Law
                </h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400 font-medium">13.1</span> These Terms are governed by the laws of England &amp;
                    Wales.
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">13.2</span> Any disputes will be resolved in the courts of England
                    &amp; Wales.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-base font-bold text-white mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">14.</span>
                  Contact Information
                </h3>
                <div className="pl-6 space-y-2 text-sm">
                  <p>
                    For questions or support, please contact us at{" "}
                    <span className="text-blue-400">support@intelvox.ai</span>.
                  </p>
                  <p className="pt-2 font-medium text-gray-200">
                    By purchasing a subscription, you confirm that you have read and agreed to these Terms &amp;
                    Conditions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsPrivacyModalOpen(false);
                setHasScrolledPrivacy(false);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-800 rounded-lg hover:bg-gray-700"
            >
              I Do Not Agree
            </button>
            <button
              type="button"
              disabled={!hasScrolledPrivacy}
              onClick={() => {
                setHasAgreedPrivacy(true);
                setIsPrivacyModalOpen(false);
                setStep("subscription");
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg shadow-sm ${
                hasScrolledPrivacy
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              I Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
}
