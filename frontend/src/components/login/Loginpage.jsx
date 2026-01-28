// import React from "react";
// import logo from "../../assets/logo.png";
// import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "./login.css";
// import { useNavigate } from "react-router-dom";
// import { Authdata } from "../../Utils/Authprovider";
// import { Apisignin } from "../../Api/Loginauth";
// import { jwtDecode } from "jwt-decode";
// import { LS } from "../../Utils/Resuse";

// export default function LoginPage() {
//   const navigate = useNavigate();
//   const { SetStatedata } = Authdata();

//   // Only fetch IP info, do not use credentialResponse here
//   const getIpInfo = async () => {
//     try {
//       // Example: fetch public IP from an API
//       const publicIpRes = await fetch("https://api64.ipify.org?format=json");
//       const publicIpData = await publicIpRes.json();
//       // For local IP, you may use a placeholder or a library if needed
//       return { publicIp: publicIpData.ip, localIp: null };
//     } catch (err) {
//       console.error("Error fetching IP info:", err);
//       return { publicIp: null, localIp: null };
//     }
//   }
//   const validateIp = (userIp, currentIps) => {
//     if (!userIp) {
//       console.log("No IP validation needed - IP not present in response");
//       return true;
//     }
    
//     console.log("Performing IP validation:");
//     console.log("User IP from response:", userIp);
//     console.log("Current Public IP:", currentIps.publicIp);
//     console.log("Current Local IP:", currentIps.localIp);
    
//     const matchesPublic = currentIps.publicIp === userIp;
//     const matchesLocal = currentIps.localIp === userIp;
    
//     console.log("Matches public IP:", matchesPublic);
//     console.log("Matches local IP:", matchesLocal);
    
//     return matchesPublic || matchesLocal;
//   };

// const handleGoogleLogin = async (credentialResponse) => {
//   try {
//     console.log("Starting Google login process...");

//     // First get the current IP information
//     const currentIps = await getIpInfo();
//     console.log("Retrieved current IPs:", currentIps);

//     // Decode Google JWT
//     let userDecode = jwtDecode(credentialResponse.credential);
//     console.log("Google credentials decoded:", {
//       name: userDecode.name,
//       email: userDecode.email
//     });

//     // Call backend - this will throw an error if user is not authorized
//     const res = await Apisignin({
//       client_name: userDecode.name,
//       email: userDecode.email,
//     });
//     console.log("API signin response:", res);

//     // ✅ Store userid correctly
//     localStorage.setItem("userid", res._id || res.id);
//     LS.save("userid", res._id || res.id);

//     localStorage.setItem("name", res.name);
//     localStorage.setItem("email", res.email);
//     localStorage.setItem("isloggedin", res.isloggedin.toString());
//     localStorage.setItem("isadmin", res.isadmin.toString());
//     localStorage.setItem("access_token", res.access_token);

//     // IP validation
//     if (res.ip) {
//       console.log("IP validation required. Response IP:", res.ip);
//       if (!validateIp(res.ip, currentIps)) {
//         console.log("IP validation failed!");
//         toast.error("Remote work IP is mismatched. Please connect from an authorized network.");
//         return;
//       }
//       console.log("IP validation successful!");
//     } else {
//       console.log("No IP validation required");
//     }

//     // Navigation
//     const loggedIn = res.isloggedin;
//     const isAdmin = res.isadmin;

//     console.log("Navigation check:", { loggedIn, isAdmin });

//     if (loggedIn && isAdmin) {
//       toast.success("Welcome Admin!");
//       navigate("/admin/time", {
//         state: { userid: res._id || res.id, token: res.access_token },
//         replace: true
//       });
//     } else if (loggedIn && !isAdmin) {
//       toast.success("Welcome!");
//       navigate("/User/Clockin_int", {
//         state: { userid: res._id || res.id, token: res.access_token },
//         replace: true
//       });
//     } else {
//       toast.error("Login failed. Please contact administrator.");
//     }
//   } catch (err) {
//     console.error("Login error:", err);
//     // Ensure a toast is shown in the UI for denied access or other login errors
//     try {
//       const raw = (err && err.response && err.response.data && err.response.data.detail) || (err && err.message) || "Login failed. Contact admin.";
//       const concise = raw && raw.length > 60 ? raw.split('.').slice(0,1).join('.') : raw;
//       // Show a concise toast for denied access
//       toast.error(concise || "Access denied. Contact admin.", { autoClose: 4000, position: 'top-right' });
//     } catch (e) {
//       toast.error("Access denied. Contact admin.", { autoClose: 4000, position: 'top-right' });
//     }
//   }
// };


//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
//       <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-sm">
//         <div className="flex flex-col items-center justify-center p-8">
         
//           <h1 className="text-2xl font-bold text-gray-700 mb-6">Welcome to E-Connect</h1>
//           <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
//             <GoogleLogin onSuccess={handleGoogleLogin} />
//           </GoogleOAuthProvider>
//         </div>
//       </div>
//     </div>
//   );
// }




