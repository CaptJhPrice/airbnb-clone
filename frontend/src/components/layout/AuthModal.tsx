"use client";

import { useState } from "react";
import { X, Mail, Lock, User, Check, AlertCircle } from "lucide-react";
import type { UserRole } from "@/lib/types";
import toast from "react-hot-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; role: UserRole }) => void;
}

interface RegisteredUser {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

const REGISTERED_USERS_KEY = "staybnb_registered_users";

function getRegisteredUsers(): RegisteredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    return raw ? JSON.parse(raw) : [
      { name: "Jane Smith", email: "guest@staybnb.com", password: "password123", role: "guest" },
      { name: "John Doe", email: "host@staybnb.com", password: "password123", role: "host" }
    ];
  } catch {
    return [];
  }
}

function saveRegisteredUser(user: RegisteredUser) {
  if (typeof window === "undefined") return;
  try {
    const existing = getRegisteredUsers();
    const updated = [user, ...existing.filter((u) => u.email.toLowerCase() !== user.email.toLowerCase())];
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save registered user:", e);
  }
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
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      toast.error("Please enter email and password");
      return;
    }

    const registeredUsers = getRegisteredUsers();

    if (isSignUp) {
      // Check if email already exists
      const existing = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        toast.error("An account with this email already exists. Please log in!");
        setIsSignUp(false);
        return;
      }

      const newUser: RegisteredUser = {
        name: fullName.trim() || (role === "host" ? "Host Persona" : "Guest Persona"),
        email: cleanEmail,
        password,
        role,
      };

      saveRegisteredUser(newUser);

      const sessionData = { name: newUser.name, email: newUser.email, role: newUser.role };
      localStorage.setItem("staybnb_user", JSON.stringify(sessionData));
      localStorage.setItem("staybnb_user_role", newUser.role);
      toast.success("Account created successfully!");
      onLoginSuccess(sessionData);
      onClose();
    } else {
      // Log In Flow
      const foundUser = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
      
      if (!foundUser) {
        // Auto register if logging in with new credentials
        const newUser: RegisteredUser = {
          name: fullName.trim() || (cleanEmail.split("@")[0] || "User"),
          email: cleanEmail,
          password,
          role,
        };
        saveRegisteredUser(newUser);
        const sessionData = { name: newUser.name, email: newUser.email, role: newUser.role };
        localStorage.setItem("staybnb_user", JSON.stringify(sessionData));
        localStorage.setItem("staybnb_user_role", newUser.role);
        toast.success(`Welcome ${newUser.name}! Account registered.`);
        onLoginSuccess(sessionData);
        onClose();
        return;
      }

      if (foundUser.password && foundUser.password !== password) {
        toast.error("Incorrect password. Please try again!");
        return;
      }

      const sessionData = { name: foundUser.name, email: foundUser.email, role: foundUser.role };
      localStorage.setItem("staybnb_user", JSON.stringify(sessionData));
      localStorage.setItem("staybnb_user_role", foundUser.role);
      toast.success(`Welcome back, ${foundUser.name}!`);
      onLoginSuccess(sessionData);
      onClose();
    }
  };

  const handleQuickLogin = (demoRole: UserRole, demoName: string, demoEmail: string) => {
    const userData = {
      name: demoName,
      email: demoEmail,
      role: demoRole,
    };
    saveRegisteredUser({ name: demoName, email: demoEmail, password: "password123", role: demoRole });
    localStorage.setItem("staybnb_user", JSON.stringify(userData));
    localStorage.setItem("staybnb_user_role", demoRole);
    toast.success(`Logged in as ${demoName} (${demoRole})`);
    onLoginSuccess(userData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b dark:border-slate-800 px-6 py-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-slate-900 dark:text-white text-base">
            {isSignUp ? "Sign up" : "Log in or sign up"}
          </h2>
          <div className="w-9" />
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome to staybnb
          </h3>

          {/* Quick Demo Login Option */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 block">
              Quick 1-Click Demo Login:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("guest", "Jane Smith", "guest@staybnb.com")}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 transition text-center shadow-sm"
              >
                Guest Persona
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("host", "John Doe", "host@staybnb.com")}
                className="px-3 py-2 bg-slate-900 dark:bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-rose-700 transition text-center shadow-sm"
              >
                Host Persona
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-rose-500 focus:border-rose-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-rose-500 focus:border-rose-500"
                  required
                />
              </div>
            </div>

            {/* Persona Selection */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("guest")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    role === "guest"
                      ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {role === "guest" && <Check className="w-3.5 h-3.5 text-rose-600" />} Guest
                </button>
                <button
                  type="button"
                  onClick={() => setRole("host")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    role === "host"
                      ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
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
              {isSignUp ? "Create Account" : "Log In"}
            </button>
          </form>

          <div className="text-center pt-2 border-t dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
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
