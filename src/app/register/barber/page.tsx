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

/**
 * AUTO-FUNCTION-COMMENT: BarberSignup
 * Purpose: Handles barber signup.
 * Line-by-line:
 * 1. Executes `const { data: session } = useSession();`.
 * 2. Executes `const router = useRouter();`.
 * 3. Executes `const [step, setStep] = useState(1);`.
 * 4. Executes `const [preview, setPreview] = useState<string | null>(null);`.
 * 5. Executes `const [formData, setFormData] = useState({`.
 * 6. Executes `whatsapp: "",`.
 * 7. Executes `mobile: "",`.
 * 8. Executes `country: "",`.
 * 9. Executes `state: "",`.
 * 10. Executes `nin: "",`.
 * 11. Executes `bio: "",`.
 * 12. Executes `address: "",`.
 * 13. Executes `exp: "",`.
 * 14. Executes `charge: "",`.
 * 15. Executes `image: null as File | null,`.
 * 16. Executes `bankName: "",`.
 * 17. Executes `accountNo: "",`.
 * 18. Executes `});`.
 * 19. Executes `const totalSteps = 4;`.
 * 20. Executes `const progress = (step / totalSteps) * 100;`.
 * 21. Executes `const handleChange = (`.
 * 22. Executes `e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>`.
 * 23. Executes `) => {`.
 * 24. Executes `const { name, value, files } = e.target as HTMLInputElement;`.
 * 25. Executes `if (files && files[0]) {`.
 * 26. Executes `setFormData({ ...formData, [name]: files[0] });`.
 * 27. Executes `const reader = new FileReader();`.
 * 28. Executes `reader.onloadend = () => setPreview(reader.result as string);`.
 * 29. Executes `reader.readAsDataURL(files[0]);`.
 * 30. Executes `} else {`.
 * 31. Executes `setFormData({ ...formData, [name]: value });`.
 * 32. Executes `}`.
 * 33. Executes `};`.
 * 34. Executes `const handleNext = () => setStep((prev) => Math.min(prev + 1, totalSteps));`.
 * 35. Executes `const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));`.
 * 36. Executes `const validateForm = () => {`.
 * 37. Executes `const requiredFields = ['whatsapp', 'mobile', 'country', 'state', 'nin', 'bio', 'address', 'exp', 'charge', 'bankName', 'accountNo'];`.
 * 38. Executes `for (const field of requiredFields) {`.
 * 39. Executes `if (!formData[field as keyof typeof formData]?.toString().trim()) {`.
 * 40. Executes `alert(\`${field.charAt(0).toUpperCase() + field.slice(1)} is required\`);`.
 * 41. Executes `return false;`.
 * 42. Executes `}`.
 * 43. Executes `}`.
 * 44. Executes `// Validate phone numbers`.
 * 45. Executes `const phoneRegex = /^\+?[\d\s\-\(\)]+$/;`.
 * 46. Executes `if (!phoneRegex.test(formData.whatsapp) || !phoneRegex.test(formData.mobile)) {`.
 * 47. Executes `alert("Please enter valid phone numbers");`.
 * 48. Executes `return false;`.
 * 49. Executes `}`.
 * 50. Executes `// Validate NIN (assume 11 digits)`.
 * 51. Executes `if (!/^\d{11}$/.test(formData.nin)) {`.
 * 52. Executes `alert("NIN must be 11 digits");`.
 * 53. Executes `return false;`.
 * 54. Executes `}`.
 * 55. Executes `// Validate account number (assume 10 digits)`.
 * 56. Executes `if (!/^\d{10}$/.test(formData.accountNo)) {`.
 * 57. Executes `alert("Account number must be 10 digits");`.
 * 58. Executes `return false;`.
 * 59. Executes `}`.
 * 60. Executes `return true;`.
 * 61. Executes `};`.
 * 62. Executes `const handleSubmit = async (e: React.FormEvent) => {`.
 * 63. Executes `e.preventDefault();`.
 * 64. Executes `if (!validateForm()) return;`.
 * 65. Executes `if (!session?.user?.email) {`.
 * 66. Executes `alert("Session expired. Please login again.");`.
 * 67. Executes `router.push("/login");`.
 * 68. Executes `return;`.
 * 69. Executes `}`.
 * 70. Executes `try {`.
 * 71. Executes `const formDataToSend = new FormData();`.
 * 72. Executes `Object.entries(formData).forEach(([key, value]) => {`.
 * 73. Executes `if (value) formDataToSend.append(key, value as any);`.
 * 74. Executes `});`.
 * 75. Executes `const response = await axios.post<{ message: string }>(`.
 * 76. Executes `"/api/barber",`.
 * 77. Executes `formDataToSend,`.
 * 78. Executes `{`.
 * 79. Executes `headers: { "Content-Type": "multipart/form-data" },`.
 * 80. Executes `}`.
 * 81. Executes `);`.
 * 82. Executes `if (response.data.message === "Barber registered successfully") {`.
 * 83. Executes `router.push("/dashboard/barber");`.
 * 84. Executes `}`.
 * 85. Executes `} catch (error: any) {`.
 * 86. Executes `console.error("Error submitting barber form", error);`.
 * 87. Executes `const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to register. Please try again.";`.
 * 88. Executes `alert(\`Error: ${errorMessage}\`);`.
 * 89. Executes `}`.
 * 90. Executes `};`.
 * 91. Executes `return (`.
 * 92. Executes `<AuthLayout`.
 * 93. Executes `title="Complete Your Profile"`.
 * 94. Executes `footerText="Already have an account?"`.
 * 95. Executes `footerLink="/barber/login"`.
 * 96. Executes `footerLinkText="Sign In"`.
 * 97. Executes `>`.
 * 98. Executes `{/* Progress Bar * /}`.
 * 99. Executes `<div className="w-full max-w-[480px] mx-auto mb-6">`.
 * 100. Executes `<div className="h-2 bg-gray-200 rounded-full overflow-hidden">`.
 * 101. Executes `<div`.
 * 102. Executes `className="h-2 bg-[#f96b06] rounded-full transition-all duration-500 ease-in-out"`.
 * 103. Executes `style={{ width: \`${progress}%\` }}`.
 * 104. Executes `/>`.
 * 105. Executes `</div>`.
 * 106. Executes `<p className="text-xs text-center text-[#9e6b47] mt-2 font-medium">`.
 * 107. Executes `Step {step} of {totalSteps} — {Math.round(progress)}% Complete`.
 * 108. Executes `</p>`.
 * 109. Executes `</div>`.
 * 110. Executes `<h1 className="text-[22px] font-bold text-center mt-2 mb-3">`.
 * 111. Executes `{step === 1`.
 * 112. Executes `? "Upload Image"`.
 * 113. Executes `: step === 2`.
 * 114. Executes `? "Personal Details"`.
 * 115. Executes `: step === 3`.
 * 116. Executes `? "Shop Details"`.
 * 117. Executes `: "Bank Details"}`.
 * 118. Executes `</h1>`.
 * 119. Executes `<form`.
 * 120. Executes `onSubmit={handleSubmit}`.
 * 121. Executes `className="w-full max-w-[480px] space-y-4 transition-all"`.
 * 122. Executes `>`.
 * 123. Executes `{/* Step 1: Upload Image * /}`.
 * 124. Executes `{step === 1 && (`.
 * 125. Executes `<div className="flex flex-col items-center space-y-3">`.
 * 126. Executes `<div className="relative w-40 h-40 rounded-full border-4 border-transparent bg-gradient-to-br from-green-300 to-teal-400 p-[3px] shadow-md">`.
 * 127. Executes `<div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">`.
 * 128. Executes `{preview ? (`.
 * 129. Executes `<img`.
 * 130. Executes `src={preview}`.
 * 131. Executes `alt="Profile preview"`.
 * 132. Executes `className="object-cover w-full h-full rounded-full"`.
 * 133. Executes `/>`.
 * 134. Executes `) : (`.
 * 135. Executes `<ImageIcon className="text-teal-400" size={72} />`.
 * 136. Executes `)}`.
 * 137. Executes `</div>`.
 * 138. Executes `<label`.
 * 139. Executes `htmlFor="image"`.
 * 140. Executes `className="absolute bottom-3 right-3 bg-[#f96b06] text-white rounded-full p-3 cursor-pointer shadow-lg hover:bg-orange-600 transition"`.
 * 141. Executes `>`.
 * 142. Executes `<ImageIcon size={18} />`.
 * 143. Executes `</label>`.
 * 144. Executes `<input`.
 * 145. Executes `id="image"`.
 * 146. Executes `type="file"`.
 * 147. Executes `name="image"`.
 * 148. Executes `accept="image/*"`.
 * 149. Executes `className="hidden"`.
 * 150. Executes `onChange={handleChange}`.
 * 151. Executes `/>`.
 * 152. Executes `</div>`.
 * 153. Executes `<p className="text-sm text-[#9e6b47]">`.
 * 154. Executes `Upload your profile image to begin`.
 * 155. Executes `</p>`.
 * 156. Executes `</div>`.
 * 157. Executes `)}`.
 * 158. Executes `{/* Step 2: Personal Details * /}`.
 * 159. Executes `{step === 2 && (`.
 * 160. Executes `<>`.
 * 161. Executes `<AuthInput`.
 * 162. Executes `name="whatsapp"`.
 * 163. Executes `type="text"`.
 * 164. Executes `placeholder="WhatsApp"`.
 * 165. Executes `icon={Phone}`.
 * 166. Executes `value={formData.whatsapp}`.
 * 167. Executes `onChange={handleChange}`.
 * 168. Executes `/>`.
 * 169. Executes `<AuthInput`.
 * 170. Executes `name="mobile"`.
 * 171. Executes `type="text"`.
 * 172. Executes `placeholder="Mobile"`.
 * 173. Executes `icon={Phone}`.
 * 174. Executes `value={formData.mobile}`.
 * 175. Executes `onChange={handleChange}`.
 * 176. Executes `/>`.
 * 177. Executes `<AuthInput`.
 * 178. Executes `name="country"`.
 * 179. Executes `type="text"`.
 * 180. Executes `placeholder="Country"`.
 * 181. Executes `icon={Globe}`.
 * 182. Executes `value={formData.country}`.
 * 183. Executes `onChange={handleChange}`.
 * 184. Executes `/>`.
 * 185. Executes `<AuthInput`.
 * 186. Executes `name="state"`.
 * 187. Executes `type="text"`.
 * 188. Executes `placeholder="State"`.
 * 189. Executes `icon={MapPin}`.
 * 190. Executes `value={formData.state}`.
 * 191. Executes `onChange={handleChange}`.
 * 192. Executes `/>`.
 * 193. Executes `<AuthInput`.
 * 194. Executes `name="nin"`.
 * 195. Executes `type="text"`.
 * 196. Executes `placeholder="NIN"`.
 * 197. Executes `icon={User}`.
 * 198. Executes `value={formData.nin}`.
 * 199. Executes `onChange={handleChange}`.
 * 200. Executes `/>`.
 * 201. Executes `<AuthInput`.
 * 202. Executes `name="bio"`.
 * 203. Executes `type="text"`.
 * 204. Executes `placeholder="Short Bio"`.
 * 205. Executes `icon={FileText}`.
 * 206. Executes `value={formData.bio}`.
 * 207. Executes `onChange={handleChange}`.
 * 208. Executes `/>`.
 * 209. Executes `<AuthInput`.
 * 210. Executes `name="address"`.
 * 211. Executes `type="text"`.
 * 212. Executes `placeholder="Address"`.
 * 213. Executes `icon={Home}`.
 * 214. Executes `value={formData.address}`.
 * 215. Executes `onChange={handleChange}`.
 * 216. Executes `/>`.
 * 217. Executes `</>`.
 * 218. Executes `)}`.
 * 219. Executes `{/* Step 3: Shop Details * /}`.
 * 220. Executes `{step === 3 && (`.
 * 221. Executes `<>`.
 * 222. Executes `<AuthInput`.
 * 223. Executes `name="exp"`.
 * 224. Executes `type="text"`.
 * 225. Executes `placeholder="Years of Experience"`.
 * 226. Executes `icon={Briefcase}`.
 * 227. Executes `value={formData.exp}`.
 * 228. Executes `onChange={handleChange}`.
 * 229. Executes `/>`.
 * 230. Executes `<AuthInput`.
 * 231. Executes `name="charge"`.
 * 232. Executes `type="text"`.
 * 233. Executes `placeholder="Service Charge"`.
 * 234. Executes `icon={DollarSign}`.
 * 235. Executes `value={formData.charge}`.
 * 236. Executes `onChange={handleChange}`.
 * 237. Executes `/>`.
 * 238. Executes `</>`.
 * 239. Executes `)}`.
 * 240. Executes `{/* Step 4: Bank Details * /}`.
 * 241. Executes `{step === 4 && (`.
 * 242. Executes `<>`.
 * 243. Executes `<AuthInput`.
 * 244. Executes `name="bankName"`.
 * 245. Executes `type="text"`.
 * 246. Executes `placeholder="Bank Name"`.
 * 247. Executes `icon={Building}`.
 * 248. Executes `value={formData.bankName}`.
 * 249. Executes `onChange={handleChange}`.
 * 250. Executes `/>`.
 * 251. Executes `<AuthInput`.
 * 252. Executes `name="accountNo"`.
 * 253. Executes `type="text"`.
 * 254. Executes `placeholder="Account Number"`.
 * 255. Executes `icon={CreditCard}`.
 * 256. Executes `value={formData.accountNo}`.
 * 257. Executes `onChange={handleChange}`.
 * 258. Executes `/>`.
 * 259. Executes `</>`.
 * 260. Executes `)}`.
 * 261. Executes `{/* Navigation Buttons * /}`.
 * 262. Executes `<div className="pt-6 space-y-3">`.
 * 263. Executes `{step > 1 && (`.
 * 264. Executes `<button`.
 * 265. Executes `type="button"`.
 * 266. Executes `onClick={handleBack}`.
 * 267. Executes `className="w-full h-12 rounded-xl border border-[#f96b06] text-[#f96b06] font-bold hover:bg-[#fff5ef] transition-all"`.
 * 268. Executes `>`.
 * 269. Executes `<ArrowLeft size={18} className="inline-block mr-2" />`.
 * 270. Executes `Back`.
 * 271. Executes `</button>`.
 * 272. Executes `)}`.
 * 273. Executes `{step < totalSteps ? (`.
 * 274. Executes `<button`.
 * 275. Executes `type="button"`.
 * 276. Executes `onClick={handleNext}`.
 * 277. Executes `className="w-full h-12 rounded-xl bg-[#f96b06] text-white font-bold tracking-wide hover:bg-orange-600 transition-all"`.
 * 278. Executes `>`.
 * 279. Executes `Next <ArrowRight size={18} className="inline-block ml-2" />`.
 * 280. Executes `</button>`.
 * 281. Executes `) : (`.
 * 282. Executes `<button`.
 * 283. Executes `type="submit"`.
 * 284. Executes `className="w-full h-12 rounded-xl bg-[#f96b06] text-[#fcfaf8] text-base font-bold tracking-wide"`.
 * 285. Executes `>`.
 * 286. Executes `Save & Continue`.
 * 287. Executes `</button>`.
 * 288. Executes `)}`.
 * 289. Executes `</div>`.
 * 290. Executes `</form>`.
 * 291. Executes `</AuthLayout>`.
 * 292. Executes `);`.
 */
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
      router.replace("/register");
      return;
    }

    let mounted = true;

    const verifyRegistrationState = async () => {
      try {
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

  /**
   * AUTO-FUNCTION-COMMENT: handleChange
   * Purpose: Handles handle change.
   * Line-by-line:
   * 1. Executes `const { name, value, files } = e.target as HTMLInputElement;`.
   * 2. Executes `if (files && files[0]) {`.
   * 3. Executes `setFormData({ ...formData, [name]: files[0] });`.
   * 4. Executes `const reader = new FileReader();`.
   * 5. Executes `reader.onloadend = () => setPreview(reader.result as string);`.
   * 6. Executes `reader.readAsDataURL(files[0]);`.
   * 7. Executes `} else {`.
   * 8. Executes `setFormData({ ...formData, [name]: value });`.
   * 9. Executes `}`.
   */
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

  /**
   * AUTO-FUNCTION-COMMENT: handleNext
   * Purpose: Handles handle next.
   * Line-by-line:
   * 1. Executes `setStep((prev) => Math.min(prev + 1, totalSteps))`.
   */
  const handleNext = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  /**
   * AUTO-FUNCTION-COMMENT: handleBack
   * Purpose: Handles handle back.
   * Line-by-line:
   * 1. Executes `setStep((prev) => Math.max(prev - 1, 1))`.
   */
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  /**
   * AUTO-FUNCTION-COMMENT: validateForm
   * Purpose: Handles validate form.
   * Line-by-line:
   * 1. Executes `const requiredFields = ['whatsapp', 'mobile', 'country', 'state', 'nin', 'bio', 'address', 'exp', 'charge', 'bankName', 'accountNo'];`.
   * 2. Executes `for (const field of requiredFields) {`.
   * 3. Executes `if (!formData[field as keyof typeof formData]?.toString().trim()) {`.
   * 4. Executes `alert(\`${field.charAt(0).toUpperCase() + field.slice(1)} is required\`);`.
   * 5. Executes `return false;`.
   * 6. Executes `}`.
   * 7. Executes `}`.
   * 8. Executes `const phoneRegex = /^\+?[\d\s\-\(\)]+$/;`.
   * 9. Executes `if (!phoneRegex.test(formData.whatsapp) || !phoneRegex.test(formData.mobile)) {`.
   * 10. Executes `alert("Please enter valid phone numbers");`.
   * 11. Executes `return false;`.
   * 12. Executes `}`.
   * 13. Executes `if (!/^\d{11}$/.test(formData.nin)) {`.
   * 14. Executes `alert("NIN must be 11 digits");`.
   * 15. Executes `return false;`.
   * 16. Executes `}`.
   * 17. Executes `if (!/^\d{10}$/.test(formData.accountNo)) {`.
   * 18. Executes `alert("Account number must be 10 digits");`.
   * 19. Executes `return false;`.
   * 20. Executes `}`.
   * 21. Executes `return true;`.
   */
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

  /**
   * AUTO-FUNCTION-COMMENT: handleSubmit
   * Purpose: Handles handle submit.
   * Line-by-line:
   * 1. Executes `e.preventDefault();`.
   * 2. Executes `if (!validateForm()) return;`.
   * 3. Executes `if (!session?.user?.email) {`.
   * 4. Executes `alert("Session expired. Please login again.");`.
   * 5. Executes `router.push("/login");`.
   * 6. Executes `return;`.
   * 7. Executes `}`.
   * 8. Executes `try {`.
   * 9. Executes `const formDataToSend = new FormData();`.
   * 10. Executes `Object.entries(formData).forEach(([key, value]) => {`.
   * 11. Executes `if (value) formDataToSend.append(key, value as any);`.
   * 12. Executes `});`.
   * 13. Executes `const response = await axios.post<{ message: string }>(`.
   * 14. Executes `"/api/barber",`.
   * 15. Executes `formDataToSend,`.
   * 16. Executes `{`.
   * 17. Executes `headers: { "Content-Type": "multipart/form-data" },`.
   * 18. Executes `}`.
   * 19. Executes `);`.
   * 20. Executes `if (response.data.message === "Barber registered successfully") {`.
   * 21. Executes `router.push("/dashboard/barber");`.
   * 22. Executes `}`.
   * 23. Executes `} catch (error: any) {`.
   * 24. Executes `console.error("Error submitting barber form", error);`.
   * 25. Executes `const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to register. Please try again.";`.
   * 26. Executes `alert(\`Error: ${errorMessage}\`);`.
   * 27. Executes `}`.
   */
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
