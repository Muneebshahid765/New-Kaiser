"use client";

import React, { useState } from "react";
import { Phone, Mail, MapPin, Send, HelpCircle, AlertCircle } from "lucide-react";
import { modals } from "@/hooks/store/useModalStore"; // Adjust import path if needed
import { useSubmitContactForm } from "@/app/features/public/contact/contact.hooks";
import { contactFormSchema, type ContactFormValues } from "@/app/features/public/contact/contact.types";

const FAQS = [
  {
    question: "What are your business hours?",
    answer: "Our team operates Monday to Friday, 8:00 AM to 5:00 PM WAT. Procurement inquiries are typically reviewed within 2 business hours.",
  },
  {
    question: "How can I track my order status?",
    answer: "You can track your order live via your account dashboard or by referencing your tracking ID sent in the confirmation email.",
  },
  {
    question: "Do you offer international shipping?",
    answer: "We primarily support domestic and regional logistics across Central and West Africa, with dedicated freight options for international clients.",
  },
  {
    question: "What payment and billing options are available?",
    answer: "We support major credit cards, SWIFT/SEPA bank wire transfers, corporate invoicing, and integrated mobile payment gateways.",
  },
];

const CONTACT_METHODS = [
  {
    icon: <Phone className="w-5 h-5 text-[#b5976a]" />,
    title: "Phone Support",
    detail: "+44 7742176520",
    subtext: "Mon–Fri, 8am–5pm WAT",
  },
  {
    icon: <Mail className="w-5 h-5 text-[#b5976a]" />,
    title: "Email Inquiries",
    detail: "info@africakaiser.com",
    subtext: "24/7 client support desk",
  },
  {
    icon: <MapPin className="w-5 h-5 text-[#b5976a]" />,
    title: "Headquarters",
    detail: "56 Torridge Road",
    subtext: "Luanda, Angola",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormValues>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ContactFormValues, string>>>({});
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // React Query Mutation
  const { mutate: submitContact, isPending } = useSubmitContactForm();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name as keyof ContactFormValues]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side Zod validation
    const validationResult = contactFormSchema.safeParse(formData);

  if (!validationResult.success) {
  const fieldErrors = validationResult.error.flatten().fieldErrors;
  
  // Extract first error message per field
  const formattedErrors: Partial<Record<keyof ContactFormValues, string>> = {};
  for (const key in fieldErrors) {
    const k = key as keyof ContactFormValues;
    if (fieldErrors[k]?.[0]) {
      formattedErrors[k] = fieldErrors[k]![0];
    }
  }

  setFieldErrors(formattedErrors);

  modals.alert({
    title: "Validation Error",
    description: "Please review the highlighted fields before submitting.",
    variant: "warning",
  });
  return;
}

    setFieldErrors({});

    // API Call
    submitContact(formData, {
      onSuccess: (res) => {
        modals.alert({
          title: "Message Dispatched",
          description: res.message || "Thank you for reaching out. Our team will get back to you shortly.",
          variant: "success",
        });
        setFormData({ name: "", email: "", phone: "", message: "" });
      },
      onError: (err: any) => {
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to dispatch your query. Please try again later.";

        modals.alert({
          title: "Submission Error",
          description: errorMsg,
          variant: "danger",
        });
      },
    });
  };

  return (
    <>
    
      <div className="min-h-screen bg-[#faf8f5] py-12 sm:py-20 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-[1280px] mx-auto bg-white rounded-3xl shadow-[0_20px_60px_rgba(11,31,54,0.06)] border border-[#e8dfd1] overflow-hidden grid lg:grid-cols-12">
          
          {/* ─── Left Section: Information & FAQ ──────────────────────── */}
          <div className="lg:col-span-5 bg-[#f5efe6] p-8 sm:p-12 border-b lg:border-b-0 lg:border-r border-[#e8dfd1] flex flex-col justify-between">
            <div>
              <div className="mb-8">
                <span className="text-xs uppercase tracking-[0.25em] text-[#b5976a] font-bold block mb-2">
                  Client Desk
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0b1f36] leading-tight">
                  Let’s Build Solutions Together.
                </h1>
                <p className="text-[#5a6275] text-sm sm:text-base mt-3 leading-relaxed">
                  Have inquiries regarding procurement, active orders, or strategic partnerships? Our dedicated team is at your disposal.
                </p>
              </div>

              {/* Contact Information Cards */}
              <div className="space-y-4 mb-10">
                {CONTACT_METHODS.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white/80 border border-[#e8dfd1]/60 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-2.5 rounded-xl bg-[#f5efe6] flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#b5976a] m-0">
                        {item.title}
                      </p>
                      <p className="text-sm font-bold text-[#0b1f36] m-0 mt-0.5">
                        {item.detail}
                      </p>
                      <p className="text-xs text-[#717b91] m-0 mt-0.5">
                        {item.subtext}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Embedded FAQ Accordion */}
            <div className="bg-white rounded-2xl p-6 border border-[#e8dfd1] shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-[#0b1f36]">
                <HelpCircle size={20} className="text-[#b5976a]" />
                <h3 className="text-base font-bold m-0">Quick Guidance</h3>
              </div>

              <div className="space-y-2">
                {FAQS.map((faq, index) => {
                  const isActive = activeFaq === index;
                  return (
                    <div
                      key={index}
                      className="border border-[#e8dfd1]/80 rounded-xl overflow-hidden transition-all duration-200"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveFaq(isActive ? null : index)}
                        className="w-full px-4 py-3 text-left text-xs sm:text-sm font-semibold text-[#0b1f36] flex justify-between items-center bg-[#faf8f5] hover:bg-[#f5efe6] transition-colors"
                      >
                        <span>{faq.question}</span>
                        <span className="text-[#b5976a] font-bold ml-2">
                          {isActive ? "−" : "+"}
                        </span>
                      </button>
                      {isActive && (
                        <div className="px-4 py-3 bg-white text-xs text-[#5a6275] leading-relaxed border-t border-[#e8dfd1]/60">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─── Right Section: Form ──────────────────────────────────── */}
          <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0b1f36]">
                Send Us a Message
              </h2>
              <p className="text-[#717b91] text-sm mt-1">
                Fill out the required information below. Fields marked with an asterisk (<span className="text-red-500">*</span>) are mandatory.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Full Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-bold uppercase tracking-wider text-[#0b1f36] mb-2"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="e.g., Jane Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3.5 rounded-xl border ${
                    fieldErrors.name
                      ? "border-red-400 bg-red-50/20"
                      : "border-[#e8dfd1] bg-[#faf8f5] focus:border-[#b5976a]"
                  } text-sm text-[#0b1f36] placeholder-[#a0a8b8] outline-none transition-all focus:bg-white focus:ring-4 focus:ring-[#b5976a]/10`}
                />
                {fieldErrors.name && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.name}
                  </p>
                )}
              </div>

              {/* Email & Phone */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold uppercase tracking-wider text-[#0b1f36] mb-2"
                  >
                    Work Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3.5 rounded-xl border ${
                      fieldErrors.email
                        ? "border-red-400 bg-red-50/20"
                        : "border-[#e8dfd1] bg-[#faf8f5] focus:border-[#b5976a]"
                    } text-sm text-[#0b1f36] placeholder-[#a0a8b8] outline-none transition-all focus:bg-white focus:ring-4 focus:ring-[#b5976a]/10`}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-bold uppercase tracking-wider text-[#0b1f36] mb-2"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="+244 912 345 678"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3.5 rounded-xl border ${
                      fieldErrors.phone
                        ? "border-red-400 bg-red-50/20"
                        : "border-[#e8dfd1] bg-[#faf8f5] focus:border-[#b5976a]"
                    } text-sm text-[#0b1f36] placeholder-[#a0a8b8] outline-none transition-all focus:bg-white focus:ring-4 focus:ring-[#b5976a]/10`}
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {fieldErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-xs font-bold uppercase tracking-wider text-[#0b1f36] mb-2"
                >
                  Message / Requirements <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Provide brief context regarding your request or procurement details..."
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full px-4 py-3.5 rounded-xl border ${
                    fieldErrors.message
                      ? "border-red-400 bg-red-50/20"
                      : "border-[#e8dfd1] bg-[#faf8f5] focus:border-[#b5976a]"
                  } text-sm text-[#0b1f36] placeholder-[#a0a8b8] outline-none transition-all focus:bg-white focus:ring-4 focus:ring-[#b5976a]/10 resize-none`}
                />
                {fieldErrors.message && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 px-6 bg-[#b5976a] hover:bg-[#9e8156] active:bg-[#8b7048] text-white font-bold text-sm rounded-xl shadow-[0_8px_20px_rgba(181,151,106,0.25)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#d8ccba] disabled:shadow-none disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing Request...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Inquiry
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </>
  );
}