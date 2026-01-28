import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ipadr } from "../../Utils/Resuse";
import { LS } from "../../Utils/Resuse";

const AddUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    personal_email: "",
    resume_link: "",
    TL: "",
    phone: "",
    address: "",
    position: "",
    department: "",
    status: "",
    dateOfJoining: "",
    education: [{ degree: "", institution: "", year: "" }],
    skills: [{ name: "", level: "" }],
  });

  const [selectedValue, setSelectedValue] = useState("");
  const [options, setOptions] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeptHint, setShowDeptHint] = useState(false);

  const Admin = LS.get('isadmin');
  const Position = LS.get('position');

  // Fetch TL list
  useEffect(() => {
    fetch(`${ipadr}/get_TL_list`)
      .then((response) => {
        console.log(response);
        
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => setOptions(data))
      .catch((error) => setError(error));
  }, []);

  const handleChange = (e, index, type) => {
    const { name, value } = e.target;

    if (type === "education") {
      const updatedEducation = [...formData.education];
      updatedEducation[index][name] = value;
      setFormData({ ...formData, education: updatedEducation });
    } else if (type === "skills") {
    const updatedSkills = [...formData.skills];

    let newValue = value;

    if (name === "level") {
      if (value < 0) newValue = 0;
      if (value > 100) newValue = 100;
    }

    updatedSkills[index][name] = newValue;
    setFormData({ ...formData, skills: updatedSkills });

  } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (event) => {
    setSelectedValue(event.target.value);
    setFormData({ ...formData, TL: event.target.value });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { degree: "", institution: "", year: "" }],
    });
  };

  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, { name: "", level: "" }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    setIsSubmitting(true);

    let payload = {
      name: formData.name,
      email: formData.email,
      personal_email: formData.personal_email,
      resume_link: formData.resume_link,
      TL: formData.TL,
      phone: formData.phone,
      position: formData.position,
      department: formData.department,
      address: formData.address,
      status: formData.status,
      date_of_joining: formData.dateOfJoining,
      education: formData.education,
      skills: formData.skills.map((skill) => ({
        name: skill.name,
        level: parseInt(skill.level) || 0,
      })),
      ip: "127.0.0.1",
    };

    console.log("Payload:", payload);

    try {
      const response = await fetch(`${ipadr}/add_employee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Employee added successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Reset form after successful submission
        setFormData({
          name: "",
          email: "",
          personal_email: "",
          resume_link: "",
          TL: "",
          phone: "",
          address: "",
          position: "",
          department: "",
          status: "",
          dateOfJoining: "",
          education: [{ degree: "", institution: "", year: "" }],
          skills: [{ name: "", level: "" }],
        });
        setSelectedValue("");
      } else {
        toast.error(data.detail || "Error occurred while adding employee.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while adding the employee.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    (Admin || Position === "HR") ?
    <div className="min-h-screen flex items-center justify-center">
      <form
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl border"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-semibold mb-6 text-center">Add New Employee</h2>
        <div className="grid grid-cols-4 gap-4">
          {/* Basic fields */}
          <div>
            <label className="block mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Personal Email</label>
            <input
              type="email"
              name="personal_email"
              value={formData.personal_email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
         <div>
          <label className="block mb-1">Position</label>
          <select
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          >
            <option value="" disabled hidden>Select Position</option>
            <option value="HR">HR</option>
            <option value="TL">TL</option>
            <option value="Employee">Employee</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Department</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={(e) => {
              const v = e.target.value;
              handleChange({
                target: {
                  name: "department",
                  value: v.toLowerCase() === "hr" ? "HR" : v
                }
              });
            }}
            onFocus={() => setShowDeptHint(true)}
            onBlur={() => setShowDeptHint(false)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
          {showDeptHint && (
            <p className="text-xs text-red-500 mt-1">
              HR department should be entered only as: HR
            </p>
          )}
        </div>

          <div>
            <label className="block mb-1">Date of Joining</label>
            <input
              type="date"
              name="dateOfJoining"
              value={formData.dateOfJoining}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          {/* TL dropdown */}
          <div>
            <label className="block mb-1">Select TL</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={selectedValue}
              onChange={handleSelectChange}
            >
              <option value="">--select--</option>
              {options.map((item, index) => (
                <option key={item._id || index} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Education */}
          <div className="col-span-4">
            <label className="block mb-1">Education</label>
            {formData.education.map((edu, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 mb-2">
                <input
                  type="text"
                  name="degree"
                  placeholder="Degree"
                  value={edu.degree}
                  onChange={(e) => handleChange(e, index, "education")}
                  className="border border-gray-300 rounded px-3 py-2"
                  required
                />
                <input
                  type="text"
                  name="institution"
                  placeholder="Institution"
                  value={edu.institution}
                  onChange={(e) => handleChange(e, index, "education")}
                  className="border border-gray-300 rounded px-3 py-2"
                  required
                />
                <input
                  type="text"
                  name="year"
                  placeholder="Year"
                  value={edu.year}
                  onChange={(e) => handleChange(e, index, "education")}
                  className="border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
            ))}
            <button type="button" onClick={addEducation} className="text-blue-500 mt-2">
              Add Another Education
            </button>
          </div>

          {/* Skills */}
          <div className="col-span-4">
            <label className="block mb-1">Skills</label>
            {formData.skills.map((skill, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 mb-2">
                <input
                  type="text"
                  name="name"
                  placeholder="Skill Name"
                  value={skill.name}
                  onChange={(e) => handleChange(e, index, "skills")}
                  className="border border-gray-300 rounded px-3 py-2"
                  required
                />
                <input
                  type="number"
                  name="level"
                  placeholder="Skill Level"
                  value={skill.level}
                  onChange={(e) => handleChange(e, index, "skills")}
                  min="0"
                  max="100"
                  className="border border-gray-300 rounded px-3 py-2"
                  required
              />

              </div>
            ))}
            <button type="button" onClick={addSkill} className="text-blue-500 mt-2">
              Add Another Skill
            </button>
          </div>

          {/* Address */}
          <div className="col-span-4">
            <label className="block mb-1">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows="2"
              required
            ></textarea>
          </div>

          {/* Resume + Status */}
          <div className="col-span-4 grid grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block mb-1">Resume Link</label>
              <input
                type="text"
                name="resume_link"
                value={formData.resume_link}
                onChange={handleChange}
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1">Status</label>
              <input
                type="text"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full text-white py-2 rounded mt-6 transition ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isSubmitting ? "Adding..." : "Add"}
        </button>
      </form>
    </div> : (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md">
          <h1 className="text-xl font-semibold mb-2">Access Denied</h1>
          <p>Only administrators and HR can access this page.</p>
        </div>
      </div>
    )
  );
};

export default AddUser;