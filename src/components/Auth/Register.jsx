import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const trimmedFullname = fullname.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (trimmedFullname.length < 3) {
      setError("Full Name must be at least 3 characters");
      return;
    }

    if (!trimmedEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (trimmedPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      // Call register with trimmed values
      await register(trimmedFullname, trimmedEmail, trimmedPassword);
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Register</h2>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded">
            {error}
          </div>
        )}

        <label className="block mb-2 font-semibold">Full Name</label>
        <input
          type="text"
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Your full name"
          required
          minLength={3}
        />

        <label className="block mb-2 font-semibold">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="you@example.com"
          required
        />

        <label className="block mb-2 font-semibold">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Your password"
          minLength={6}
          required
        />
        <p className="text-sm text-gray-500 mb-4">
          Password must be at least 6 characters.
        </p>

        <label className="block mb-2 font-semibold">Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`w-full border ${
            confirmPassword && password !== confirmPassword
              ? "border-red-500"
              : "border-gray-300"
          } rounded px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          placeholder="Confirm your password"
          minLength={6}
          required
        />

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded font-semibold transition"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
