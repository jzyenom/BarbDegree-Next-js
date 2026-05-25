"use client";

import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/layouts/AuthLayout";
import AuthInput from "@/components/AuthInput";
import { Phone, Globe, MapPin, Home } from "lucide-react";

type RequestError = {
  response?: {
    data?: {
      message?: string;
      error?: string;
      exists?: boolean;
    };
  };
};


export default function ClientForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [formData, setFormData] = useState({
    whatsapp: "",
    mobile: "",
    country: "",
    state: "",
    address: "",
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.email) {
      router.replace("/login?mode=signup&role=client");
      return;
    }

    if (session.user.role && session.user.role !== "client") {
      router.replace("/register");
      return;
    }

    let mounted = true;

    
    const verifyRegistrationState = async () => {
      try {
        const response = await fetch("/api/client", { cache: "no-store" });
        const payload = (await response.json().catch(() => ({}))) as {
          exists?: boolean;
        };

        if (mounted && response.ok && payload.exists) {
          router.replace("/dashboard/client");
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

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  
  const validateForm = () => {
    const requiredFields = ['whatsapp', 'mobile', 'country', 'state', 'address'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]?.trim()) {
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
      const response = await axios.post<{ message: string }>("/api/client", formData);
      if (response.data.message === "Client registered successfully") {
        router.push("/dashboard/client");
      }
    } catch (error: unknown) {
      console.error("Error submitting client form", error);
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
      <div className="w-full max-w-[480px] space-y-4">
        {/* show the main heading */}
        <h1 className="text-[22px] font-bold text-center mt-2 mb-6">
          Client Information
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            name="whatsapp"
            type="text"
            placeholder="WhatsApp Number"
            icon={Phone}
            value={formData.whatsapp}
            onChange={handleChange}
          />
          <AuthInput
            name="mobile"
            type="text"
            placeholder="Mobile Number"
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
            name="address"
            type="text"
            placeholder="Address"
            icon={Home}
            value={formData.address}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-[#f96b06] text-white font-bold tracking-wide hover:bg-orange-600 transition-all"
          >
            Save & Continue
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
