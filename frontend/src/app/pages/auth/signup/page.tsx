"use client";
import { useState } from "react";
import axios from "axios";
import axiosInstance from "../../../utils/axiosInstance";
import Layout from "../../../components/layout";
import { useRouter } from "next/navigation";

enum UserRole {
  Student = "student",
  Instructor = "instructor",
  Admin = "admin",
}

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.Student);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/auth/signup', { name, email, password, role });
      if (response.status === 201) {
        const user = response.data;
        console.log("Sign-up response data:", user);
        alert(`Sign-up successful! Welcome ${name}, please check your email to verify your account`);
        router.push("/pages/auth/login");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 409) {
        alert("Email already taken");
      } else {
        console.error("Sign-up failed", error);
        alert("Sign-up failed");
      }
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
        <h1 className="text-4xl font-bold text-white mb-8">Sign Up</h1>
        <form onSubmit={handleSignUp} className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 text-gray-900 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 text-gray-900 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 text-gray-900 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-4 py-2 text-gray-900 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value={UserRole.Student}>Student</option>
              <option value={UserRole.Instructor}>Instructor</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
