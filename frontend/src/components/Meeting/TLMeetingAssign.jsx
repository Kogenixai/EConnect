import React, { useState, useEffect } from 'react';
import axios from 'axios';  // ✅ Your existing axios setup
import { toast } from 'react-toastify';
import { ipadr } from '../../Utils/Resuse';
import { LS } from '../../Utils/Resuse';

const TLMeetingAssign = () => {
  const [teamMembers, setTeamMembers] = useState([]);  // ✅ Renamed from options
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [meetingData, setMeetingData] = useState({
    meeting_link: '',
    meeting_date: '',
    meeting_time: ''
  });
  const [loading, setLoading] = useState(true);

  // ✅ YOUR EXACT PATTERN - Works with existing /list_users endpoint!
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        let res;

        // ✅ TL fetches TEAM MEMBERS using LS.get('name')
        const params = { 
          role: "TeamMembers", 
          TL: LS.get("name")  // ✅ Your exact TL pattern
        };
        console.log("Sending params:", params);

        res = await axios.get(`${ipadr}/list_users`, { params });

        console.log("Response data:", res.data);
        setTeamMembers(Array.isArray(res.data) ? res.data : []);  // ✅ Safe array

      } catch (err) {
        console.error("Error fetching team members:", err);
        toast.error("Failed to load team members");
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);  // ✅ No deps needed - runs once

  const handleAssignMeeting = async () => {
    if (selectedMembers.length === 0) {
      toast.error("Select at least one team member");
      return;
    }

    const payload = {
      tl_id: LS.get('userid'),
      tl_name: LS.get('name'),
      meeting_link: meetingData.meeting_link,
      meeting_date: meetingData.meeting_date,
      meeting_time: meetingData.meeting_time,
      team_members: selectedMembers
    };
console.log("Assigning meeting with payload:", payload);
    try {
      const res = await axios.post(`${ipadr}/assign-tl-meeting`, payload);
      if (res.data.success) {
        toast.success(`✅ Meeting assigned! ID: ${res.data.meeting_id}`);
        setMeetingData({ meeting_link: '', meeting_date: '', meeting_time: '' });
        setSelectedMembers([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign meeting");
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading team members...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Assign Team Meeting</h2>
      
      {/* Meeting Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
        <input type="url" placeholder="Google Meet/Zoom Link" 
               value={meetingData.meeting_link} 
               onChange={(e) => setMeetingData({...meetingData, meeting_link: e.target.value})}
               className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
        <input type="date" value={meetingData.meeting_date} 
               onChange={(e) => setMeetingData({...meetingData, meeting_date: e.target.value})}
               className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
        <input type="time" value={meetingData.meeting_time} 
               onChange={(e) => setMeetingData({...meetingData, meeting_time: e.target.value})}
               className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Team Selection */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold"> Team Members ({selectedMembers.length} selected)</h3>
          <span className="text-sm text-gray-500">Total: {teamMembers.length}</span>
        </div>
        
        {teamMembers.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-xl">
            No team members assigned yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-4 bg-gray-50 rounded-xl">
            {teamMembers.map((member) => (
              <label key={member.userid || member.id} className="flex items-center p-3 bg-white border rounded-lg hover:shadow-md cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(member.userid || member.id)}
                  onChange={(e) => {
                    const memberId = member.userid || member.id;
                    if (e.target.checked) {
                      setSelectedMembers([...selectedMembers, memberId]);
                    } else {
                      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
                    }
                  }}
                  className="mr-3 w-4 h-4"
                />
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-xs text-gray-500">{member.position}</div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleAssignMeeting}
        disabled={selectedMembers.length === 0}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-bold hover:shadow-xl transition-all disabled:opacity-50"
      >
         Assign Meeting to {selectedMembers.length} Members
      </button>
    </div>
  );
};

export default TLMeetingAssign;
