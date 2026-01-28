import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faDownload, faExclamationTriangle, faSort, faSortUp, faSortDown } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { ipadr } from "../../Utils/Resuse";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRangePicker } from "react-date-range";
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import * as XLSX from 'xlsx';
import { LS } from "../../Utils/Resuse";

const Timemanagement = () => {
const position = LS.get('position');
const pos = (position || '').toString().toLowerCase();

if (pos === 'employee' || pos === 'tl') {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md text-center">
        <h1 className="text-xl font-semibold mb-2">Access Denied</h1>
        <p>Only HR can access this page.</p>
      </div>
    </div>
  );
}

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  // Table sorting logic
  const [dateSortDirection, setDateSortDirection] = useState('asc');

  const handleDateSort = () => {
    setDateSortDirection(dateSortDirection === 'asc' ? 'desc' : 'asc');
  };

  const sortedData = React.useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    return [...filteredData].sort((a, b) => {
      const aDate = new Date(a.date);
      const bDate = new Date(b.date);
      if (dateSortDirection === 'asc') {
        return aDate - bDate;
      } else {
        return bDate - aDate;
      }
    });
  }, [filteredData, dateSortDirection]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [searchTerm, setSearchTerm] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpToPage, setJumpToPage] = useState('');
  const itemsPerPage = 5;

  const datePickerRef = useRef(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const employeeDropdownRef = useRef(null);
  const [showFilters, setShowFilters] = useState(true);
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  // Use sortedData for pagination
  const currentItems = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Generate years array for dropdown (current year and past 9 years)
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 10; i++) {
      years.push((currentYear - i).toString());
    }
    return years;
  };

  const years = generateYears();

  // Handle click outside to close date picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
        setShowEmployeeDropdown(false);
      }
    };

    if (showDatePicker || showEmployeeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker, showEmployeeDropdown]);

  // Fetch data when component mounts or when search/date changes
  useEffect(() => {
    fetchData();
  }, [selectedDate, searchTerm]);

  // Effect to filter data when date range, search term, or year changes
  useEffect(() => {
    filterData();
  }, [attendanceData, dateRange, searchTerm, selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Request all attendance records, not just for a specific date
      const response = await axios.post(
        `${ipadr}/attendance/manage`,
        {}
      );
      const data = response.data && Array.isArray(response.data.attendance)
        ? response.data.attendance
        : [];
      setAttendanceData(data);
      setLoading(false);
      setError(null);
    } catch (error) {
      setLoading(false);
      setAttendanceData([]);
      setError("Error fetching data");
    }
  };

  const filterData = () => {
    let filtered = [...attendanceData];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by year if selected
    if (selectedYear) {
      filtered = filtered.filter(item => {
        const itemDate = parseISO(item.date);
        return itemDate.getFullYear().toString() === selectedYear;
      });
    }

    // Filter by date range
    if (dateRange[0].startDate && dateRange[0].endDate) {
      filtered = filtered.filter(item => {
        const itemDate = parseISO(item.date);
        return isWithinInterval(itemDate, {
          start: startOfDay(dateRange[0].startDate),
          end: endOfDay(dateRange[0].endDate)
        });
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleDateRangeChange = (ranges) => {
    setDateRange([ranges.selection]);
    setSelectedMonth("");
    setSelectedYear("");
  };

  // Clear all filters function
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedYear(new Date().getFullYear().toString());
    setDateRange([{
      startDate: null,
      endDate: null,
      key: "selection",
    }]);
    setSelectedEmployees([]);
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return searchTerm !== "" || 
           selectedYear !== new Date().getFullYear().toString() ||
           (dateRange[0].startDate !== null && dateRange[0].endDate !== null) ||
           selectedEmployees.length > 0;
  };

  // Format date range for display
  const getDateRangeDisplay = () => {
    if (dateRange[0].startDate && dateRange[0].endDate) {
      const start = format(dateRange[0].startDate, 'MMM dd, yyyy');
      const end = format(dateRange[0].endDate, 'MMM dd, yyyy');
      return `${start} - ${end}`;
    }
    return null;
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const date = new Date(timeString);
      // Check if date is valid
      if (isNaN(date.getTime())) return timeString;
      // Format as HH:MM:SS AM/PM
      return format(date, 'hh:mm:ss a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return dateString;
      // Format as DD/MM/YYYY
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const formatDateTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const date = new Date(timeString);
      // Check if date is valid
      if (isNaN(date.getTime())) return timeString;
      // Format as DD/MM/YYYY HH:MM:SS AM/PM
      return format(date, 'dd/MM/yyyy hh:mm:ss a');
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return timeString;
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const paginate = (pageNumber) => {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleJumpToPage = (e) => {
    e.preventDefault();
    const pageNum = parseInt(jumpToPage);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setJumpToPage('');
    }
  };

  // Get unique employee names for dropdown
  const getUniqueEmployees = () => {
    const uniqueNames = [...new Set(attendanceData.map(item => item.name))];
    return uniqueNames.sort();
  };

  // Handle employee selection
  const handleEmployeeToggle = (employeeName) => {
    if (selectedEmployees.includes(employeeName)) {
      setSelectedEmployees(selectedEmployees.filter(name => name !== employeeName));
    } else {
      setSelectedEmployees([...selectedEmployees, employeeName]);
    }
  };

  // Clear all selected employees
  const clearSelectedEmployees = () => {
    setSelectedEmployees([]);
  };

  // Download data for selected employees
  const downloadSelectedEmployees = () => {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee to download');
      return;
    }

    const selectedData = filteredData.filter(item => 
      selectedEmployees.includes(item.name)
    );
    
    const formattedData = selectedData.map((item, index) => ({
      'S.No': index + 1,
      'User ID': item.userid,
      'Name': item.name,
      'Date': formatDateOnly(item.date),
      'Clock In': formatTime(item.clockin),
      'Clock Out': formatTime(item.clockout),
      'Total Hours Worked': item.total_hours_worked || 'N/A',
      'Status': item.status,
      'Remark': item.remark || 'N/A'
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    
    const wscols = [
      { wch: 6 },  { wch: 15 }, { wch: 20 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 10 }, { wch: 15 }
    ];
    worksheet['!cols'] = wscols;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Data");
    
    let filename = selectedEmployees.length === 1 
      ? `${selectedEmployees[0].replace(/\s+/g, '_')}_attendance`
      : 'selected_employees_attendance';
    
    if (selectedYear) {
      filename += `_${selectedYear}`;
    }
    if (dateRange[0].startDate && dateRange[0].endDate) {
      const startDate = format(dateRange[0].startDate, 'yyyy-MM-dd');
      const endDate = format(dateRange[0].endDate, 'yyyy-MM-dd');
      filename += `_${startDate}_to_${endDate}`;
    }
    filename += '.xlsx';
    
    XLSX.writeFile(workbook, filename);
    setSelectedEmployees([]); // Clear selection after download
  };

  const downloadExcel = () => {
    // Format the data before exporting to match the table display
    const formattedData = filteredData.map((item, index) => ({
      'S.No': index + 1,
      'User ID': item.userid,
      'Name': item.name,
      'Date': formatDateOnly(item.date),
      'Clock In': formatTime(item.clockin),
      'Clock Out': formatTime(item.clockout),
      'Total Hours Worked': item.total_hours_worked || 'N/A',
      'Status': item.status,
      'Remark': item.remark || 'N/A'
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    
    // Auto-size columns
    const maxWidth = 20;
    const wscols = [
      { wch: 6 },  // S.No
      { wch: 15 }, // User ID
      { wch: 20 }, // Name
      { wch: 12 }, // Date
      { wch: 12 }, // Clock In
      { wch: 12 }, // Clock Out
      { wch: 18 }, // Total Hours Worked
      { wch: 10 }, // Status
      { wch: 15 }  // Remark
    ];
    worksheet['!cols'] = wscols;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Data");
    
    // Generate filename with year and date range info
    let filename = 'attendance_data';
    if (selectedYear) {
      filename += `_${selectedYear}`;
    }
    if (dateRange[0].startDate && dateRange[0].endDate) {
      const startDate = format(dateRange[0].startDate, 'yyyy-MM-dd');
      const endDate = format(dateRange[0].endDate, 'yyyy-MM-dd');
      filename += `_${startDate}_to_${endDate}`;
    }
    filename += '.xlsx';
    
    XLSX.writeFile(workbook, filename);
  };

  const getYearMinMaxDates = (year) => {
    if (!year) return { minDate: null, maxDate: null };
    const minDate = new Date(Number(year), 0, 1);
    const maxDate = new Date(Number(year), 11, 31);
    return { minDate, maxDate };
  };

  return (
    
    <div className="mr-8 p-10 bg-white min-h-96 lg:min-h-[90vh] w-full shadow-black rounded-xl justify-center items-center relative jsonback ml-10 rounded-md">
      <div className="">
        <h1 className="text-5xl font-semibold font-inter pb-2 text-transparent bg-gradient-to-r from-zinc-600 to-zinc-950 bg-clip-text border-b-2">
          Clock In & Clock Out
        </h1>

        {/* Filter Status Bar - Compact */}
        <div className="bg-white border-sm border-blue-200 p-3 my-3 flex flex-wrap items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors font-medium text-xs shadow-sm"
            >
              <FontAwesomeIcon icon={faSearch} className="text-xs" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            {/* Record Count Badge */}
            <div className="px-3 py-1.5 bg-white text-blue-700 rounded-md font-semibold text-xs border border-blue-300 shadow-sm">
              {filteredData.length} / {attendanceData.length} records
            </div>
            {/* Active Filter Badges - Compact */}
            {searchTerm && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded-md text-xs border border-blue-300">
                <span className="font-medium"> "{searchTerm}"</span>
                <button 
                  onClick={() => setSearchTerm("")}
                  className="hover:text-blue-900 ml-1 font-bold text-sm"
                >✕</button>
              </div>
            )}
            {selectedYear && selectedYear !== new Date().getFullYear().toString() && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded-md text-xs border border-blue-300">
                <span className="font-medium">{selectedYear}</span>
                <button 
                  onClick={() => setSelectedYear(new Date().getFullYear().toString())}
                  className="hover:text-blue-900 ml-1 font-bold text-sm"
                >✕</button>
              </div>
            )}
            {getDateRangeDisplay() && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded-md text-xs border border-blue-300">
                <span className="font-medium">{getDateRangeDisplay()}</span>
                <button 
                  onClick={() => setDateRange([{ startDate: null, endDate: null, key: "selection" }])}
                  className="hover:text-blue-900 ml-1 font-bold text-sm"
                >✕</button>
              </div>
            )}
            {selectedEmployees.length > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded-md text-xs border border-blue-300">
                <span className="font-medium">{selectedEmployees.length} selected</span>
                <button 
                  onClick={clearSelectedEmployees}
                  className="hover:text-blue-900 ml-1 font-bold text-sm"
                >✕</button>
              </div>
            )}
          </div>
          {/* Clear All Filters Button */}
          {hasActiveFilters() && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-1.5 border border-red-200 bg-white text-red-500 rounded-md hover:bg-red-200 transition-colors font-medium text-xs shadow-sm"
            >
              ✕ Clear All
            </button>
          )}
        </div>

        {/* Collapsible Filters Section - Compact Design */}
        {showFilters && (
          <div className="bg-blue-100 rounded-lg border border-blue-200 p-4 mb-4 transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Filter - Compact */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Search Employee</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter name..."
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FontAwesomeIcon icon={faSearch} className="text-xs" />
                  </div>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 font-bold"
                    >✕</button>
                  )}
                </div>
              </div>

              {/* Time Filter - Compact Two-Column Layout */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Time Period</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setDateRange([{ startDate: null, endDate: null, key: "selection" }]);
                    }}
                    className="px-2 py-2 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  >
                    <option value="">All Years</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  
                  <div className="relative" ref={datePickerRef}>
                    <button
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="w-full px-2 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm text-left flex items-center justify-between shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <span className="truncate text-xs">{getDateRangeDisplay() ? 'Custom Range' : 'Date Range'}</span>
                      
                    </button>
                    {showDatePicker && (
                      <>
                        {/* Backdrop to close on outside click */}
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setShowDatePicker(false)}
                        />
                        {/* Date picker container with proper positioning and scroll */}
                        <div
                          className="absolute left-0 top-full mt-2 z-50 bg-white shadow-2xl rounded-lg border border-gray-300"
                          style={{ maxHeight: '400px', overflowY: 'auto', minWidth: '320px' }}
                        >
                          <DateRangePicker
                            minDate={new Date(2016,0,1)}
                            maxDate={new Date(2025,11,31)}
                            ranges={dateRange}
                            onChange={handleDateRangeChange}
                            moveRangeOnFirstSelection={false}
                            // minDate={selectedYear ? new Date(Number(selectedYear), 0, 1) : undefined}
                            // maxDate={selectedYear ? new Date(Number(selectedYear), 11, 31) : undefined}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Employees Filter - Compact */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Select Employees</label>
                <div className="relative" ref={employeeDropdownRef}>
                  <button
                    onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm flex items-center justify-between shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <span className="text-sm">
                      {selectedEmployees.length > 0 
                        ? `${selectedEmployees.length} Selected` 
                        : 'All Employees'}
                    </span>
                    <span className="text-gray-500">{showEmployeeDropdown ? '▲' : '▼'}</span>
                  </button>
                  {showEmployeeDropdown && (
                    <div className="absolute left-0 top-full mt-2 z-50 bg-white shadow-xl rounded-lg border border-gray-300 w-full max-h-64 overflow-y-auto">
                      <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 p-2 border-b flex justify-between items-center">
                        <span className="text-xs font-semibold text-gray-700">Choose Employees</span>
                        {selectedEmployees.length > 0 && (
                          <button
                            onClick={clearSelectedEmployees}
                            className="text-xs text-red-600 hover:text-red-800 font-medium"
                          >Clear All</button>
                        )}
                      </div>
                      <div className="p-2">
                        {getUniqueEmployees().length > 0 ? (
                          getUniqueEmployees().map(name => (
                            <label
                              key={name}
                              className="flex items-center p-2 hover:bg-blue-300 rounded-md cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedEmployees.includes(name)}
                                onChange={() => handleEmployeeToggle(name)}
                                className="mr-3 w-4 h-4 cursor-pointer accent-blue-500"
                              />
                              <span className="text-sm text-gray-700">{name}</span>
                            </label>
                          ))
                        ) : (
                          <div className="p-4 text-sm text-gray-500 text-center">No employees found</div>
                        )}
                      </div>
                      {selectedEmployees.length > 0 && (
                        <div className="sticky bottom-0 bg-gray-100 p-3 border-t">
                          <button
                            onClick={() => {
                              downloadSelectedEmployees();
                              setShowEmployeeDropdown(false);
                            }}
                            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2 font-medium"
                          >
                            <FontAwesomeIcon icon={faDownload} />
                            Download Selected
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Apply Filters Info */}
            {/* <div className="mt-4 text-center text-sm text-gray-600 bg-gray-50 rounded-md p-3 border border-gray-200">
              <span className="font-medium">💡 Tip:</span> Filters are applied automatically as you make changes
            </div> */}
          </div>
        )}

        <div className="w-full bg-gradient-to-b from-white to-blue-50 shadow-lg rounded-xl border border-gray-200 my-2">
          <div className="p-3">
            <div>
              {error && <p className="text-red-500">{error}</p>}
              <table className="table-auto w-full overflow-y-auto">
                <thead className="text-sm font-semibold uppercase text-black bg-[#6d9eeb7a]">
                  <tr>
                    <th scope="col" className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">S.No</div>
                    </th>
                    <th scope="col" className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">Name</div>
                    </th>
                    <th scope="col" className="p-2 whitespace-nowrap cursor-pointer select-none  transition-all duration-200 rounded" onClick={handleDateSort}>
                        <div className="font-semibold text-center flex items-center justify-center gap-1">
                          Date
                          <span className="text-xs">
                            {dateSortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        </div>
                      </th>
                    <th scope="col" className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">Login Time</div>
                    </th>
                    <th scope="col" className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">Logout Time</div>
                    </th>
                    <th scope="col" className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">Total Hours of Working</div>
                    </th>
                    <th scope="col" className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">Status</div>
                    </th>
                    <th scope="col" className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">Remark</div>
                    </th>
                  </tr>
                </thead>

                <tbody className="text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="p-2 whitespace-nowrap font-inter text-center">
                        <div className="font-medium text-center">Loading...</div>
                      </td>
                    </tr>
                  ) : currentItems.length > 0 ? (
                    currentItems.map((row, index) => (
                      <tr
                        key={index}
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'} hover:bg-blue-200 transition-colors duration-150`}
                      >
                        <td scope="col" className="p-2 whitespace-nowrap">
                          <div className="font-medium text-center">
                            {index + 1 + (currentPage - 1) * itemsPerPage}.
                          </div>
                        </td>
                        <td scope="col" className="p-2 whitespace-nowrap">
                          <div className="font-medium text-center">{row.name}</div>
                        </td>
                        <td scope="col" className="p-2 whitespace-nowrap">
                          <div className="font-medium text-center">{formatDateOnly(row.date)}</div>
                        </td>
                        <td scope="col" className="p-2 whitespace-nowrap">
                          <div className="font-medium text-center">{formatTime(row.clockin)}</div>
                        </td>
                        <td scope="col" className="p-2 whitespace-nowrap">
                          <div className="font-medium text-center">{formatTime(row.clockout)}</div>
                        </td>
                        <td scope="col" className="p-2 whitespace-nowrap">
                          <div className="font-medium text-center">{row.total_hours_worked}</div>
                        </td>
                        <td scope="col" className="p-2 whitespace-nowrap">
                          <div className="font-medium text-center">{row.status}</div>
                        </td>
                        <td scope="col" className="p-2 whitespace-nowrap">
                          <div className="font-medium text-center">{row.remark}</div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-2 whitespace-nowrap">
                        <div className="font-medium text-center">No data available</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              className="py-1 px-3 bg-blue-500 hover:bg-blue-400 text-white text-sm font-inter rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {(() => {
                const totalPages = Math.ceil(filteredData.length / itemsPerPage);
                const pages = [];
                const maxPagesToShow = 5;
                
                let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
                let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
                
                if (endPage - startPage < maxPagesToShow - 1) {
                  startPage = Math.max(1, endPage - maxPagesToShow + 1);
                }
                
                if (startPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => paginate(1)}
                      className="px-3 py-1 rounded-md text-sm font-medium bg-gray-100 hover:bg-blue-100 text-gray-700"
                    >
                      1
                    </button>
                  );
                  if (startPage > 2) {
                    pages.push(<span key="ellipsis1" className="px-2">...</span>);
                  }
                }
                
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => paginate(i)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        currentPage === i
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-blue-100 text-gray-700'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }
                
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(<span key="ellipsis2" className="px-2">...</span>);
                  }
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => paginate(totalPages)}
                      className="px-3 py-1 rounded-md text-sm font-medium bg-gray-100 hover:bg-blue-100 text-gray-700"
                    >
                      {totalPages}
                    </button>
                  );
                }
                
                return pages;
              })()}
            </div>
            
            <button
              className="py-1 px-3 bg-blue-500 hover:bg-blue-400 text-white text-sm font-inter rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => paginate(currentPage + 1)}
              disabled={indexOfLastItem >= filteredData.length}
            >
              Next
            </button>
          </div>
          
          <div className="text-sm font-semibold text-gray-800">
            Page {filteredData.length > 0 ? currentPage : 0} of{" "}
            {filteredData.length > 0
              ? Math.ceil(filteredData.length / itemsPerPage)
              : 0}
          </div>
          <button
            className="py-2 px-4 bg-blue-600 hover:bg-green-600 text-white text-sm font-inter rounded-md shadow-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={downloadExcel}
            disabled={filteredData.length === 0}
          >
            <FontAwesomeIcon icon={faDownload} /> 
            Download All
          </button>
        </div>
      </div>
    </div>
  );
};

export default Timemanagement;