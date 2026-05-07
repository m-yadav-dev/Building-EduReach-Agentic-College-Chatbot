import { ArrowLeft, GraduationCap, Link, Lock, Mail } from "lucide-react"
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser } from "../services/auth.service";
import { useState } from "react";
import { images } from "../data/content"; // static images for the login page background and other UI elements






const LoginPage = () => {

    const [password, setPassword] = useState(""); // define password state variable
    const [email, setEmail] = useState(""); // define email state variable
    const [loading, setLoading] =  useState(false); // define loading state variable to manage loading state during login process
    const { login } = useAuth(); // get login function from AuthContext to update authentication state after successful login
    const navigate = useNavigate(); // get navigate function from react-router-dom to programmatically navigate to different routes after login

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!email || !password) {
            toast.error("Please enter both email and password");
            return;
        }

        setLoading(true); // set loading state to true when login process starts to disable the login button and show loading state to user

        try {
            const data = await loginUser({
                email,
                password
            }) // data returned from loginUser service function which makes API call to backend for authentication and returns the response data containing token and user info if login is successful
            login(data.token) // if login is successful, call the login function from AuthContext to update the authentication state with the received token
            toast.success("Login successful");
            navigate("/"); // after successful login, navigate to the home page or dashboard page of the application
        }
        catch (error: any) { // catch any errors that occur during the login process, such as network errors or authentication errors, and display an error message to the user using toast notifications
            const errorMsg = error.response?.data?.message || "Login failed. Please try again.";
            toast.error(errorMsg);
        }
        finally {
            setLoading(false); // set loading state back to false after the login process is complete, regardless of whether it was successful or not, to re-enable the login button and allow the user to attempt login again if needed
        }

    }

    return (
        <div className="min-h-screen flex">
            <div className="hidden lg:block lg:w-1/2 relative">
                <img src={images.students} alt="Students" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-maroon/60 flex items-center justify-center">
                    <div className="text-center text-white p-8">
                        <GraduationCap className="w-16 h-16 mx-auto mb-4" />
                        <h2 className="font-heading text-4xl font-bold mb-2">EduReach</h2>
                        <p className="text-white/80">Your Gateway to Smarter Education</p>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-cream">
                <div className="w-full max-w-md">
                    <Link to="/" className="flex items-center gap-1 text-gray-500 hover:text-maroon transition-colors duration-200 mb-8">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Back to Home</span>
                    </Link>

                    <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-500 mb-8">Sign in to your EduReach account</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon transition-colors duration-200" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon transition-colors duration-200" />
                            </div>
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full bg-maroon text-white py-3 rounded-lg font-semibold hover:bg-maroon-dark disabled:opacity-50 transition-colors duration-200">
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-maroon font-medium hover:underline">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
