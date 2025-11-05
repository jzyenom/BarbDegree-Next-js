"use client";

import { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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

export default function BarberSignup() {
  const { data: session } = useSession();
  const router = useRouter();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value as any);
      });
      if (session?.user?.email)
        formDataToSend.append("email", session.user.email);

      await axios.post("/api/barber", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      router.push("/dashboard/barber");
    } catch (error) {
      console.error("Error submitting barber form", error);
    }
  };

  return (
    <AuthLayout
      title="Complete Your Profile"
      footerText="Already have an account?"
      footerLink="/barber/login"
      footerLinkText="Sign In"
    >
      {/* Progress Bar */}
      <div className="w-full max-w-[480px] mx-auto mb-6">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-2 bg-[#f96b06] rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-center text-[#9e6b47] mt-2 font-medium">
          Step {step} of {totalSteps} — {Math.round(progress)}% Complete
        </p>
      </div>

      <h1 className="text-[22px] font-bold text-center mt-2 mb-3">
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
        className="w-full max-w-[480px] space-y-4 transition-all"
      >
        {/* Step 1: Upload Image */}
        {step === 1 && (
          <div className="flex flex-col items-center space-y-3">
            <div className="relative w-40 h-40 rounded-full border-4 border-transparent bg-gradient-to-br from-green-300 to-teal-400 p-[3px] shadow-md">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile preview"
                    className="object-cover w-full h-full rounded-full"
                  />
                ) : (
                  <ImageIcon className="text-teal-400" size={72} />
                )}
              </div>
              <label
                htmlFor="image"
                className="absolute bottom-3 right-3 bg-[#f96b06] text-white rounded-full p-3 cursor-pointer shadow-lg hover:bg-orange-600 transition"
              >
                <ImageIcon size={18} />
              </label>
              <input
                id="image"
                type="file"
                name="image"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
              />
            </div>
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
        <div className="pt-6 space-y-3">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="w-full h-12 rounded-xl border border-[#f96b06] text-[#f96b06] font-bold hover:bg-[#fff5ef] transition-all"
            >
              <ArrowLeft size={18} className="inline-block mr-2" />
              Back
            </button>
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="w-full h-12 rounded-xl bg-[#f96b06] text-white font-bold tracking-wide hover:bg-orange-600 transition-all"
            >
              Next <ArrowRight size={18} className="inline-block ml-2" />
            </button>
          ) : (
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#f96b06] text-[#fcfaf8] text-base font-bold tracking-wide"
            >
              Save & Continue
            </button>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}
