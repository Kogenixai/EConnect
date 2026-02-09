import React, { useEffect, useState } from "react";
import { ipadr, LS } from "../../Utils/Resuse";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const UserMeeting = () => {
  const userid = LS.get("userid");
  const role = LS.get("role") || LS.get("position")?.toLowerCase(); // Smart role detection

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  // 🔥 SMART ENDPOINT DETECTION
  const getMeetingsEndpoint = () => {
    if (role === "tl" || role.includes("manager")) {
      return `${ipadr}/tl-meetings/${userid}`; // TL sees THEIR meetings
    }
    return `${ipadr}/employee-meetings/${userid}`; // User sees ASSIGNED meetings
  };

  useEffect(() => {
    if (!userid) {
      setLoading(false);
      return;
    }
console.log(role);

    const endpoint = getMeetingsEndpoint();
    console.log(`📅 Fetching ${role?.toUpperCase()} meetings:`, endpoint);

    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        const meetingList = Array.isArray(data)
          ? data
          : Array.isArray(data.meetings) || Array.isArray(data.tl_meetings)
          ? data.meetings || data.tl_meetings || []
          : [];
console.log("Raw meetings data:", data);
        // 🔥 TL-SPECIFIC UI ENHANCEMENTS
        const enhancedMeetings = meetingList.map(meeting => ({
          ...meeting,
          title: role === "tl" ? "Your Meeting" : "Team Meeting", // Dynamic title
          isTLView: role === "tl"
        }));

        setMeetings(enhancedMeetings);
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Meetings fetch error:", err);
        setMeetings([]);
        setLoading(false);
      });
  }, [userid, role]);

  const joinMeeting = (link) => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const filteredMeetings = meetings.filter(m =>
    dayjs(m.meeting_date).isSame(selectedDate, "day")
  );

  if (loading) {
    return (
      <div className="mt-8 p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        Loading {role?.toUpperCase?.() || ''} meetings...
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 📅 LEFT – Calendar */}
      <div className="bg-white rounded-2xl p-4 shadow-md">
        <h3 className="text-lg font-bold mb-3">
          {role === "tl" ? "📅 Your Schedule" : "📅 Select Date"}
        </h3>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
          />
        </LocalizationProvider>
      </div>

      {/* 📋 RIGHT – Meetings */}
      <div className="lg:col-span-2 rounded-2xl border p-6">
        <h2 className="text-2xl font-bold mb-4">
          {role === "tl" 
            ? `👑 Your Meetings (${filteredMeetings.length})` 
            : `📋 Meetings (${filteredMeetings.length})`
          } - {selectedDate.format("DD MMM YYYY")}
        </h2>

        {filteredMeetings.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-dashed border-gray-300">
            <div className="text-gray-500 mb-2">📭</div>
            {role === "tl" 
              ? "No meetings scheduled yet" 
              : "No meetings assigned for this date"
            }
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {filteredMeetings.map((meeting) => (
              <div
                key={meeting.meeting_id || meeting.id}
                className={`p-5 rounded-xl shadow-sm border-l-4 transition-all hover:shadow-md ${
                  meeting.isTLView 
                    ? "border-l-4 border-purple-500 bg-gradient-to-r from-purple-50" 
                    : "border-l-4 border-indigo-500 bg-gradient-to-r from-indigo-50"
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg">
                    {meeting.title || (meeting.isTLView ? "Your Meeting" : "Team Meeting")}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    meeting.status === "attended"
                      ? "bg-green-100 text-green-700"
                      : meeting.status === "missed"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {meeting.status || "Scheduled"}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-1">
                  <strong>{meeting.meeting_time}</strong>
                </p>

                {meeting.tl_name && (
                  <p className="text-sm text-gray-600 mb-4">
                    👤 Assigned by <strong>{meeting.tl_name}</strong>
                  </p>
                )}

                {meeting.team_members && meeting.team_members.length > 0 && (
                  <p className="text-xs text-gray-500 mb-4">
                    👥 {meeting.team_members.length} member{meeting.team_members.length !== 1 ? 's' : ''}
                  </p>
                )}

                <button
                  onClick={() => joinMeeting(meeting.meeting_link)}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 rounded-lg font-semibold transition-all hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  🚀 Join Google Meet
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMeeting;
