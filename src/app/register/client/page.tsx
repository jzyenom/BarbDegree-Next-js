"use client";

import { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/layouts/AuthLayout";
import AuthInput from "@/components/AuthInput";
import { Phone, Globe, MapPin, Home } from "lucide-react";

export default function ClientForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    whatsapp: "",
    mobile: "",
    country: "",
    state: "",
    address: "",
  });

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
      const errorMessage = (error as any)?.response?.data?.message || (error as any)?.response?.data?.error || "Failed to register. Please try again.";
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <AuthLayout
      title="Complete Your Profile"
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkText="Sign In"
    >
      <div className="w-full max-w-[480px] space-y-4">
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
