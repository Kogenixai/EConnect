import React, { useState, useEffect, useRef } from "react";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { LS, ipadr } from '../../../Utils/Resuse';
import { ArrowUp, ArrowDown, ArrowUpDown, RotateCw, Search, X } from 'lucide-react';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { FaChartLine, FaPlus } from "react-icons/fa";


const LeaveDetails = () => {
  const [leaveData, setLeaveData] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('All');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [positionFilter, setPositionFilter] = useState('All');
  const datePickerRef = useRef(null);
  
  // State to store all available filter options (unfiltered)
  const [allFilterOptions, setAllFilterOptions] = useState({
    departments: [],
    positions: [],
    leaveTypes: []
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Date range
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  // Sorting
  const [sortConfig, setSortConfig] = useState({
    column: null,
    direction: 'asc'
  });

  // Progress visibility state
  const [showProgress, setShowProgress] = useState(false);

  // User info from localStorage
  const userId = LS.get('userid');
  const userPosition = LS.get('position');
  const userName = LS.get('name');
  const isAdmin = LS.get('isadmin');
  const userDepartment = LS.get('department');

  // Determine user role
  const getUserRole = () => {
    if (isAdmin) return 'admin';
    if (userDepartment === 'HR') return 'hr';
    if (userPosition === 'TL') return 'tl';
    return 'user';
  };

  const userRole = getUserRole();

  // Convert date format helper
  const convertDateFormat = (dateString) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
  };

  // Handle click outside to close date picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  // Fetch leave data based on user role
  const fetchLeaveData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = '';
      const params = new URLSearchParams();
      
      // Add filters as query parameters
      if (statusFilter !== 'All') params.append('statusFilter', statusFilter);
      if (leaveTypeFilter !== 'All') params.append('leaveTypeFilter', leaveTypeFilter);
      if (departmentFilter !== 'All') params.append('departmentFilter', departmentFilter);
      if (positionFilter !== 'All') params.append('positionFilter', positionFilter);
      
      switch (userRole) {
        case 'admin':
        case 'hr':
          url = `${ipadr}/leave_details/user/?${params.toString()}`;
          break;
        case 'tl':
          url = `${ipadr}/tl/leave_details/${userId}?${params.toString()}`;
          break;
        case 'user':
          setError('Access denied. Users cannot view leave management dashboard.');
          return;
        default:
          throw new Error('Unknown user role');
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch leave data');
      }
      const data = await response.json();
      setLeaveData(data);
      
      // Store all unique filter options when no filters are applied (initial load)
      if (statusFilter === 'All' && leaveTypeFilter === 'All' && departmentFilter === 'All' && positionFilter === 'All') {
        const leaveDetails = data.leave_details || [];
        const depts = [...new Set(leaveDetails.map(item => item.department).filter(Boolean))].sort();
        const pos = [...new Set(leaveDetails.map(item => item.position).filter(Boolean))].sort();
        const types = [...new Set(leaveDetails.map(item => item.leaveType).filter(Boolean))].sort();
        setAllFilterOptions({
          departments: depts,
          positions: pos,
          leaveTypes: types
        });
      }
      
      // Apply date range filter if set
      if (dateRange[0].startDate && dateRange[0].endDate) {
        filterDataByDateRange(data.leave_details || [], dateRange[0].startDate, dateRange[0].endDate);
      } else {
        setFilteredData(data.leave_details || []);
      }
      
    } catch (err) {
      setError(err.message);
      setLeaveData({});
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter data by date range
  const filterDataByDateRange = (data, startDate, endDate) => {
    if (!startDate || !endDate) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(item => {
      const itemDate = parseISO(convertDateFormat(item.selectedDate || item.requestDate));
      return isWithinInterval(itemDate, {
        start: startDate,
        end: endDate
      });
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // Handle date range change
  const handleDateRangeChange = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setDateRange([ranges.selection]);
    filterDataByDateRange(leaveData.leave_details || [], startDate, endDate);
  };

  // Reset filters
  const handleReset = () => {
    setDateRange([{
      startDate: null,
      endDate: null,
      key: "selection"
    }]);
    setStatusFilter('All');
    setLeaveTypeFilter('All');
    setDepartmentFilter('All');
    setPositionFilter('All');
    setSearchTerm('');
    setCurrentPage(1);
    setSortConfig({ column: null, direction: 'asc' });
    setShowDatePicker(false);
    setFilteredData(leaveData.leave_details || []);
    fetchLeaveData();
  };

  // Toggle sort
  const toggleSort = (column) => {
    setSortConfig(prevConfig => ({
      column,
      direction: prevConfig.column === column && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Get unique values for filters
  const getUniqueValues = (field) => {
    if (!leaveData.leave_details) return [];
    const values = [...new Set(leaveData.leave_details.map(item => item[field]).filter(Boolean))];
    return values.sort();
  };

  // Get filtered and searched records
  const getFilteredRecords = () => {
      let records = Array.isArray(filteredData) ? [...filteredData] : [];

    // Apply search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      records = records.filter(record =>
        record.employeeName?.toLowerCase().includes(q) ||
        record.email?.toLowerCase().includes(q) ||
        record.leaveType?.toLowerCase().includes(q) ||
        record.reason?.toLowerCase().includes(q)
      );
    }

    // Apply sorting if requested
    if (sortConfig.column) {
      const col = sortConfig.column;
      const dir = sortConfig.direction === 'asc' ? 1 : -1;

      records.sort((a, b) => {
        let va = a?.[col];
        let vb = b?.[col];

        // normalize date columns (dd-mm-yyyy -> ISO)
        if (col === 'requestDate' || col === 'selectedDate') {
          const ta = va ? new Date(convertDateFormat(va)).getTime() : 0;
          const tb = vb ? new Date(convertDateFormat(vb)).getTime() : 0;
          return (ta - tb) * dir;
        }
        // normalize status: treat missing status as 'Pending'
        if (col === 'status') {
          const sa = (va || 'Pending').toString().toLowerCase();
          const sb = (vb || 'Pending').toString().toLowerCase();
          return sa.localeCompare(sb) * dir;
        }

        // numeric compare when both values are numbers
        const na = Number(va);
        const nb = Number(vb);
        if (!isNaN(na) && !isNaN(nb)) {
          return (na - nb) * dir;
        }

        // fallback to case-insensitive string compare
        const sa = va ? va.toString().toLowerCase() : '';
        const sb = vb ? vb.toString().toLowerCase() : '';
        return sa.localeCompare(sb) * dir;
      });
    }

    return records;
  };

  useEffect(() => {
    if (userRole !== 'user') {
      fetchLeaveData();
    }
  }, [statusFilter, leaveTypeFilter, departmentFilter, positionFilter, userRole]);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'text-green-500';
      case 'Rejected':
        return 'text-red-500';
      case 'Recommend':
        return 'text-blue-500';
      case 'Not_Recommend':
        return 'text-orange-500';
      case 'Pending':
      default:
        return 'text-yellow-600';
    }
  };

  // Render sort icon
  const renderSortIcon = (column) => {
    if (sortConfig.column !== column) {
      return <ArrowUpDown className="inline ml-1 w-4 h-4" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="inline ml-1 w-4 h-4" />
      : <ArrowDown className="inline ml-1 w-4 h-4" />;
  };

  // Calculate summary stats
  const getSummaryStats = () => {
    const records = filteredData;
    return {
      total: records.length,
      approved: records.filter(r => r.status === 'Approved').length,
      pending: records.filter(r => !r.status || r.status === 'Pending').length,
      rejected: records.filter(r => r.status === 'Rejected').length,
      recommended: records.filter(r => r.status === 'Recommend').length,
      notRecommended: records.filter(r => r.status === 'Not_Recommend').length,
    };
  };

  // Get current page items
  const currentRecords = getFilteredRecords();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = currentRecords.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Access control for users
  if (userPosition?.toLowerCase() === "employee") {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md">
        <h1 className="text-xl font-semibold mb-2">Access Denied</h1>
        <p>Only Admin, TeamLead and HR can access this page.</p>
      </div>
    </div>
  );
}

  const summaryStats = getSummaryStats();
  const departments = allFilterOptions.departments.length > 0 ? allFilterOptions.departments : getUniqueValues('department');
  const positions = allFilterOptions.positions.length > 0 ? allFilterOptions.positions : getUniqueValues('position');
  const leaveTypes = allFilterOptions.leaveTypes.length > 0 ? allFilterOptions.leaveTypes : getUniqueValues('leaveType');

  return (
    <div className="mr-8 p-10 bg-white min-h-96 lg:min-h-[90vh] w-full shadow-black rounded-xl justify-center items-center relative jsonback ml-10 rounded-md">
      <div className="">
        {/* Header */}
        <div className="flex justify-between border-b-2 pb-4">
          <h1 className="text-5xl font-semibold font-inter pb-2 text-transparent bg-gradient-to-r from-zinc-600 to-zinc-950 bg-clip-text">
            Leave Management Dashboard
          </h1>
          <div className="flex items-center gap-4">
          <button
            onClick={() => setShowProgress(!showProgress)}
            className={`px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium flex items-center gap-2 ${
              showProgress
                ? "bg-blue-800 text-white hover:bg-blue-600 shadow-lg"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
            }`}
          >
            <FaChartLine
              className={`text-lg transition-transform duration-300 ${
                showProgress ? "rotate-180" : ""
              }`}
            />
            {showProgress ? "Hide Progress" : "Show Progress"}
          </button>


            <Link to={isAdmin ? "/admin/LeaveManage/leave_details/wfh_details" : "/User/LeaveManage/leave_details/wfh_details"}>
              <button className="bg-blue-500 hover:bg-blue-400 hover:text-slate-900 text-white text-sm font-inter px-4 py-2 rounded-full shadow-lg">
                Remote Details
              </button>
            </Link>
            <Link to={isAdmin ? "/admin/LeaveManage" : "/User/LeaveManage"}>
              <button className="bg-blue-400 hover:bg-blue-300 hover:text-slate-900 text-white text-sm font-inter px-4 py-2 rounded-full shadow-lg">
                Back to Overview
              </button>
            </Link>
          </div>
        </div>

        {/* Progress Section - Conditionally Rendered */}
        {showProgress && (
          <div className="relative my-3 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-2 border border-blue-200 shadow-md overflow-hidden">
            {/* Header with inline progress */}
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-base font-semibold text-gray-800 leading-snug">Leave Statistics Overview</h3>
            </div>

            {/* Compact grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-center">
              <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                <div className="text-lg font-bold text-blue-700 leading-none">
                  {summaryStats.total}
                </div>
                <div className="text-[11px] font-medium text-blue-600">Total Records</div>
              </div>

              <div className="bg-blue-50 p-2 rounded-lg border border-green-200">
                <div className="text-lg font-bold text-green-700 leading-none">
                  {summaryStats.approved}
                </div>
                <div className="text-[11px] font-medium text-green-600">Approved</div>
              </div>

              <div className="bg-blue-50 p-2 rounded-lg border border-yellow-200">
                <div className="text-lg font-bold text-yellow-700 leading-none">
                  {summaryStats.pending}
                </div>
                <div className="text-[11px] font-medium text-yellow-600">Pending</div>
              </div>

              <div className="bg-blue-50 p-2 rounded-lg border border-red-200">
                <div className="text-lg font-bold text-red-700 leading-none">
                  {summaryStats.rejected}
                </div>
                <div className="text-[11px] font-medium text-red-600">Rejected</div>
              </div>

              <div className="bg-blue-50 p-2 rounded-lg border border-indigo-200">
                <div className="text-lg font-bold text-indigo-700 leading-none">
                  {summaryStats.recommended}
                </div>
                <div className="text-[11px] font-medium text-indigo-600">Recommended</div>
              </div>

              <div className="bg-blue-50 p-2 rounded-lg border border-orange-200">
                <div className="text-lg font-bold text-orange-700 leading-none">
                  {summaryStats.notRecommended}
                </div>
                <div className="text-[11px] font-medium text-orange-600">Not Recommended</div>
              </div>
            </div>

            </div>
        )}

        {/* Main Content */}
        <div className="w-full bg-gradient-to-b from-white to-blue-50 shadow-lg rounded-xl border border-gray-200 my-2 mt-4">
          {/* Filters Header */}
          <header className="flex flex-wrap justify-between items-center px-5 py-4 border-b border-gray-200 gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Status Filter */}
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[140px]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Recommend">Recommended</option>
                <option value="Not_Recommend">Not Recommended</option>
              </select>

              {/* Leave Type Filter */}
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[140px]"
                value={leaveTypeFilter}
                onChange={(e) => setLeaveTypeFilter(e.target.value)}
                style={{ position: 'relative', zIndex: 10 }}
              >
                <option value="All">All Leave Types</option>
                {leaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              {/* Department Filter - Only for Admin/HR */}
              {(userRole === 'admin' || userRole === 'hr') && (
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[140px]"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  style={{ position: 'relative', zIndex: 10 }}
                >
                  <option value="All">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              )}

              {/* Position Filter - Only for Admin/HR */}
              {(userRole === 'admin' || userRole === 'hr') && (
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[140px]"
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  style={{ position: 'relative', zIndex: 10 }}
                >
                  <option value="All">All Positions</option>
                  {positions.map(position => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                Reset
              </button>

              {/* Date Range */}
                <div className="relative" ref={datePickerRef}>
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {showDatePicker ? 'Hide Date Range' : 'Show Date Range'}
                </button>
                {showDatePicker && (
                  <div className="absolute right-0 top-12 z-50 bg-white shadow-lg rounded-md border">
                    <DateRangePicker
                      ranges={dateRange}
                      onChange={handleDateRangeChange}
                      moveRangeOnFirstSelection={false}
                      months={2}
                      direction="horizontal"
                      preventSnapRefocus={true}
                      calendarFocus="backwards"
                    />
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Results Info */}
          <div className="px-5 py-2 text-sm text-gray-600 bg-gray-50">
            Showing {currentItems.length} of {currentRecords.length} records
            {searchTerm && (
              <span className="ml-2 text-blue-600">matching "{searchTerm}"</span>
            )}
            {userRole === 'tl' && leaveData.manager_info && (
              <span className="ml-4 text-gray-800">
                TL: <strong>{leaveData.manager_info.manager_name}</strong>
              </span>
            )}
          </div>

          {/* Table */}
          <div className="p-3">
            <div className="overflow-x-auto">
              <table className="table-auto w-full">
                <thead className="text-sm font-semibold uppercase text-black bg-[#6d9eeb7a]">
                  <tr>
                    <th className="p-2 whitespace-nowrap text-start">S.No</th>
                    <th className="p-2 whitespace-nowrap text-start cursor-pointer" onClick={() => toggleSort('employeeName')}>
                      Employee {renderSortIcon('employeeName')}
                    </th>
                    <th className="p-2 whitespace-nowrap text-start">Leave Type</th>
                    <th className="p-2 whitespace-nowrap text-start cursor-pointer" onClick={() => toggleSort('selectedDate')}>
                      Date(s) {renderSortIcon('selectedDate')}
                    </th>
                    <th className="p-2 whitespace-nowrap text-start cursor-pointer" onClick={() => toggleSort('requestDate')}>
                      Request Date {renderSortIcon('requestDate')}
                    </th>
                    <th className="p-2 whitespace-nowrap text-start" style={{ width: "25%" }}>Reason</th>
                    {(userRole === 'admin' || userRole === 'hr') && (
                      <>
                        <th className="p-2 whitespace-nowrap text-start">Department</th>
                        <th className="p-2 whitespace-nowrap text-start">Position</th>
                      </>
                    )}
                    <th className="p-2 whitespace-nowrap text-start cursor-pointer" onClick={() => toggleSort('status')}>
                      Status {renderSortIcon('status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={(userRole === 'admin' || userRole === 'hr') ? "9" : "7"} className="p-2 whitespace-nowrap font-inter text-center">
                        <div className="font-medium text-center">Loading...</div>
                      </td>
                    </tr>
                  ) : currentItems.length > 0 ? (
                    currentItems.map((record, index) => (
                      <tr key={record._id || index} className="hover:bg-gray-50">
                        <td className="p-2 whitespace-nowrap w-fit">
                          <div className="font-medium text-start w-fit">
                            {indexOfFirstItem + index + 1}.
                          </div>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <div className="font-medium text-start">
                            {record.employeeName}
                          </div>
                          <div className="text-xs text-gray-500">{record.email}</div>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <div className="font-medium text-start">
                            {record.leaveType}
                          </div>
                          {record.timeSlot && (
                            <div className="text-xs text-gray-500">{record.timeSlot}</div>
                          )}
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <div className="font-medium text-start">
                            {record.selectedDate}
                          </div>
                          {record.ToDate && record.ToDate !== record.selectedDate && (
                            <div className="text-xs text-gray-500">to {record.ToDate}</div>
                          )}
                        </td>
                        <td className="p-2 whitespace-nowrap w-fit">
                          <div className="font-medium text-start w-fit">
                            {record.requestDate}
                          </div>
                        </td>
                        <td className="p-2 whitespace-normal">
                          <div className="font-medium text-start" title={record.reason}>
                            {record.reason}
                          </div>
                        </td>
                        {(userRole === 'admin' || userRole === 'hr') && (
                          <>
                            <td className="p-2 whitespace-nowrap">
                              <div className="font-medium text-start">
                                {record.department || 'N/A'}
                              </div>
                            </td>
                            <td className="p-2 whitespace-nowrap">
                              <div className="font-medium text-start">
                                {record.position || 'N/A'}
                              </div>
                            </td>
                          </>
                        )}
                        <td className="p-2 whitespace-nowrap">
                          <div className={`font-medium text-start ${getStatusColor(record.status || 'Pending')}`}>
                            {record.status || 'Pending'}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={(userRole === 'admin' || userRole === 'hr') ? "9" : "7"} className="p-2 whitespace-nowrap">
                        <div className="font-medium text-center">
                          {searchTerm 
                            ? `No records found matching "${searchTerm}"` 
                            : (statusFilter !== 'All' || leaveTypeFilter !== 'All' || departmentFilter !== 'All' || positionFilter !== 'All')
                              ? 'No records match the selected filters'
                              : 'No data available'}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-2 flex justify-between items-center">
          <div>
            <button
              className="py-1 px-3 bg-blue-500 hover:bg-blue-400 hover:text-slate-900 text-white text-sm font-inter rounded-full shadow-lg mr-2"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className="py-1 px-3 bg-blue-500 hover:bg-blue-400 hover:text-slate-900 text-white text-sm font-inter rounded-full shadow-lg"
              onClick={() => paginate(currentPage + 1)}
              disabled={indexOfLastItem >= currentRecords.length}
            >
              Next
            </button>
          </div>
          <div className="text-sm font-semibold text-gray-800">
            Page {currentRecords.length > 0 ? currentPage : 0} of{" "}
            {currentRecords.length > 0 ? Math.ceil(currentRecords.length / itemsPerPage) : 0}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default LeaveDetails;