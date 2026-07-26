"use client";

import { useState } from "react";
import { X, Mail, Lock, User, Shield, Check } from "lucide-react";
import type { UserRole } from "@/lib/types";
import toast from "react-hot-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; role: UserRole }) => void;
}

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("guest");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    const userData = {
      name: fullName || (role === "host" ? "John Doe (Host)" : "Jane Smith (Guest)"),
      email,
      role,
    };

    localStorage.setItem("staybnb_user", JSON.stringify(userData));
    localStorage.setItem("staybnb_user_role", role);
    toast.success(isSignUp ? "Account created successfully!" : "Logged in successfully!");
    onLoginSuccess(userData);
    onClose();
  };

  const handleQuickLogin = (demoRole: UserRole, demoName: string, demoEmail: string) => {
    const userData = {
      name: demoName,
      email: demoEmail,
      role: demoRole,
    };
    localStorage.setItem("staybnb_user", JSON.stringify(userData));
    localStorage.setItem("staybnb_user_role", demoRole);
    toast.success(`Logged in as ${demoName} (${demoRole})`);
    onLoginSuccess(userData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition text-slate-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-slate-900 text-base">
            {isSignUp ? "Sign up" : "Log in or sign up"}
          </h2>
          <div className="w-9" />
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Welcome to staybnb
          </h3>

          {/* Quick Demo Login Option */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold uppercase text-slate-500 block">
              Quick 1-Click Demo Login:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("guest", "Jane Smith", "guest@staybnb.com")}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 hover:bg-rose-50 hover:border-rose-300 transition text-center shadow-sm"
              >
                Guest Persona
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("host", "John Doe", "host@staybnb.com")}
                className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition text-center shadow-sm"
              >
                Host Persona
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:ring-rose-500 focus:border-rose-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:ring-rose-500 focus:border-rose-500"
                  required
                />
              </div>
            </div>

            {/* Persona Selection */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("guest")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    role === "guest"
                      ? "bg-rose-50 border-rose-500 text-rose-900"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  {role === "guest" && <Check className="w-3.5 h-3.5 text-rose-600" />} Guest
                </button>
                <button
                  type="button"
                  onClick={() => setRole("host")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    role === "host"
                      ? "bg-rose-50 border-rose-500 text-rose-900"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  {role === "host" && <Check className="w-3.5 h-3.5 text-rose-600" />} Host
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#ff385c] to-[#e31c5f] text-white rounded-xl font-bold text-sm hover:brightness-95 transition shadow-md mt-2"
            >
              Continue
            </button>
          </form>

          <div className="text-center pt-2 border-t text-xs text-slate-600">
            {isSignUp ? (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="font-bold text-rose-600 hover:underline"
                >
                  Log in
                </button>
              </span>
            ) : (
              <span>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="font-bold text-rose-600 hover:underline"
                >
                  Sign up
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
