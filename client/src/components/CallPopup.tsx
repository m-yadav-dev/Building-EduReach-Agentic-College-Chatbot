import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { initialCall } from "../services/vapi.service";
import { vapiFormContent } from "../data/content";
import { AlertCircle, CheckCircle, Loader2, Phone, X } from "lucide-react";
import { useState } from "react";




interface callPopupProps {
  open: boolean;
  onClose: () => void;
}


type CallStatus = "idle" | "initiating" | "connected" | "failed";



const CallPopup = ({open, onClose}: callPopupProps) => {
  const {user} = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [preferredCourse, setPreferredCourse] = useState("");
  const [topic, setTopic] = useState("");
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Basic validation

    if (!phoneNumber || !preferredCourse || !topic) {
      toast.error("Please fill in all fields");
      return;
    }

    setCallStatus("initiating");

    try {
      await initialCall({
        phone: phoneNumber,
        course: preferredCourse,
        topic: topic
      }); 
      setCallStatus("connected");
      toast.success("Call initiated successfully! You should receive a call shortly.");
    }
    catch (error) {
      setCallStatus("failed");
      toast.error("Failed to initiate call. Please try again.");
    }

  }

  const reset = () => {
    setCallStatus("idle");
    setPhoneNumber("");
    setPreferredCourse("");
    setTopic("");
  }

  const handleClose = () => {
    reset();
    onClose();
  }

  if (!open) return null;



  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close */}
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-maroon rounded-t-2xl px-6 py-5">
          <h3 className="font-heading text-xl font-bold text-white">Talk to Our AI Counselor</h3>
          <p className="text-white/70 text-sm mt-1">Get personalized guidance on courses, admissions & more</p>
        </div>

        <div className="p-6">
          {callStatus === "idle" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input type="text" value={user?.name || ""} readOnly
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+91-9876543210"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon text-sm transition-colors duration-200" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interested Course *</label>
                <select value={preferredCourse} onChange={(e) => setPreferredCourse(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon text-sm transition-colors duration-200">
                  <option value="">Select a course</option>
                  {vapiFormContent.courses.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">What do you want to know? *</label>
                <select value={topic} onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon text-sm transition-colors duration-200">
                  <option value="">Select a topic</option>
                  {vapiFormContent.topics.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button type="submit"
                className="w-full bg-maroon text-white py-3 rounded-lg font-semibold hover:bg-maroon-dark transition-colors duration-200">
                Call Me Now
              </button>
            </form>
          )}

          {callStatus === "initiating" && (
            <div className="text-center py-10">
              <Loader2 className="w-10 h-10 text-maroon mx-auto animate-spin mb-3" />
              <h3 className="font-heading text-lg font-bold text-gray-900 mb-1">Calling you now...</h3>
              <p className="text-gray-500 text-sm">Our AI counselor Ava is dialing {phoneNumber}</p>
            </div>
          )}

          {callStatus === "connected" && (
            <div className="text-center py-10">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <h3 className="font-heading text-lg font-bold text-gray-900 mb-1">Call Initiated!</h3>
              <p className="text-gray-500 text-sm mb-4">You'll receive a call shortly on {phoneNumber}.</p>
              <button onClick={reset} className="text-maroon font-medium text-sm hover:underline">Request Another Call</button>
            </div>
          )}
  
          {callStatus === "failed" && (
            <div className="text-center py-10">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h3 className="font-heading text-lg font-bold text-gray-900 mb-1">Call Failed</h3>
              <p className="text-gray-500 text-sm mb-4">Something went wrong. Please try again.</p>
              <button onClick={reset} className="bg-maroon text-white px-5 py-2 rounded-lg text-sm hover:bg-maroon-dark transition-colors duration-200">Try Again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
}

export default CallPopup