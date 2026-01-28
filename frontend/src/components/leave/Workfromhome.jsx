import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Baseaxios, LS, ipadr } from "../../Utils/Resuse";
import moment from "moment";

const WorkFromHome = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [reason, setReason] = useState("");
  const [ip, setip] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [ipAddresses, setIpAddresses] = useState(null);
  const [selectedIp, setSelectedIp] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0);

  useEffect(() => {
    fetchIpAddresses();
  }, []);

  const fetchIpAddresses = async () => {
    try {
      const response = await fetch(`${ipadr}/ip-info`);
      const data = await response.json();
      setIpAddresses({
        public: data.public_ip,
        local: data.local_ip
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching IP addresses:", error);
      toast.error("Failed to fetch IP addresses");
      setIsLoading(false);
    }
  };

  const handleFromDateChange = (date) => {
    if (moment.isMoment(date)) {
      setFromDate(date);
    }
  };

  const handleToDateChange = (date) => {
    if (moment.isMoment(date)) {
      setToDate(date);
    }
  };

  const handleIpChange = (e) => {
    setSelectedIp(e.target.value);
  };

  const handleCancel = () => {
    setFromDate(null);
    setToDate(null);
    setReason("");
    setip("");
    setSelectedIp("");
    setKey(prev => prev + 1);
  };

  const remoteworkrequestapi = (newRequest) => {
    const userid = LS.get("userid");
    const employeeName = LS.get("name");
    
    // ✅ Clean employee name - remove special characters like ()
    const cleanedName = employeeName ? employeeName.replace(/[()]/g, '').trim() : '';

    const payload = {
      userid,
      employeeName: cleanedName,
      ...newRequest,
    };

    console.log("✅ Final Payload to API:", payload);

    Baseaxios.post("/remote-work-request", payload)
      .then((response) => {
        const { success, status, message, details } = response.data;
        console.log("API Response:", response.data);
        
        // ✅ Handle SUCCESS cases
        if (success === true) {
          toast.success(message || "Remote work request submitted successfully!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
          });
          handleCancel();
        } 
        // ✅ Handle CONFLICT case
        else if (status === "conflict") {
          const conflictMsg = details 
            ? `${message}: ${details}` 
            : message || "A scheduling conflict was detected with your request.";
          
          toast.warning(conflictMsg, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
          });
        }
        // ✅ Handle VALIDATION ERROR case
        else if (status === "validation_error") {
          // Map backend errors to user-friendly messages
          let userMessage = message || "Please check your input and try again.";
          
          if (details) {
            if (details.toLowerCase().includes("employee name")) {
              userMessage = "There was an issue with your profile. Please contact HR.";
            } else if (details.toLowerCase().includes("date")) {
              userMessage = "Invalid date range. Please check your dates.";
            } else if (details.toLowerCase().includes("ip")) {
              userMessage = "Invalid IP address format. Please check and try again.";
            } else {
              userMessage = `${message}: ${details}`;
            }
          }
          
          toast.error(userMessage, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
          });
        }
        // ✅ Fallback for unknown responses
        else {
          toast.warning(message || "Something unexpected happened. Please try again.", {
            position: "top-right",
            autoClose: 4000,
          });
        }
      })
      .catch((err) => {
        console.error("API Error:", err);
        
        // ✅ Handle network/server errors
        const errorMsg = err.response?.data?.message 
          || err.message 
          || "Failed to submit request. Please check your connection and try again.";
        
        toast.error(errorMsg, {
          position: "top-right",
          autoClose: 5000,
        });
      })
      .finally(() => {
        setIsApplying(false);
      });
  };

  const handleApplyButtonClick = () => {
    if (fromDate && toDate && reason && ip) {
      setIsApplying(true);
      const newRequest = {
        fromDate: moment(fromDate).format("YYYY-MM-DD"),
        toDate: moment(toDate).format("YYYY-MM-DD"),
        requestDate: moment().format("YYYY-MM-DD"),
        reason: reason.trim(),
        ip: ip.trim(),
      };
      remoteworkrequestapi(newRequest);
    } else {
      toast.error("Please fill in all fields including IP address.", {
        position: "top-right",
      });
    }
  };

  const isWeekday = (date) => {
    return date.day() !== 0;
  };

  const isValidDate = (current) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return current.isSameOrAfter(today) && current.day() !== 0;
  };

  return (
    <div className="mr-8 p-10 bg-white min-h-96 lg:min-h-[90vh] w-full shadow-black rounded-xl justify-center items-center relative jsonback ml-10 rounded-md">
      <ToastContainer />
      <h1 className="text-5xl font-semibold font-poppins pb-4 text-transparent bg-gradient-to-r from-zinc-600 to-zinc-950 bg-clip-text border-b-2">
        Leave Management
      </h1>
      <div className="flex justify-between mt-3">
        <h3 className="text-2xl font-semibold font-poppins py-2 text-zinc-500">
          Work from home
        </h3>
        <Link to="/User/Leave">
          <div className="">
            <button className="px-4 py-2 text-base bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black active:bg-white active:text-white">
              Go Back
            </button>
          </div>
        </Link>
      </div>
      <div className="mt-10">
        <div className="mt-4 bg-gradient-to-tr from-white to-blue-100 border-x p-4 rounded-lg shadow-xl">
          <div className="container mx-auto">
            <form>
              <div className="">
                <label
                  htmlFor="fromDate"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  From Date
                </label>
                <Datetime
                  key={`from-${key}`}
                  id="fromDate"
                  dateFormat="DD-MM-YYYY"
                  timeFormat={false}
                  value={fromDate}
                  onChange={handleFromDateChange}
                  closeOnSelect={true}
                  isValidDate={(current) =>
                    isWeekday(current) && isValidDate(current)
                  }
                  inputProps={{
                    className:
                      "p-2 text-sm border border-gray-300 rounded-md block w-full",
                    placeholder: "Select from date",
                  }}
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="toDate"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  To Date
                </label>
                <Datetime
                  key={`to-${key}`}
                  id="toDate"
                  dateFormat="DD-MM-YYYY"
                  timeFormat={false}
                  value={toDate}
                  onChange={handleToDateChange}
                  closeOnSelect={true}
                  isValidDate={(current) =>
                    isWeekday(current) && 
                    isValidDate(current) &&
                    (fromDate ? current.isSameOrAfter(moment(fromDate)) : true)
                  }
                  inputProps={{
                    className:
                      "p-2 text-sm border border-gray-300 rounded-md block w-full",
                    placeholder: "Select to date",
                  }}
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="ipSelect"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  IP Address
                </label>
                <textarea
                  id="ip"
                  value={ip}
                  onChange={(e) => setip(e.target.value)}
                  rows={1}
                  className="mt-2 border border-gray-300 p-2 w-full font-poppins rounded-md text-sm"
                  placeholder="Enter IP address"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="reason"
                  className="block text-base font-medium text-gray-700"
                >
                  Reason
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={1}
                  className="mt-2 border border-gray-300 p-2 w-full font-poppins rounded-md text-sm"
                  placeholder="Enter reason"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyButtonClick}
                className={`mt-4 px-4 py-2 text-base bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black active:bg-white active:text-white ${
                  isApplying ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isApplying}
              >
                {isApplying ? "Applying..." : "Apply"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 ml-2 bg-gray-500 rounded-md hover:text-slate-900 hover:bg-[#b7c6df80] text-white"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkFromHome;