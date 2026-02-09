import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEdit, AiOutlineDownload } from "react-icons/ai";
import { BarChart3 } from "lucide-react";
import { LS, ipadr } from "../../Utils/Resuse";
import AttendanceStats from "../profile/AttendanceStats";

const API_BASE_URL = `${ipadr}`;

const UserProfile = () => {
  const navigate = useNavigate();
  const userid = LS.get("userid");

  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    dateOfJoining: "",
    department: "",
    address: "",
    education: [],
    skills: [],
    documents: {}, // 👈 Added documents
    status: "",
    TL: "",
    personal_email: "",
    resume_link: ""
  });

  const [showAttendance, setShowAttendance] = useState(false);

  // 👈 Function to convert Google Drive link to direct download
  const getDirectDownloadUrl = (driveUrl) => {
    if (!driveUrl) return null;
    
    // Extract file ID from Google Drive URL
    const fileIdMatch = driveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!fileIdMatch) return null;
    
    const fileId = fileIdMatch[1];
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  };

  

 const handleDocumentDownload = (docType, docName) => {
    const downloadUrl = `${ipadr}/download/${docType}?userid=${userid}`;
    console.log("📥 Downloading:", downloadUrl);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = `${docType.replace('_', '-')}_${userid.slice(0,8)}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

// Documents Section (Add this to your JSX)
<div className="px-10 mt-8">
  <div className="p-6 border-2 border-blue-100 rounded-xl shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
    <h2 className="text-3xl font-bold text-blue-800 mb-6 flex items-center gap-2">
      📁 Employee Documents
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        { key: 'offer_letter', label: 'Offer Letter', icon: '📋' },
        { key: 'nda', label: 'NDA Agreement', icon: '🔐' },
        { key: 'resume', label: 'Resume', icon: '📄' },
        { key: 'college_id', label: 'College ID', icon: '🎓' },
        { key: 'aadhaar', label: 'Aadhaar Card', icon: '🆔' },
        { key: 'pan', label: 'PAN Card', icon: '💳' }
      ].map(({ key, label, icon }) => {
        const hasDoc = userInfo.documents?.[key];
        
        return (
          <div key={key} className={`p-6 rounded-xl border-2 shadow-md transition-all hover:shadow-xl hover:scale-[1.02] ${
            hasDoc 
              ? 'bg-green-50 border-green-200 hover:border-green-300' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{label}</h3>
                  <p className="text-xs text-gray-500">ID: {userid.slice(-6)}</p>
                </div>
              </div>
              
              {hasDoc ? (
                <button
                   onClick={() => handleDocumentDownload(key, label)}
                  className="p-3 bg-green-500 text-white rounded-xl shadow-lg hover:bg-green-600 hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                >
                  <AiOutlineDownload className="h-5 w-5" />
                  <span className="font-medium">Download</span>
                </button>
              ) : (
                <div className="text-sm text-gray-400 font-medium px-3 py-2 bg-gray-100 rounded-lg">
                  Not Available
                </div>
              )}
            </div>
            
            {hasDoc && (
              <div className="text-xs bg-blue-100 p-2 rounded text-blue-800">
                ✅ Ready to download via secure proxy
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
</div>


  useEffect(() => {
    const fetchData = async () => {
      if (!userid) {
        console.error("User ID is not available.");
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/get_user/${userid}`);
        const contentType = response.headers.get("content-type");

        if (response.ok && contentType?.includes("application/json")) {
          const data = await response.json();
          console.log("Fetched user data:", data);

          if (!data) {
            console.error("User not found");
            return;
          }

          setUserInfo({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            position: data.position || "",
            dateOfJoining: data.date_of_joining || "",
            department: data.department || "",
            address: data.address || "",
            education: data.education || [],
            skills: data.skills || [],
            documents: data.documents || {}, // 👈 Added
            status: data.status || "",
            TL: data.TL || "",
            personal_email: data.personal_email || "",
            resume_link: data.resume_link || ""
          });
        } else {
          console.error("Response was not JSON:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, [userid]);

  const handleEditProfileClick = () => {
    navigate("/User/EditProfile");
  };

  const handleAttendanceClick = () => {
    setShowAttendance(true);
  };

  const handleCloseAttendance = () => {
    setShowAttendance(false);
  };

  return (
    <>
      <div className="mr-8 bg-white min-h-96 lg:min-h-[90vh] w-full shadow-lg justify-center items-center relative ml-10 rounded-md">
        <div className="flex flex-col justify-between items-left w-full relative p-6">
          {/* Profile Header */}
          {/* <div className="flex flex-col">
            <div className="p-4 border mb-4 rounded-md shadow-sm bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-medium text-zinc-700">Employee Profile</h2>
                
              </div>
              <div className="flex justify-center">
                <img
                  src="https://static.vecteezy.com/system/resources/previews/023/402/601/original/man-avatar-free-vector.jpg"
                  alt="User Profile"
                  className="rounded-full w-32 h-32 object-cover border-2 border-gray-300"
                />
              </div>
            </div>
          </div> */}
<div className="p-4 border mb-4 flex items-center rounded-md shadow-sm bg-gray-50">
                  <button
                    onClick={handleAttendanceClick}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>View Attendance</span>
                  </button>
                </div>
          {/* Personal & Work Info */}
          <div className="px-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-4 border rounded-md shadow-sm bg-gray-50">
              <h2 className="text-2xl font-medium text-zinc-700 mb-4">Personal Information</h2>
              <p className="text-lg font-medium text-zinc-600"><strong>Name:</strong> {userInfo.name}</p>
              <p className="text-lg font-medium text-zinc-600"><strong>Email:</strong> {userInfo.email}</p>
              <p className="text-lg font-medium text-zinc-600"><strong>Phone:</strong> {userInfo.phone}</p>
              <p className="text-lg font-medium text-zinc-600"><strong>Address:</strong> {userInfo.address}</p>
            </div>
            <div className="p-4 border rounded-md shadow-sm bg-gray-50">
              <h2 className="text-2xl font-medium text-zinc-700 mb-4">Work Details</h2>
              <p className="text-lg font-medium text-zinc-600"><strong>Position:</strong> {userInfo.position}</p>
              <p className="text-lg font-medium text-zinc-600"><strong>Department:</strong> {userInfo.department}</p>
              <p className="text-lg font-medium text-zinc-600"><strong>Date of Joining:</strong> {userInfo.dateOfJoining}</p>
            </div>
          </div>

          {/* Education & Skills */}
          <div className="px-10 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-4 border rounded-md shadow-sm bg-gray-50">
              <h2 className="text-2xl font-medium text-zinc-700 mb-4">Education</h2>
              {userInfo.education.length > 0 ? (
                userInfo.education.map((edu, index) => (
                  <p key={index} className="text-lg font-medium text-zinc-600">
                    <strong>{edu.degree}</strong> at {edu.institution} ({edu.year})
                  </p>
                ))
              ) : (
                <p className="text-lg text-zinc-400">No education details</p>
              )}
            </div>
            <div className="p-4 border rounded-md shadow-sm bg-gray-50">
              <h2 className="text-2xl font-medium text-zinc-700 mb-4">Skills</h2>
              {userInfo.skills.length > 0 ? (
                userInfo.skills.map((skill, index) => (
                  <div key={index} className="mb-2">
                    <p className="text-lg font-medium text-zinc-600">{skill.name}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-lg text-zinc-400">No skills added</p>
              )}
            </div>
          </div>

          {/* 👈 NEW DOCUMENTS SECTION */}
          <div className="px-10 mt-8">
            <div className="p-4 border rounded-md shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-2xl font-medium text-zinc-700 mb-6">Documents</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { key: 'offer_letter', label: 'Offer Letter', icon: '📄' },
                  { key: 'nda', label: 'NDA', icon: '🔒' },
                  { key: 'resume', label: 'Resume', icon: '📄' },
                  { key: 'college_id', label: 'College ID', icon: '🎓' },
                  { key: 'aadhaar', label: 'Aadhaar', icon: '🆔' },
                  { key: 'pan', label: 'PAN', icon: '💳' }
                ].map(({ key, label, icon }) => (
                  <div key={key} className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-semibold text-gray-800"> {label}</span>
                      {userInfo.documents?.[key] ? (
                        <button
                          onClick={() => handleDocumentDownload(key, label)}  // ✅ CORRECT!
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full transition-all"
                          title={`Download ${label}`}
                        >
                          <AiOutlineDownload className="h-5 w-5" />
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </div>
                    {/* {userInfo.documents?.[key] ? (
                      <p className="text-xs text-gray-500 truncate" title={userInfo.documents[key]}>
                        {userInfo.documents[key].slice(0, 40)}...
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">Not available</p>
                    )} */}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAttendance && <AttendanceStats onClose={handleCloseAttendance} />}
    </>
  );
};

export default UserProfile;


// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { AiOutlineEdit } from "react-icons/ai";
// import { BarChart3 } from "lucide-react";
// import { LS, ipadr } from "../../Utils/Resuse";
// import AttendanceStats from "../profile/AttendanceStats"; // Import the new component

// const API_BASE_URL = `${ipadr}`; // Backend URL

// const UserProfile = () => {
//   const navigate = useNavigate();
//   const userid = LS.get("userid"); // Get the user ID from local storage

//   const [userInfo, setUserInfo] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     position: "",
//     dateOfJoining: "",
//     department: "",
//     address: "",
//     education: [],
//     skills: [],
//   });

//   const [showAttendance, setShowAttendance] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!userid) {
//         console.error("User ID is not available.");
//         return;
//       }
//       try {
//         const response = await fetch(`${API_BASE_URL}/get_user/${userid}`);
//         const contentType = response.headers.get("content-type");

//         if (response.ok && contentType?.includes("application/json")) {
//           const data = await response.json();
//           console.log("Fetched user data:", data); // 👈 check actual response shape

//           if (!data) {
//             console.error("User not found");
//             return;
//           }

//           setUserInfo({
//             name: data.name || "",
//             email: data.email || "",
//             phone: data.phone || "",
//             position: data.position || "",
//             dateOfJoining: data.date_of_joining || "", // 👈 make sure snake_case here
//             department: data.department || "",
//             address: data.address || "",
//             education: data.education || [],
//             skills: data.skills || [],
//           });
//         } else {
//           console.error("Response was not JSON:", await response.text());
//         }
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//       }
//     };

//     fetchData();
//   }, [userid]);

//   const handleEditProfileClick = () => {
//     navigate("/User/EditProfile");
//   };

//   const handleAttendanceClick = () => {
//     setShowAttendance(true);
//   };

//   const handleCloseAttendance = () => {
//     setShowAttendance(false);
//   };

//   return (
//     <>
//       <div className="mr-8 bg-white min-h-96 lg:min-h-[90vh] w-full shadow-lg justify-center items-center relative ml-10 rounded-md">
//         <div className="flex flex-col justify-between items-left w-full relative p-6">
//           <div className="flex flex-col ">
//             <div className="p-4 border mb-4 rounded-md shadow-sm bg-gray-50">
//               <div className="flex justify-between items-start mb-4">
//                 <h2 className="text-2xl font-medium text-zinc-700">
//                   Employee profile
//                 </h2>
//                 <div className="flex space-x-3">
//                   <button
//                     onClick={handleAttendanceClick}
//                     className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
//                   >
//                     <BarChart3 className="h-4 w-4" />
//                     <span>View Attendance</span>
//                   </button>
//                   {/* <button
//                     onClick={handleEditProfileClick}
//                     className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-sm"
//                   >
//                     <AiOutlineEdit className="h-4 w-4" />
//                     <span>Edit Profile</span>
//                   </button> */}
//                 </div>
//               </div>
//               <div>
//                 <img
//                   src="https://static.vecteezy.com/system/resources/previews/023/402/601/original/man-avatar-free-vector.jpg"
//                   alt="User Profile"
//                   className="rounded-full w-32 h-32 object-cover border-2 border-gray-300"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="px-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
//             <div className="p-4 border rounded-md shadow-sm bg-gray-50">
//               <h2 className="text-2xl font-medium text-zinc-700 mb-4">
//                 Personal Information
//               </h2>
//               <p className="text-lg font-medium text-zinc-600">
//                 <strong>Name: </strong>
//                 {userInfo.name}
//               </p>
//               <p className="text-lg font-medium text-zinc-600">
//                 <strong>Email: </strong>
//                 {userInfo.email}
//               </p>
//               <p className="text-lg font-medium text-zinc-600">
//                 <strong>Phone: </strong>
//                 {userInfo.phone}
//               </p>
//               <p className="text-lg font-medium text-zinc-600">
//                 <strong>Address: </strong>
//                 {userInfo.address}
//               </p>
//             </div>
//             <div className="p-4 border rounded-md shadow-sm bg-gray-50">
//               <h2 className="text-2xl font-medium text-zinc-700 mb-4">
//                 Work Details
//               </h2>
//               <p className="text-lg font-medium text-zinc-600">
//                 <strong>Position: </strong>
//                 {userInfo.position}
//               </p>
//               <p className="text-lg font-medium text-zinc-600">
//                 <strong>Department: </strong>
//                 {userInfo.department}
//               </p>
//               <p className="text-lg font-medium text-zinc-600">
//                 <strong>Date of Joining: </strong>
//                 {userInfo.dateOfJoining}
//               </p>
//             </div>
//           </div>

//           <div className="px-10 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
//             <div className="p-4 border rounded-md shadow-sm bg-gray-50">
//               <h2 className="text-2xl font-medium text-zinc-700 mb-4">Education</h2>
//               {userInfo.education.length > 0 ? (
//                 userInfo.education.map((edu, index) => (
//                   <p key={index} className="text-lg font-medium text-zinc-600">
//                     <strong>{edu.degree}</strong> at {edu.institution} ({edu.year})
//                   </p>
//                 ))
//               ) : (
//                 <p className="text-lg text-zinc-400">No education details</p>
//               )}
//             </div>
//             <div className="p-4 border rounded-md shadow-sm bg-gray-50">
//               <h2 className="text-2xl font-medium text-zinc-700 mb-4">Skills</h2>
//               {userInfo.skills.length > 0 ? (
//                 userInfo.skills.map((skill, index) => (
//                   <div key={index} className="mb-2">
//                     <p className="text-lg font-medium text-zinc-600">{skill.name}</p>
//                     <div className="w-full bg-gray-200 rounded-full h-2.5">
//                       <div
//                         className="bg-blue-500 h-2.5 rounded-full"
//                         style={{ width: `${skill.level}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-lg text-zinc-400">No skills added</p>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Attendance Modal */}
//       {showAttendance && (
//         <AttendanceStats onClose={handleCloseAttendance} />
//       )}
//     </>
//   );
// };

// export default UserProfile;
