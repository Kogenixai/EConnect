import React, { useState, useEffect } from "react";
import { Calendar, Clock, UserCheck, ChevronLeft, ChevronRight, X } from "lucide-react";
import { LS, ipadr } from "../../Utils/Resuse";

const API_BASE_URL = `${ipadr}`;

const AttendanceStats = ({ onClose = () => {} }) => {
  const userid = LS.get("userid");
  
  const getCurrentYear = () => new Date().getFullYear();
  const generateAvailableYears = () => {
    const currentYear = getCurrentYear();
    return [currentYear, currentYear - 1, currentYear - 2];
  };

  const [availableYears] = useState(generateAvailableYears());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [remoteHistory, setRemoteHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentCalendarYear, setCurrentCalendarYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  // Compact Bar Chart Component
  const CustomBarChart = ({ data }) => {
    const maxCount = Math.max(...data.map(d => d.count));
    
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700">{item.metric}</span>
              </div>
              <span className="text-xs text-gray-500">
                {item.count} days ({item.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="bg-gray-200 rounded-full h-6 relative overflow-hidden">
              <div
                className={`h-full ${item.bgColor} rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2`}
                style={{ 
                  width: `${maxCount > 0 ? (item.count / maxCount) * 100 : 0}%`,
                  minWidth: item.count > 0 ? '30px' : '0px'
                }}
              >
                <span className="text-white text-xs font-medium">
                  {item.count}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Helper function to parse dates - handles DD-MM-YYYY format
  const parseDate = (dateStr) => {
    try {
      if (!dateStr) return null;
      
      // Handle DD-MM-YYYY format (from leave history)
      if (typeof dateStr === 'string' && dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3 && parts[0].length <= 2) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          return new Date(year, month, day);
        }
      }
      
      // Handle MM/DD/YYYY format (from other sources)
      if (typeof dateStr === 'string' && dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const month = parseInt(parts[0], 10) - 1;
          const day = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          return new Date(year, month, day);
        }
      }
      
      // Handle ISO format or Date object
      if (dateStr instanceof Date) {
        return dateStr;
      }
      
      return new Date(dateStr);
    } catch (error) {
      console.error("Error parsing date:", dateStr, error);
      return null;
    }
  };

  // Fetch remote work history
  const fetchRemoteHistory = async () => {
    if (!userid) return;

    try {
      const remoteResponse = await fetch(`${API_BASE_URL}/Remote-History/${userid}`);
      
      if (remoteResponse.ok) {
        const remoteData = await remoteResponse.json();
        const remoteRecords = remoteData.Remote_History || [];
        
        // Filter only approved remote work
        const approvedRemote = remoteRecords.filter(remote => {
          const status = (remote.status || '').toLowerCase();
          const recommendation = (remote.Recommendation || '').toLowerCase();
          return status === 'approved' || recommendation === 'approved';
        });
        
        setRemoteHistory(approvedRemote);
      }
    } catch (err) {
      console.error("Error fetching remote history:", err);
    }
  };

  // Fetch leave history for all types
  const fetchLeaveHistory = async () => {
    if (!userid) return;

    try {
      const [leaveResponse, lopResponse, permissionResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/leave-History/${userid}/?selectedOption=Leave`),
        fetch(`${API_BASE_URL}/leave-History/${userid}/?selectedOption=LOP`),
        fetch(`${API_BASE_URL}/leave-History/${userid}/?selectedOption=Permission`)
      ]);

      const leaveData = leaveResponse.ok ? await leaveResponse.json() : { leave_history: [] };
      const lopData = lopResponse.ok ? await lopResponse.json() : { leave_history: [] };
      const permissionData = permissionResponse.ok ? await permissionResponse.json() : { leave_history: [] };

      // Combine all leaves
      const allLeaves = [
        ...(leaveData.leave_history || []),
        ...(lopData.leave_history || []),
        ...(permissionData.leave_history || [])
      ];

      // Remove duplicates based on unique combination of key fields
      const uniqueLeaves = allLeaves.reduce((acc, current) => {
        // Create a unique key based on multiple fields
        const uniqueKey = `${current.selectedDate || current.requestDate || current.fromDate}-${current.leaveType || current.LeaveType}-${current.reason}-${current.selectedOption}`;
        
        // Check if this leave already exists in accumulator
        const isDuplicate = acc.some(item => {
          const itemKey = `${item.selectedDate || item.requestDate || item.fromDate}-${item.leaveType || item.LeaveType}-${item.reason}-${item.selectedOption}`;
          return itemKey === uniqueKey;
        });

        // Only add if not a duplicate
        if (!isDuplicate) {
          acc.push(current);
        }

        return acc;
      }, []);

      setLeaveHistory(uniqueLeaves);
    } catch (err) {
      console.error("Error fetching leave history:", err);
    }
  };

  const fetchAttendanceData = async (year) => {
    if (!userid) {
      setError("User ID is not available.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [statsResponse, recordsResponse, holidaysResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/attendance/user/${userid}?year=${year}`),
        fetch(`${API_BASE_URL}/attendance/manage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userid, date: "" })
        }),
        fetch(`${API_BASE_URL}/api/holidays/${year}`)
      ]);
      
      if (statsResponse.ok) {
        const data = await statsResponse.json();
        setAttendanceData(data);
      } else {
        setError(`Failed to fetch attendance data for ${year}`);
      }

      if (recordsResponse.ok) {
        const recordsData = await recordsResponse.json();
        const records = recordsData.attendance || [];
        setAttendanceRecords(records);
      }

      if (holidaysResponse.ok) {
        const holidaysData = await holidaysResponse.json();
        const holidaysList = holidaysData.holidays || [];
        setHolidays(holidaysList);
      }
    } catch (err) {
      console.error("Error fetching attendance data:", err);
      setError("Error fetching attendance data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userid) {
      fetchAttendanceData(selectedYear);
      fetchLeaveHistory();
      fetchRemoteHistory();
    }
  }, [selectedYear, userid]);

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  // Check if a date has approved remote work
  const isDateRemote = (year, month, day) => {
    if (!remoteHistory || remoteHistory.length === 0) return false;

    const checkDate = new Date(year, month, day);
    checkDate.setHours(0, 0, 0, 0);

    for (const remote of remoteHistory) {
      const fromDate = parseDate(remote.fromDate);
      const toDate = parseDate(remote.toDate);

      if (fromDate && toDate) {
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);

        if (checkDate >= fromDate && checkDate <= toDate) {
          return true;
        }
      }
    }

    return false;
  };

  // Get detailed information for a specific date
  const getDateDetails = (year, month, day) => {
    const currentDate = new Date(year, month, day);
    currentDate.setHours(0, 0, 0, 0);
    
    const details = {
      date: currentDate,
      holiday: null,
      leaves: [],
      remoteWork: [],
      isPresent: false,
      attendanceRecord: null
    };
    
    // Check holiday
    const holidayFound = holidays.find(h => {
      const holidayDate = parseDate(h.date);
      if (!holidayDate) return false;
      holidayDate.setHours(0, 0, 0, 0);
      return holidayDate.getTime() === currentDate.getTime();
    });
    
    if (holidayFound) {
      details.holiday = holidayFound;
    }
    
    // Check remote work
    if (remoteHistory && remoteHistory.length > 0) {
      for (const remote of remoteHistory) {
        const fromDate = parseDate(remote.fromDate);
        const toDate = parseDate(remote.toDate);

        if (fromDate && toDate) {
          fromDate.setHours(0, 0, 0, 0);
          toDate.setHours(23, 59, 59, 999);

          if (currentDate >= fromDate && currentDate <= toDate) {
            details.remoteWork.push(remote);
          }
        }
      }
    }
    
    // Check all leaves for this date
    if (leaveHistory && leaveHistory.length > 0) {
      for (const leave of leaveHistory) {
        const leaveStatus = (leave.status || '').toLowerCase();
        if (leaveStatus !== 'approved' && leaveStatus !== 'approve') {
          continue;
        }

        let isLeaveOnThisDate = false;

        // Check single date leave
        const leaveDate = parseDate(leave.selectedDate || leave.requestDate);
        if (leaveDate) {
          leaveDate.setHours(0, 0, 0, 0);
          
          if (currentDate.getTime() === leaveDate.getTime()) {
            isLeaveOnThisDate = true;
          }
        }

        // Check date range leave
        const fromDate = parseDate(leave.fromDate || leave.FromDate || leave.selectedDate);
        const toDate = parseDate(leave.toDate || leave.ToDate || leave.selectedDate);

        if (fromDate && toDate) {
          fromDate.setHours(0, 0, 0, 0);
          toDate.setHours(23, 59, 59, 999);

          if (currentDate >= fromDate && currentDate <= toDate) {
            isLeaveOnThisDate = true;
          }
        }

        if (isLeaveOnThisDate) {
          details.leaves.push(leave);
        }
      }
    }
    
    // Check present (only for past/today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (currentDate <= today) {
      const record = attendanceRecords.find(rec => {
        if (!rec.date) return false;
        const recDate = parseDate(rec.date);
        if (!recDate) return false;
        recDate.setHours(0, 0, 0, 0);
        return recDate.getTime() === currentDate.getTime();
      });
      
      if (record && record.clockin) {
        details.isPresent = true;
        details.attendanceRecord = record;
      }
    }
    
    return details;
  };

  // Check if a date has approved leave applied
  const isDateOnLeave = (year, month, day) => {
    if (!leaveHistory || leaveHistory.length === 0) return false;

    const checkDate = new Date(year, month, day);
    checkDate.setHours(0, 0, 0, 0);

    for (const leave of leaveHistory) {
      const leaveStatus = (leave.status || '').toLowerCase();
      if (leaveStatus !== 'approved' && leaveStatus !== 'approve') {
        continue;
      }

      const leaveDate = parseDate(leave.selectedDate || leave.requestDate);
      
      if (leaveDate) {
        leaveDate.setHours(0, 0, 0, 0);
        
        if (checkDate.getTime() === leaveDate.getTime()) {
          return true;
        }
      }

      const fromDate = parseDate(leave.fromDate || leave.FromDate || leave.selectedDate);
      const toDate = parseDate(leave.toDate || leave.ToDate || leave.selectedDate);

      if (fromDate && toDate) {
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);

        if (checkDate >= fromDate && checkDate <= toDate) {
          return true;
        }
      }
    }

    return false;
  };

  const getChartData = () => {
    if (!attendanceData) return [];

    const stats = attendanceData.attendance_stats;
    const absentDays = stats.total_working_days - stats.present_days - stats.leave_days_taken;
    const absentPercentage = 100 - stats.attendance_percentage - stats.leave_percentage;
    
    return [
      {
        metric: "Present",
        count: stats.present_days,
        percentage: stats.attendance_percentage,
        bgColor: "bg-green-500"
      },
      {
        metric: "Leave",
        count: stats.leave_days_taken,
        percentage: stats.leave_percentage,
        bgColor: "bg-red-500"
      },
      {
        metric: "Absent",
        count: absentDays,
        percentage: absentPercentage,
        bgColor: "bg-yellow-700"
      }
    ];
  };

  const StatCard = ({ icon, title, value, subtitle }) => (
    <div className="bg-white p-3 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-gray-50">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-600 truncate">{title}</p>
          <p className="text-lg font-bold text-blue-600">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  // Get attendance status for a specific date
  const getAttendanceStatus = (year, month, day) => {
    const currentDate = new Date(year, month, day);
    currentDate.setHours(0, 0, 0, 0);
    
    const statuses = [];
    
    // Check holiday
    const holidayFound = holidays.find(h => {
      const holidayDate = parseDate(h.date);
      if (!holidayDate) return false;
      holidayDate.setHours(0, 0, 0, 0);
      return holidayDate.getTime() === currentDate.getTime();
    });
    
    if (holidayFound) {
      statuses.push('holiday');
    }
    
    // Check remote work
    if (isDateRemote(year, month, day)) {
      statuses.push('remote');
    }
    
    // Check leave
    if (isDateOnLeave(year, month, day)) {
      statuses.push('leave');
    }
    
    // Check present (only for past/today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (currentDate <= today) {
      const record = attendanceRecords.find(rec => {
        if (!rec.date) return false;
        const recDate = parseDate(rec.date);
        if (!recDate) return false;
        recDate.setHours(0, 0, 0, 0);
        return recDate.getTime() === currentDate.getTime();
      });
      
      if (record && record.clockin) {
        statuses.push('present');
      }
    }
    
    if (statuses.length > 0) {
      return statuses;
    }
    
    if (currentDate > today) {
      return null;
    }
    
    return null;
  };

  // Calendar View Component
  const CalendarView = () => {
    const getDaysInMonth = (year, month) => {
      return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
      return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = () => {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentCalendarYear(currentCalendarYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    };

    const handleNextMonth = () => {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentCalendarYear(currentCalendarYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    };

    const handleDateClick = (day) => {
      setSelectedDate({ year: currentCalendarYear, month: currentMonth, day });
    };

    const daysInMonth = getDaysInMonth(currentCalendarYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentCalendarYear, currentMonth);
    const monthName = new Date(currentCalendarYear, currentMonth).toLocaleString('default', { month: 'long' });
    
    const days = [];
    
    // Empty cells for days before month starts (Monday = 0)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-14 border border-gray-200 bg-gray-50"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const status = getAttendanceStatus(currentCalendarYear, currentMonth, day);
      const today = new Date();
      const isToday = today.getDate() === day && 
                      today.getMonth() === currentMonth && 
                      today.getFullYear() === currentCalendarYear;
      
      const isSelected = selectedDate && 
                        selectedDate.day === day && 
                        selectedDate.month === currentMonth && 
                        selectedDate.year === currentCalendarYear;
      
      let bgColor = 'bg-white hover:bg-gray-50';
      let borderColor = 'border-gray-200';
      
      if (isSelected) {
        borderColor = 'border-purple-500 ring-2 ring-purple-500';
      } else if (isToday) {
        borderColor = 'border-blue-500 ring-1 ring-blue-500';
      }
      
      if (Array.isArray(status) && status.length > 0) {
        if (status.includes('present')) {
          bgColor = 'bg-green-50 hover:bg-green-100';
        } else if (status.includes('leave')) {
          bgColor = 'bg-red-50 hover:bg-red-100';
        } else if (status.includes('holiday')) {
          bgColor = 'bg-orange-50 hover:bg-orange-100';
        } else if (status.includes('remote')) {
          bgColor = 'bg-blue-50 hover:bg-blue-100';
        }
      }
      
      const dayOfWeek = new Date(currentCalendarYear, currentMonth, day).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      days.push(
        <div 
          key={day} 
          onClick={() => handleDateClick(day)}
          className={`h-14 border ${borderColor} ${bgColor} p-2 transition-colors cursor-pointer`}
        >
          <div className="flex flex-col h-full">
            <span className={`text-sm font-medium ${
              isToday ? 'text-blue-600 font-bold' : 
              isWeekend ? 'text-red-500' : 
              'text-gray-700'
            }`}>{day}</span>
            {status && status.length > 0 && (
              <div className="flex-1 flex items-center justify-center gap-1 mt-1">
                {status.map((s, idx) => (
                  <div 
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full ${
                      s === 'present' ? 'bg-green-500' :
                      s === 'leave' ? 'bg-red-500' :
                      s === 'holiday' ? 'bg-orange-500' :
                      s === 'remote' ? 'bg-blue-500' : ''
                    }`}
                    title={s}
                  ></div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Get details for selected date
    const selectedDateDetails = selectedDate 
      ? getDateDetails(selectedDate.year, selectedDate.month, selectedDate.day)
      : null;

    return (
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentCalendarYear(currentCalendarYear - 1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Previous year"
                >
                  <div className="flex">
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                    <ChevronLeft className="h-5 w-5 text-gray-600 -ml-3" />
                  </div>
                </button>
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Previous month"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                {monthName} {currentCalendarYear}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Next month"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setCurrentCalendarYear(currentCalendarYear + 1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Next year"
                >
                  <div className="flex">
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                    <ChevronRight className="h-5 w-5 text-gray-600 -ml-3" />
                  </div>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((dayName, i) => (
                <div key={i} className="text-xs font-bold text-gray-700 text-center py-3 bg-gray-100 border-r border-b border-gray-200 last:border-r-0">
                  {dayName}
                </div>
              ))}
              {days}
            </div>
          </div>

          {/* Selected Date Info Section - Takes 1 column */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {!selectedDate ? (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Select a Date
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Click on any date to view its details
                </p>

                {/* Legend */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Legend:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-500"></div>
                      <span className="text-sm text-gray-600">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-blue-500"></div>
                      <span className="text-sm text-gray-600">Remote Work</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-500"></div>
                      <span className="text-sm text-gray-600">Leave</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-orange-500"></div>
                      <span className="text-sm text-gray-600">Holiday</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {selectedDate.day}/{selectedDate.month + 1}/{selectedDate.year}
                  </h3>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {selectedDateDetails && (
                  <div className="space-y-4">
                    {/* Holiday Information */}
                    {selectedDateDetails.holiday && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5"></div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-orange-900">Holiday</p>
                            <p className="text-sm text-orange-800 mt-1">
                              {selectedDateDetails.holiday.name || selectedDateDetails.holiday.holidayName || 'Holiday'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Remote Work Information */}
                    {selectedDateDetails.remoteWork.length > 0 && (
                      <div className="space-y-2">
                        {selectedDateDetails.remoteWork.map((remote, idx) => (
                          <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-blue-900">
                                  Remote Work
                                </p>
                                {remote.reason && (
                                  <p className="text-sm text-blue-800 mt-1">
                                    <span className="font-medium">Reason:</span> {remote.reason}
                                  </p>
                                )}
                                {remote.ip && (
                                  <p className="text-xs text-blue-700 mt-1">
                                    IP: {remote.ip}
                                  </p>
                                )}
                                <p className="text-xs text-blue-700 mt-1">
                                  Period: {remote.fromDate} to {remote.toDate}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Leave Information */}
                    {selectedDateDetails.leaves.length > 0 && (
                      <div className="space-y-2">
                        {selectedDateDetails.leaves.map((leave, idx) => {
                          const fromDate = leave.fromDate || leave.FromDate || leave.selectedDate || leave.requestDate;
                          const toDate = leave.toDate || leave.ToDate || leave.selectedDate || leave.requestDate;
                          
                          return (
                            <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <div className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5"></div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-red-900">
                                    {leave.leaveType || leave.LeaveType || 'Leave'}
                                  </p>
                                  {leave.reason && (
                                    <p className="text-sm text-red-800 mt-1">
                                      <span className="font-medium">Reason:</span> {leave.reason}
                                    </p>
                                  )}
                                  {leave.selectedOption && (
                                    <p className="text-xs text-red-700 mt-1">
                                      Type: {leave.selectedOption}
                                    </p>
                                  )}
                                  {fromDate && toDate && (
                                    <p className="text-xs text-red-700 mt-1">
                                      Period: {fromDate} to {toDate}
                                    </p>
                                  )}
                                  {leave.timeSlot && (
                                    <p className="text-xs text-red-700 mt-1">
                                      Time Slot: {leave.timeSlot}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Present Information */}
                    {selectedDateDetails.isPresent && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-green-900">Present</p>
                            <p className="text-sm text-green-800 mt-1">
                              Employee was present on this day
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* No Information */}
                    {!selectedDateDetails.holiday && 
                     selectedDateDetails.leaves.length === 0 && 
                     selectedDateDetails.remoteWork.length === 0 &&
                     !selectedDateDetails.isPresent && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-sm text-gray-600 text-center">
                          No attendance, leave, or remote work records for this date
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Analytics View Component
  const AnalyticsView = () => (
    <div className="p-4 space-y-4">
      {/* Year Selector */}
      <div className="flex gap-2">
        {availableYears.map((year) => (
          <button
            key={year}
            onClick={() => handleYearChange(year)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedYear === year
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      {attendanceData && !loading && (
        <>
          {/* Compact Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <StatCard
              icon={<Calendar className="h-4 w-4 text-blue-600" />}
              title="Working Days"
              value={attendanceData.attendance_stats.total_working_days}
            />
            <StatCard
              icon={<UserCheck className="h-4 w-4 text-green-600" />}
              title="Present"
              value={attendanceData.attendance_stats.present_days}
              subtitle={`${attendanceData.attendance_stats.attendance_percentage.toFixed(1)}%`}
            />
            <StatCard
              icon={<Clock className="h-4 w-4 text-yellow-600" />}
              title="Leave"
              value={attendanceData.attendance_stats.leave_days_taken}
              subtitle={`${attendanceData.attendance_stats.leave_percentage.toFixed(1)}%`}
            />
          </div>

          {/* Compact Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Breakdown</h3>
            <CustomBarChart data={getChartData()} />
          </div>

          {/* Compact Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <p className="text-gray-600">
                  <span className="font-medium">Employee:</span> {attendanceData.user_info.name}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span> {attendanceData.user_info.email}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-600">
                  <span className="font-medium">Updated:</span>{" "}
                  {new Date(attendanceData.attendance_stats.last_updated).toLocaleDateString()}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Status:</span>{" "}
                  <span className={`font-medium ${
                    attendanceData.attendance_stats.attendance_percentage >= 75 
                      ? 'text-green-600' 
                      : attendanceData.attendance_stats.attendance_percentage >= 60 
                      ? 'text-yellow-600' 
                      : 'text-red-600'
                  }`}>
                    {attendanceData.attendance_stats.attendance_percentage >= 75 
                      ? 'Excellent' 
                      : attendanceData.attendance_stats.attendance_percentage >= 60 
                      ? 'Good' 
                      : 'Needs Improvement'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Attendance Management</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-blue-100">Track and manage your attendance records</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                activeTab === 'analytics'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              Attendance Analytics
              {activeTab === 'analytics' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                activeTab === 'calendar'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Show Calendar
              {activeTab === 'calendar' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          {activeTab === 'analytics' ? <AnalyticsView /> : <CalendarView />}
        </div>
      </div>
    </div>
  );
};

export default AttendanceStats;