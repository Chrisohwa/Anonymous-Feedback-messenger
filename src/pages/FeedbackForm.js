import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { httpsCallable } from "firebase/functions";
import { db, storage, functions } from "../firebase/config";

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
  const [showAuthModal, setShowAuthModal] = useState(null);
  const [authFormData, setAuthFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  

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
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (selectedFile.size > maxSize) {
        setError("File size must be less than 10MB");
        e.target.value = ''; // Clear the input
        return;
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        setError("File type not supported. Please upload images, PDF, or office documents.");
        e.target.value = ''; // Clear the input
        return;
      }

      setFile(selectedFile);
      setError(""); // Clear any previous errors
    }
  };

  const removeFile = () => {
    setFile(null);
    // Clear the file input
    const fileInput = document.getElementById('attachment');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleAuthChange = (e) => {
    setAuthFormData({
      ...authFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.subject.trim() || !formData.message.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let attachmentURL = null;

      // Upload file if exists
      if (file) {
        try {
          const fileRef = ref(storage, `attachments/${Date.now()}_${file.name}`);
          const uploadTask = await uploadBytes(fileRef, file);
          attachmentURL = await getDownloadURL(uploadTask.ref);
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
          setError("Failed to upload file. Please try again or use a smaller file.");
          setLoading(false);
          return;
        }
      }

      // Add feedback to Firestore
      const docRef = await addDoc(collection(db, "feedback"), {
        subject: formData.subject,
        message: formData.message,
        attachment: attachmentURL,
        createdAt: serverTimestamp(),
      });

      // Send email notification using Firebase Function
      try {
        const sendNotification = httpsCallable(functions, 'sendFeedbackNotification');
        await sendNotification({
          subject: formData.subject,
          message: formData.message,
          attachment: attachmentURL,
          createdAt: new Date().toLocaleString(),
        });
      } catch (notificationError) {
        console.error("Notification error:", notificationError);
        // Don't fail the whole submission if notification fails
        // Just log it and continue
      }

      // Success
      setSuccess(true);
      setFormData({ subject: "", message: "" });
      setFile(null);

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (
      showAuthModal === "register" &&
      authFormData.password !== authFormData.confirmPassword
    ) {
      alert("Passwords do not match!");
      return;
    }
    console.log(
      `${showAuthModal === "login" ? "Login" : "Register"} attempt:`,
      authFormData
    );
    alert(
      `${showAuthModal === "login" ? "Login" : "Registration"} successful!`
    );
    setShowAuthModal(null);
    setAuthFormData({ email: "", password: "", confirmPassword: "" });
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
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse"></div>
      <div
        className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-16"
        >
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

        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 gap-0 items-stretch rounded-2xl overflow-hidden shadow-2xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-[400px] md:h-[750px]"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1522158637959-30385a09e0da?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

            <div className="relative h-full flex flex-col justify-between p-6 md:p-10">
              <div className="hidden justify-start md:flex">
                <div className=" w-16 h-16 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border-3 border-blue-200">
                  <img
                    className="rounded-lg sm:hidden md:block"
                    src="/dclogo.png"
                    alt="logo"
                  />
                </div>
              </div>

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

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="min-h-screen md:h-[750px] flex items-center"
          >
            <div className="bg-white w-full h-full p-8 md:p-10 flex flex-col justify-center overflow-y-auto">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Welcome Dear Anonymous
                </h2>
                <p className="text-gray-600">
                  Share your thoughts or your contacts if you'd like to hear
                  from us
                </p>
              </div>

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

              <form onSubmit={handleSubmit} className="space-y-5">
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
                    <>Submit</>
                  )}
                </motion.button>
              </form>

              <div className="my-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <motion.button
                  onClick={() => navigate("/login")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="py-3 px-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition duration-200"
                >
                  Sign In
                </motion.button>
                <motion.button
                  onClick={() => setShowAuthModal("register")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="py-3 px-4 bg-blue-50 border-2 border-blue-300 text-blue-600 font-semibold rounded-xl hover:bg-blue-100 transition duration-200"
                >
                  Sign Up
                </motion.button>
              </div>

              <div className="text-center">
                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                  Need help?
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {showAuthModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowAuthModal(null)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {showAuthModal === "login" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-gray-600 text-sm">
                {showAuthModal === "login"
                  ? "Sign in to your account to continue"
                  : "Join us and start sharing feedback"}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="email"
                  name="email"
                  value={authFormData.email}
                  onChange={handleAuthChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="password"
                  name="password"
                  value={authFormData.password}
                  onChange={handleAuthChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>

              {showAuthModal === "register" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="password"
                    name="confirmPassword"
                    value={authFormData.confirmPassword}
                    onChange={handleAuthChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                    placeholder="••••••••"
                    required
                  />
                </div>
              )}

              {showAuthModal === "login" && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition duration-200 mt-6"
              >
                {showAuthModal === "login" ? "Sign In" : "Create Account"}
              </motion.button>

              <button
                type="button"
                onClick={() => setShowAuthModal(null)}
                className="w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Cancel
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
              {showAuthModal === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setShowAuthModal("register")}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setShowAuthModal("login")}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

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
      `}</style>
    </div>
  );
};

export default FeedbackForm;
