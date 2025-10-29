import React, { useState } from "react";
import { motion } from "framer-motion";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/config";

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });
  const [contactMethod, setContactMethod] = useState("phone");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      quote:
        '"Anonymous Feedback made gathering insights a breeze! I received honest feedback in no time. Highly recommended!"',
      author: "Sarah Mitchell",
      role: "Product Manager",
    },
    {
      quote:
        "\"The most transparent feedback platform I've used. My team's responses have been invaluable for growth.\"",
      author: "James Chen",
      role: "Team Lead",
    },
    {
      quote:
        '"Finally, a platform where people feel safe sharing their true thoughts. Game-changer!"',
      author: "Amara Okonkwo",
      role: "HR Director",
    },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.message.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let attachmentURL = null;

      if (file) {
        const fileRef = ref(storage, `attachments/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        attachmentURL = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, "feedback"), {
        subject: formData.subject,
        message: formData.message,
        attachment: attachmentURL,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setFormData({ subject: "", message: "" });
      setFile(null);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Floating gradient backgrounds */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse delay-2000"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-16"
        >
          {/* Logo */}
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg border-2 border-blue-400">
            <img src="/dclogo.png" alt="logo" />
          </div>
          <div>
            <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide">
              Welcome to
            </p>
            <span className="text-2xl font-bold text-gray-900">
              Dominion City Benin Anonymous Message Feedback
            </span>
          </div>
        </motion.div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch rounded-2xl overflow-hidden shadow-2xl">
          {/* Left Side - Testimonial Section with Background Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-[600px] md:h-[750px]"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1522158637959-30385a09e0da?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

            {/* Content - Logo and Testimonials */}
            <div className="relative h-full flex flex-col justify-between p-6 md:p-10">
              {/* Logo Placeholder - Top */}
              <div className="flex justify-start">
                <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border-3 border-blue-200">
                  <div className="text-center">
                    <img src="/dclogo.png" alt="logo" className="rounded-md" />
                  </div>
                </div>
              </div>

              {/* Testimonial - Bottom */}
              <div>
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-white text-2xl md:text-3xl font-bold leading-tight mb-6">
                    {testimonials[currentSlide].quote}
                  </p>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm"></div>
                    <div>
                      <p className="text-white font-semibold">
                        {testimonials[currentSlide].author}
                      </p>
                      <p className="text-blue-100 text-sm">
                        {testimonials[currentSlide].role}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Navigation and Indicators */}
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {testimonials.map((_, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`transition-all ${
                          idx === currentSlide
                            ? "w-8 h-2 bg-white"
                            : "w-2 h-2 bg-white/40"
                        }`}
                        whileHover={{ scale: 1.2 }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={prevSlide}
                      className="w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={nextSlide}
                      className="w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="h-[600px] md:h-[750px] flex items-center"
          >
            <div className="bg-white w-full h-full p-8 md:p-10 flex flex-col justify-center overflow-y-auto">
              {/* Form Header */}
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Let's join with us
                </h2>
                <p className="text-gray-600">
                  You can share or join with us if you'd like to hear from us
                </p>
              </div>

              {/* Contact Method Tabs */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {["Phone Number", "Email", "Social"].map((method) => (
                  <motion.button
                    key={method}
                    onClick={() =>
                      setContactMethod(method.toLowerCase().replace(" ", ""))
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      contactMethod === method.toLowerCase().replace(" ", "")
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {method}
                  </motion.button>
                ))}
              </div>

              {/* Success/Error Messages */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="bg-green-50 border-2 border-green-300 text-green-700 px-6 py-4 rounded-xl mb-6 flex items-center gap-3"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold">
                    Feedback submitted successfully!
                  </span>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="bg-red-50 border-2 border-red-300 text-red-700 px-6 py-4 rounded-xl mb-6"
                >
                  {error}
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Subject */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                    placeholder="Enter subject"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Message <span className="text-red-500">*</span>
                  </label>
                  <motion.textarea
                    whileFocus={{ scale: 1.01 }}
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 resize-none"
                    placeholder="Please describe your feedback..."
                    required
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label
                    htmlFor="attachment"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Attachment <span className="text-gray-500">(Optional)</span>
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="file"
                    id="attachment"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  {file && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-blue-600 mt-2 font-medium"
                    >
                      📎 {file.name}
                    </motion.p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition duration-200 flex items-center justify-center gap-2 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  }`}
                >
                  {loading ? (
                    <>
                      <motion.svg
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </motion.svg>
                      Submitting...
                    </>
                  ) : (
                    <>Continue</>
                  )}
                </motion.button>
              </form>

              {/* Help Text */}
              <div className="mt-6 text-center">
                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                  Need help?
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.3;
          }
        }
        .animate-pulse {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default FeedbackForm;
