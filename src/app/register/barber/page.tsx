"use client";

import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AuthLayout from "@/components/layouts/AuthLayout";
import AuthInput from "@/components/AuthInput";
import {
  User,
  Phone,
  Globe,
  MapPin,
  FileText,
  Home,
  Briefcase,
  DollarSign,
  Image as ImageIcon,
  Building,
  CreditCard,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

type RequestError = {
  response?: {
    data?: {
      message?: string;
      error?: string;
      exists?: boolean;
    };
  };
};


export default function BarberSignup() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [checkingAccess, setCheckingAccess] = useState(true);

  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    whatsapp: "",
    mobile: "",
    country: "",
    state: "",
    nin: "",
    bio: "",
    address: "",
    exp: "",
    charge: "",
    image: null as File | null,
    bankName: "",
    accountNo: "",
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.email) {
      router.replace("/login?mode=signup&role=barber");
      return;
    }

    if (session.user.role && session.user.role !== "barber") {
      router.replace("/auth/redirect");
      return;
    }

    let mounted = true;

    
    const verifyRegistrationState = async () => {
      try {
        const meResponse = await fetch("/api/me", { cache: "no-store" });
        const mePayload = (await meResponse.json().catch(() => ({}))) as {
          user?: { role?: string | null };
        };
        const currentRole = mePayload.user?.role;

        if (mounted && meResponse.ok && currentRole && currentRole !== "barber") {
          router.replace("/auth/redirect");
          return;
        }

        if (mounted && meResponse.ok && !currentRole) {
          router.replace("/register");
          return;
        }

        const response = await fetch("/api/barber", { cache: "no-store" });
        const payload = (await response.json().catch(() => ({}))) as {
          exists?: boolean;
        };

        if (mounted && response.ok && payload.exists) {
          router.replace("/dashboard/barber");
          return;
        }
      } finally {
        if (mounted) {
          setCheckingAccess(false);
        }
      }
    };

    void verifyRegistrationState();

    return () => {
      mounted = false;
    };
  }, [router, session?.user?.email, session?.user?.role, status]);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files && files[0]) {
      setFormData({ ...formData, [name]: files[0] });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  
  const handleNext = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  
  const validateForm = () => {
    const requiredFields = ['whatsapp', 'mobile', 'country', 'state', 'nin', 'bio', 'address', 'exp', 'charge', 'bankName', 'accountNo'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]?.toString().trim()) {
        alert(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }
    // Validate phone numbers
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(formData.whatsapp) || !phoneRegex.test(formData.mobile)) {
      alert("Please enter valid phone numbers");
      return false;
    }
    // Validate NIN (assume 11 digits)
    if (!/^\d{11}$/.test(formData.nin)) {
      alert("NIN must be 11 digits");
      return false;
    }
    // Validate account number (assume 10 digits)
    if (!/^\d{10}$/.test(formData.accountNo)) {
      alert("Account number must be 10 digits");
      return false;
    }
    return true;
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!session?.user?.email) {
      alert("Session expired. Please login again.");
      router.push("/login");
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (!value) return;
        formDataToSend.append(key, value);
      });

      const response = await axios.post<{ message: string }>(
        "/api/barber",
        formDataToSend,
        {
        headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.message === "Barber registered successfully") {
        router.push("/dashboard/barber");
      }
    } catch (error: unknown) {
      console.error("Error submitting barber form", error);
      const requestError = error as RequestError;
      const errorMessage =
        requestError.response?.data?.message ||
        requestError.response?.data?.error ||
        "Failed to register. Please try again.";
      alert(`Error: ${errorMessage}`);
    }
  };

  if (status === "loading" || checkingAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfaf8] text-[#1c130d]">
        {/* show text */}
        <p className="text-sm font-medium">Preparing registration...</p>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Complete Your Profile"
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkText="Sign In"
    >
      {/* Progress Bar */}
      <div className="mx-auto mb-3 w-full max-w-[480px]">
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-1.5 rounded-full bg-[#f96b06] transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* show text */}
        <p className="mt-1 text-center text-xs font-medium text-[#9e6b47]">
          Step {step} of {totalSteps} — {Math.round(progress)}% Complete
        </p>
      </div>

      {/* show the main heading */}
      <h1 className="mb-3 mt-1 text-center text-lg font-bold">
        {step === 1
          ? "Upload Image"
          : step === 2
          ? "Personal Details"
          : step === 3
          ? "Shop Details"
          : "Bank Details"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[480px] space-y-3 pb-2 transition-all"
      >
        {/* Step 1: Upload Image */}
        {step === 1 && (
          <div className="flex flex-col items-center space-y-3">
            <div className="relative h-32 w-32 rounded-full border-4 border-transparent bg-gradient-to-br from-green-300 to-teal-400 p-[3px] shadow-md">
              <div className="relative w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                {preview ? (
                  <Image
                    src={preview}
                    alt="Profile preview"
                    fill
                    unoptimized
                    className="object-cover w-full h-full rounded-full"
                  />
                ) : (
                  <ImageIcon className="text-teal-400" size={72} />
                )}
              </div>
              <label
                htmlFor="image"
                className="absolute bottom-2 right-2 cursor-pointer rounded-full bg-[#f96b06] p-2 text-white shadow-lg transition hover:bg-orange-600"
              >
                <ImageIcon size={18} />
              </label>
              {/* show an input field */}
              <input
                id="image"
                type="file"
                name="image"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
              />
            </div>
            {/* show text */}
            <p className="text-sm text-[#9e6b47]">
              Upload your profile image to begin
            </p>
          </div>
        )}

        {/* Step 2: Personal Details */}
        {step === 2 && (
          <>
            <AuthInput
              name="whatsapp"
              type="text"
              placeholder="WhatsApp"
              icon={Phone}
              value={formData.whatsapp}
              onChange={handleChange}
            />
            <AuthInput
              name="mobile"
              type="text"
              placeholder="Mobile"
              icon={Phone}
              value={formData.mobile}
              onChange={handleChange}
            />
            <AuthInput
              name="country"
              type="text"
              placeholder="Country"
              icon={Globe}
              value={formData.country}
              onChange={handleChange}
            />
            <AuthInput
              name="state"
              type="text"
              placeholder="State"
              icon={MapPin}
              value={formData.state}
              onChange={handleChange}
            />
            <AuthInput
              name="nin"
              type="text"
              placeholder="NIN"
              icon={User}
              value={formData.nin}
              onChange={handleChange}
            />
            <AuthInput
              name="bio"
              type="text"
              placeholder="Short Bio"
              icon={FileText}
              value={formData.bio}
              onChange={handleChange}
            />
            <AuthInput
              name="address"
              type="text"
              placeholder="Address"
              icon={Home}
              value={formData.address}
              onChange={handleChange}
            />
          </>
        )}

        {/* Step 3: Shop Details */}
        {step === 3 && (
          <>
            <AuthInput
              name="exp"
              type="text"
              placeholder="Years of Experience"
              icon={Briefcase}
              value={formData.exp}
              onChange={handleChange}
            />
            <AuthInput
              name="charge"
              type="text"
              placeholder="Service Charge"
              icon={DollarSign}
              value={formData.charge}
              onChange={handleChange}
            />
          </>
        )}

        {/* Step 4: Bank Details */}
        {step === 4 && (
          <>
            <AuthInput
              name="bankName"
              type="text"
              placeholder="Bank Name"
              icon={Building}
              value={formData.bankName}
              onChange={handleChange}
            />
            <AuthInput
              name="accountNo"
              type="text"
              placeholder="Account Number"
              icon={CreditCard}
              value={formData.accountNo}
              onChange={handleChange}
            />
          </>
        )}

        {/* Navigation Buttons */}
        <div className="space-y-2 pt-3">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="h-11 w-full rounded-xl border border-[#f96b06] font-bold text-[#f96b06] transition-all hover:bg-[#fff5ef]"
            >
              <ArrowLeft size={18} className="inline-block mr-2" />
              Back
            </button>
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
                className="h-11 w-full rounded-xl bg-[#f96b06] font-bold tracking-wide text-white transition-all hover:bg-orange-600"
            >
              Next <ArrowRight size={18} className="inline-block ml-2" />
            </button>
          ) : (
            <button
              type="submit"
              className="h-11 w-full rounded-xl bg-[#f96b06] text-base font-bold tracking-wide text-[#fcfaf8]"
            >
              Save & Continue
            </button>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}
