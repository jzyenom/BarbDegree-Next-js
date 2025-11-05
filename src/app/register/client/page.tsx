"use client";

import { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/client", {
        ...formData,
        email: session?.user?.email,
      });
      router.push("/dashboard/client");
    } catch (error) {
      console.error("Error submitting client form", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto mt-10 p-8 bg-white shadow-lg rounded-xl space-y-4"
    >
      <h2 className="text-xl font-semibold text-center">
        Complete Your Client Profile
      </h2>
      {Object.keys(formData).map((key) => (
        <input
          key={key}
          name={key}
          placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
          value={(formData as never)[key]}
          onChange={handleChange}
          className="w-full border p-2 rounded-md focus:border-orange-500 outline-none"
        />
      ))}
      <button
        type="submit"
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-md"
      >
        Save & Continue
      </button>
    </form>
  );
}
