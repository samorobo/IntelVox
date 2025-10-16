"use client";

import { useState, KeyboardEvent, ChangeEvent } from "react";
import { Layers, ArrowLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserSignupFlow() {
  const router = useRouter();
  const [step, setStep] = useState<
    "social" | "otp" | "profile" | "subscription"
  >("social");
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [selectedPlan, setSelectedPlan] = useState<string>("starter");

  const plans = [
    {
      id: "starter",
      name: "Starter",
      description:
        "Perfect for individuals and small teams just getting started",
      isActive: true,
      billing: {
        monthly: { price: "Free" },
        yearly: { price: "Free" },
      },
      features: [
        "1 AI agent",
        "2,000 minutes / month",
        "Basic analytics",
        "Email support",
      ],
      totalSubscribers: 290,
    },
    {
      id: "business",
      name: "Business",
      description: "Designed for growing teams needing more scale and features",
      isActive: true,
      billing: {
        monthly: {
          price: "$89",
          originalPrice: "$199",
        },
        yearly: {
          price: "$900",
          originalPrice: "$2300",
        },
      },
      features: [
        "5 AI agents",
        "5,000 minutes / month",
        "Advanced analytics & call recording",
        "Priority support",
      ],
      totalSubscribers: 290,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "Tailored for large organizations with advanced needs",
      isActive: true,
      billing: {
        monthly: {
          price: "$199",
          originalPrice: "$299",
        },
        yearly: {
          price: "$1800",
          originalPrice: "$2800",
        },
      },
      features: [
        "Unlimited AI agents",
        "Unlimited minutes / month",
        "Advanced analytics & call recording",
        "Custom integrations & SLA",
      ],
      totalSubscribers: 290,
    },
  ];

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
        setStep("profile");
      }
    }
  };

  const handleProfileSubmit = (): void => {
    if (profile.firstName && profile.lastName && profile.phone) {
      setStep("subscription");
    }
  };

  const handleProfileChange = (field: string, value: string): void => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubscriptionSubmit = (): void => {
    router.push("/dashboard");
  };

  const handleBack = (): void => {
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

            <button
              onClick={handleEmailSubmit}
              disabled={!email || !email.includes("@")}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition duration-200"
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
              Verify & Continue
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
                <button className="text-blue-500 hover:text-blue-400">
                  Resend
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Profile Step */}
        {step === "profile" && (
          <div className="border border-blue-500 rounded-lg p-8 bg-black max-w-md mx-auto">
            <div className="flex justify-center mb-8">
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <Layers className="w-7 h-7 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Complete your profile
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Tell us a bit more about yourself
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-white text-sm font-medium mb-2"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={profile.firstName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleProfileChange("firstName", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="John"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={profile.lastName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleProfileChange("lastName", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleProfileChange("phone", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <button
              onClick={handleProfileSubmit}
              disabled={
                !profile.firstName || !profile.lastName || !profile.phone
              }
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition duration-200"
            >
              Continue to Subscription
            </button>

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
                    {plan.features.map((feature, index) => (
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

            <button
              onClick={handleSubscriptionSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition duration-200"
            >
              Complete Signup
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
      </div>
    </div>
  );
}