import React, { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { Authdata } from "../../Utils/Authprovider";
import { Apisignin } from "../../Api/Loginauth";
import { jwtDecode } from "jwt-decode";
import { LS } from "../../Utils/Resuse";
import { ArrowRight, CheckCircle, Shield, Zap, Users, Wifi } from "lucide-react";
import loginGif from "../../assets/login.gif";

export default function LoginPage() {
  const navigate = useNavigate();
  const { SetStatedata } = Authdata();
  const [isLoading, setIsLoading] = useState(false);

  const getIpInfo = async () => {
    try {
      const publicIpRes = await fetch("https://api64.ipify.org?format=json");
      const publicIpData = await publicIpRes.json();
      return { publicIp: publicIpData.ip, localIp: null };
    } catch (err) {
      console.error("Error fetching IP info:", err);
      return { publicIp: null, localIp: null };
    }
  };

  const validateIp = (userIp, currentIps) => {
    if (!userIp) {
      console.log("No IP validation needed - IP not present in response");
      return true;
    }
    
    console.log("Performing IP validation:");
    console.log("User IP from response:", userIp);
    console.log("Current Public IP:", currentIps.publicIp);
    console.log("Current Local IP:", currentIps.localIp);
    
    const matchesPublic = currentIps.publicIp === userIp;
    const matchesLocal = currentIps.localIp === userIp;
    
    console.log("Matches public IP:", matchesPublic);
    console.log("Matches local IP:", matchesLocal);
    
    return matchesPublic || matchesLocal;
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setIsLoading(true);
    try {
      console.log("Starting Google login process...");

      const currentIps = await getIpInfo();
      console.log("Retrieved current IPs:", currentIps);

      let userDecode = jwtDecode(credentialResponse.credential);
      console.log("Google credentials decoded:", {
        name: userDecode.name,
        email: userDecode.email
      });

      const res = await Apisignin({
        client_name: userDecode.name,
        email: userDecode.email,
      });
      console.log("API signin response:", res);

      localStorage.setItem("userid", res._id || res.id);
      LS.save("userid", res._id || res.id);
      localStorage.setItem("name", res.name);
      localStorage.setItem("email", res.email);
      localStorage.setItem("isloggedin", res.isloggedin.toString());
      localStorage.setItem("isadmin", res.isadmin.toString());
      localStorage.setItem("access_token", res.access_token);

      if (res.ip) {
        console.log("IP validation required. Response IP:", res.ip);
        if (!validateIp(res.ip, currentIps)) {
          console.log("IP validation failed!");
          toast.error("Remote work IP is mismatched. Please connect from an authorized network.");
          setIsLoading(false);
          return;
        }
        console.log("IP validation successful!");
      } else {
        console.log("No IP validation required");
      }

      const loggedIn = res.isloggedin;
      const isAdmin = res.isadmin;

      console.log("Navigation check:", { loggedIn, isAdmin });

      if (loggedIn && isAdmin) {
        toast.success("Welcome Admin!");
        navigate("/admin/time", {
          state: { userid: res._id || res.id, token: res.access_token },
          replace: true
        });
      } else if (loggedIn && !isAdmin) {
        toast.success("Welcome!");
        navigate("/User/Clockin_int", {
          state: { userid: res._id || res.id, token: res.access_token },
          replace: true
        });
      } else {
        toast.error("Login failed. Please contact administrator.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      try {
        const raw = (err && err.response && err.response.data && err.response.data.detail) || (err && err.message) || "Login failed. Contact admin.";
        const concise = raw && raw.length > 60 ? raw.split('.').slice(0,1).join('.') : raw;
        toast.error(concise || "Access denied. Contact admin.", { autoClose: 4000, position: 'top-right' });
      } catch (e) {
        toast.error("Access denied. Contact admin.", { autoClose: 4000, position: 'top-right' });
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center  p-4">
      {/* Left Side - GIF Illustration (Hidden on mobile) */}
      <div className="hidden lg:flex h-screen w-1/2 items-center justify-center p-12 relative overflow-hidden bg-white">
       
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
          {/* GIF Display */}
          <div className="flex items-center justify-center mb-8">
            <img 
              src={loginGif} 
              alt="E-Connect Animation" 
              className="max-w-full max-h-[600px] w-auto h-auto object-contain"
            />
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-3">Welcome to E-Connect</h2>
            <p className="text-gray-600 text-lg">Your intelligent time tracking solution</p>
          </div>
          
          {/* Feature cards */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
            <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <Shield className="w-8 h-8 text-blue-600 mb-3 mx-auto" />
              <p className="text-sm font-semibold text-gray-700 text-center">Secure Access</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <Zap className="w-8 h-8 text-indigo-600 mb-3 mx-auto" />
              <p className="text-sm font-semibold text-gray-700 text-center">Fast & Easy</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <Wifi className="w-8 h-8 text-purple-600 mb-3 mx-auto" />
              <p className="text-sm font-semibold text-gray-700 text-center">IP Protected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-10 md:p-12 backdrop-blur-sm border border-gray-100">
            {/* Logo and Title */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg transform hover:scale-110 transition-transform">
                <div className="text-5xl font-bold text-white">EC</div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
                Welcome Back
              </h1>
              <p className="text-gray-600 text-lg">Sign in to continue to E-Connect</p>
            </div>

            {/* Google Login Section */}
            <div className="space-y-6">
              {/* Loading overlay */}
              {isLoading && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 rounded-lg">
                    <div className="w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-blue-700 font-medium">Authenticating...</span>
                  </div>
                </div>
              )}

              {/* Main Google Button */}
              <div className={`transition-opacity ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      theme="outline"
                      size="large"
                      text="continue_with"
                      width="100%"
                    />
                  </div>
                </GoogleOAuthProvider>
              </div>

              {/* Benefits Section */}
              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-4 text-center">Secure Authentication</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">Quick and secure Google authentication</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">IP-based access control for security</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">Role-based dashboard access</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-6 text-center text-sm text-gray-600">
                By continuing, you agree to our{" "}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Need help?{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}