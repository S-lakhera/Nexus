import { useState } from "react";
import { useNavigate } from "react-router"; 
import { useAuth } from "../hooks/useAuth.js"; 
import { Eye, EyeOff } from "lucide-react"; 
import logo from '../../../assets/Nexus-logo.jpg'


export default function SignupPage() {
  const navigate = useNavigate();
  
  // Destructure register instead of login
  const { register, isLoading, serverError, validationError, clearErrors } = useAuth();

  // Added "name" to the local state
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false); // Added toggle state

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    clearErrors(); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(formData);
  };

  return (
    <div className="flex min-h-screen w-full bg-primary text-primary transition-colors duration-200">
      
      {/* LEFT PANEL: Branding & Philosophy */}
      <div className="hidden w-1/2 flex-col items-center justify-center border-r border-border bg-primary p-12 md:flex">
        <div className="flex flex-col items-center max-w-sm text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-border bg-secondary/10 shadow-lg shadow-purple-500/10">
            <img 
              src={logo} 
              alt="Nexus Logo" 
              className="h-18 w-18 rounded-2xl text-accent animate-pulse" 
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight font-space">Nexus</h1>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400 font-jakarta">
            Structural minimalism and high-density information clarity for technical command centers.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: Operational Auth Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 md:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          
          <div className="mb-8">
            <h2 className="text-3xl font-semibold tracking-tight font-space">Request Access</h2>
            <p className="mt-2 text-sm text-zinc-400 font-jakarta">
              Initialize your credentials to join the network.
            </p>
          </div>

          {(validationError || serverError) && (
            <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400 font-jetbrains">
              ⚠️ Error: {validationError || serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* New Name Field */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-zinc-400 font-space">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full rounded-lg border border-border bg-secondary p-3 text-sm font-jakarta text-primary outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-zinc-400 font-space">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="developer@nexus.io"
                className="w-full rounded-lg border border-border bg-secondary p-3 text-sm font-jakarta text-primary outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-zinc-400 font-space">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-secondary py-3 pl-3 pr-10 text-sm font-jakarta text-primary outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-accent focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex w-full items-center justify-center rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-zinc-950 shadow-md transition-all hover:opacity-90 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 font-space"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-zinc-400 font-jakarta">
            Already have an account?{" "}
            <button 
              onClick={() => navigate("/login")} 
              className="font-medium text-accent hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}