import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { LS, ipadr } from "../../../Utils/Resuse";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { ArrowUp, ArrowDown, ArrowUpDown, RotateCw } from "lucide-react";
import { format, isWithinInterval, parseISO } from 'date-fns';

const Wfh = () => {
  const [leaveData, setLeaveData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const datePickerRef = useRef(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);
  const [sortConfig, setSortConfig] = useState({
    column: null,
    direction: 'asc'
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const Position = LS.get('position')
  
  const isadmin = LS.get('isadmin');
  const fetchData = async () => {
    try {
      // Determine role based on user info
      let role = "";
      if (LS.get("isadmin") === true) {
        role = "admin";
      } else if (LS.get("position") === "TL") {
        role = "tl";
      } else if (LS.get("department") === "HR") {
        role = "hr";
      }

      // Build request parameters
      const requestParams = {
        role: role,
      };

      // Add TL parameter for tl role
      if (role === "tl") {
        requestParams.TL = LS.get("name");
        requestParams.show_processed = false; // Set to true if you want to show history
      }

      console.log("Remote Work API Request:", requestParams);
      
      // Use the new combined endpoint
      const response = await axios.get(`${ipadr}/remote_work_requests`, { 
        params: requestParams 
      });
      
      console.log("Remote Work API Response:", response);

      // Check for errors in response
      if (response.data.error) {
        console.error("API Error:", response.data.error);
        setLeaveData([]);
        setFilteredData([]);
        return;
      }

      const remoteWorkData = response.data?.remote_work_requests || [];
      setLeaveData(remoteWorkData);
      setFilteredData(remoteWorkData);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setLeaveData([]);
      setFilteredData([]);
      const finalData = sortConfig.column ? sortData(remoteWorkData, sortConfig.column, sortConfig.direction) : remoteWorkData;
      setLeaveData(remoteWorkData);
      setFilteredData(finalData);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


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

  // Rest of your component code remains the same...
  const filterDataByDateRange = (startDate, endDate) => {
        if (!startDate || !endDate) {
          setFilteredData(leaveData);
          return;
        }
    
        const filtered = leaveData.filter(item => {
          const itemDate = parseISO(convertDateFormat(item.selectedDate || item.requestDate));
          return isWithinInterval(itemDate, {
            start: startDate,
            end: endDate
          });
        });
    
        const sortedData = sortConfig.column
          ? sortData(filtered, sortConfig.column, sortConfig.direction)
          : filtered;

        setFilteredData(sortedData);
        setCurrentPage(1);
      };
      const convertDateFormat = (dateString) => {
        if (!dateString) return '';
        const [day, month, year] = dateString.split('-');
        return `${year}-${month}-${day}`;
      };

   const sortData = (data = [], column, direction = 'asc') => {
    const getVal = (row) => {
      if (!row) return '';
      if (column === 'fromDate') return row.fromDate || row.selectedDate || row.requestDate || '';
      if (column === 'toDate') return row.toDate || '';
      return row[column] ?? '';
    };

    const parseIfDate = (v) => {
      if (!v) return 0;
      // if format is dd-mm-yyyy convert to iso
      if (typeof v === 'string' && v.includes('-') && v.split('-').length === 3) {
        const iso = convertDateFormat(v);
        const d = new Date(iso);
        return isNaN(d) ? 0 : d.getTime();
      }
      const d = new Date(v);
      return isNaN(d) ? 0 : d.getTime();
    };

    return [...data].sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);
       if (['fromDate', 'toDate'].includes(column)) {
        const na = parseIfDate(va);
        const nb = parseIfDate(vb);
        return direction === 'asc' ? na - nb : nb - na;
      }

      const naNum = Number(va);
      const nbNum = Number(vb);
      if (!isNaN(naNum) && !isNaN(nbNum)) {
        return direction === 'asc' ? naNum - nbNum : nbNum - naNum;
      }

      return direction === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
  };

  const handleDateRangeChange = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setDateRange([ranges.selection]);
    filterDataByDateRange(startDate, endDate);
  };

  const toggleSort = (column) => {
   setSortConfig(prevConfig => {
      const newDirection = prevConfig.column === column && prevConfig.direction === 'asc' ? 'desc' : 'asc';
      // apply sort immediately to displayed data
      setFilteredData((current) => sortData(current, column, newDirection));
      return { column, direction: newDirection };
    });
  };

  const renderSortIcon = (column) => {
    if (sortConfig.column !== column) {
      return <ArrowUpDown className="inline ml-1 w-4 h-4" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="inline ml-1 w-4 h-4" />
      : <ArrowDown className="inline ml-1 w-4 h-4" />;
  };

  const handleReset = () => {
    setDateRange([{
      startDate: null,
      endDate: null,
      key: "selection"
    }]);
    setFilteredData(leaveData);
    setCurrentPage(1);
    setSortConfig({ column: null, direction: 'asc' });
    setShowDatePicker(false);
  };

  const updateStatus = async (userid, status,id) => {
    try {
      console.log("id:",id);
      const formData = new FormData();
      formData.append("status", status);
      formData.append("userid", userid);
      formData.append("id",id);
      if(LS.get('position')==="TL" || isadmin)
      {
        await axios.put(
          `${ipadr}/recommend_remote_work_requests`,
          formData
        );
      }
      else if(LS.get('department')==="HR")
      {
        await axios.put(
          `${ipadr}/update_remote_work_requests`,
          formData
        ); 
      }
      fetchData();
     

      // Update status locally
      const updatedData = leaveData.map((row) => {
        if (row.id === userid) {
          return { ...row, status: status };
        }
        return row;
      });
      setLeaveData(updatedData);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };


console.log("filter data:",filteredData);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
   (Position?.toLowerCase() === "employee") ? (
  <div className="min-h-screen flex items-center justify-center">
    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md">
      <h1 className="text-xl font-semibold mb-2">Access Denied</h1>
      <p>Only Admin, TeamLead and HR can access this page.</p>
    </div>
  </div>
) : (
      <div className="mr-8 p-10 bg-white min-h-96 lg:min-h-[90vh] w-full shadow-black rounded-xl justify-center items-center relative jsonback ml-10 rounded-md">
        <div>
          <div className="flex justify-between border-b-2">
            
            <h1 className="text-5xl font-semibold font-inter pb-2 text-transparent bg-gradient-to-r from-zinc-600 to-zinc-950 bg-clip-text">
              Remote Work Approvals
            </h1>
            {
              isadmin ?(
                <div>
                 
                  <Link to="/admin/LeaveManage">
                    <button className="bg-blue-500 hover:bg-blue-400 hover:text-slate-900 text-white text-sm font-inter px-4 py-2 rounded-full shadow-lg">
                      Back
                    </button>
                  </Link>
              </div>
              ) :(
                <div>
               
                  <Link to="/User/LeaveManage">
                    <button className="bg-blue-500 hover:bg-blue-400 hover:text-slate-900 text-white text-sm font-inter px-4 py-2 rounded-full shadow-lg">
                      Back
                    </button>
                </Link>
              </div>
              )
            }
            
          </div>
          <div className="w-full bg-gradient-to-b from-white to-blue-50 shadow-lg rounded-xl border border-gray-200 my-2 mt-10">
          <header className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">Remote Work Requests</h2>
              <div className="flex items-center gap-4">
              <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center gap-2"
                >
                  <RotateCw className="w-4 h-4" />
                  Reset
                </button>
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
                          />
                        </div>
                      )}
                    </div>
                  
                  </div>
            </header>
            <div className="p-3">
              <table className="table-auto w-full overflow-y-auto">
                <thead className="text-sm font-semibold uppercase text-black bg-[#6d9eeb7a]">
                  <tr>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">S.No</div>
                    </th>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">Employee ID</div>
                    </th>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">Name</div>
                    </th>
                    <th 
                  className="p-2 whitespace-nowrap text-start cursor-pointer"
                  onClick={() => toggleSort('fromDate')}
                >
                  FROM DATE {renderSortIcon('fromDate')}
                </th>
                <th 
                  className="p-2 whitespace-nowrap text-start cursor-pointer"
                  onClick={() => toggleSort('toDate')}
                >
                  TO DATE {renderSortIcon('toDate')}
                </th>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">Reason</div>
                    </th>
                    <th className="p-2 whitespace-nowrap">
                      <div className="font-semibold text-center">Status</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {currentItems.map((row, index) => (
                    <tr key={index}>
                      <td className="p-2 whitespace-nowrap">
                        <div className="font-medium text-center">
                          {(currentPage - 1) * itemsPerPage + index + 1}.
                        </div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="font-medium text-center">{row.userid}</div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="font-medium text-center">{row.employeeName}</div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="font-medium text-center">{row.fromDate}</div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="font-medium text-center">{row.toDate}</div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="font-medium text-center">{row.reason}</div>
                      </td>
                      <td className="p-2">
                        {LS.get('department') === "HR" ? (
                          // HR sees recommended requests and can Approve/Reject
                          row.status === "Approved" ? (
                            <p className="text-green-500 font-inter text-center">Approved</p>
                          ) : row.status === "Rejected" ? (
                            <p className="text-red-500 font-inter text-center">Rejected</p>
                          ) : (
                            <div className="flex justify-center">
                              <button
                                style={{ backgroundColor: "#34D399" }}
                                className="h-8 w-8 rounded-full text-white mr-4"
                                onClick={() => updateStatus(row.userid, "Approved", row.id)}
                              >
                                ✓
                              </button>
                              <button
                                style={{ backgroundColor: "#EF4444" }}
                                className="h-8 w-8 rounded-full text-white"
                                onClick={() => updateStatus(row.userid, "Rejected", row.id)}
                              >
                                ✗
                              </button>
                            </div>
                          )
                        ) : LS.get('position') === 'TL' || isadmin ? (
                          // Check if the request is from a TL or HR employee
                          (() => {
                            const isTLOrHREmployee = row.position === "TL" || 
                                                          row.position === "HR" ||
                                                          row.employeeDepartment === "HR";
                            
                            if (isadmin && isTLOrHREmployee) {
                              // Admin handling TL/HR remote work requests - Direct Approve/Reject
                              return row.status === "Approved" ? (
                                <p className="text-green-500 font-inter text-center">Approved</p>
                              ) : row.status === "Rejected" ? (
                                <p className="text-red-500 font-inter text-center">Rejected</p>
                              ) : (
                                <div className="flex justify-center">
                                  <button
                                    style={{ backgroundColor: "#34D399" }}
                                    className="h-8 w-8 rounded-full text-white mr-4"
                                    onClick={() => updateStatus(row.userid, "Approved", row.id)}
                                  >
                                    ✓
                                  </button>
                                  <button
                                    style={{ backgroundColor: "#EF4444" }}
                                    className="h-8 w-8 rounded-full text-white"
                                    onClick={() => updateStatus(row.userid, "Rejected", row.id)}
                                  >
                                    ✗
                                  </button>
                                </div>
                              );
                            } else {
                              // TL or Admin handling regular employee remote work requests - Recommend/Not Recommend
                              return row.status === "Recommend" ? (
                                <p className="text-green-500 font-inter text-center">Recommend</p>
                              ) : row.status === "Not_Recommend" ? (
                                <p className="text-red-500 font-inter text-center">Not Recommend</p>
                              ) : (
                                <div className="flex justify-center">
                                  <button
                                    style={{ backgroundColor: "#34D399" }}
                                    className="h-8 w-8 rounded-full text-white mr-4 flex items-center justify-center p-0"
                                    onClick={() => updateStatus(row.userid, "Recommend", row.id)}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-check-fill" viewBox="0 0 16 16">
                                      <path fillRule="evenodd" d="M15.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L12.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
                                      <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                                    </svg>
                                  </button>
                                  <button
                                    style={{ backgroundColor: "#EF4444" }}
                                    className="h-8 w-8 rounded-full text-white flex items-center justify-center p-0"
                                    onClick={() => updateStatus(row.userid, "Not_Recommend", row.id)}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-fill-slash" viewBox="0 0 16 16">
                                      <path d="M13.879 10.414a2.501 2.501 0 0 0-3.465 3.465zm.707.707-3.465 3.465a2.501 2.501 0 0 0 3.465-3.465m-4.56-1.096a3.5 3.5 0 1 1 4.949 4.95 3.5 3.5 0 0 1-4.95-4.95ZM11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-9 8c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/>
                                    </svg>
                                  </button>
                                </div>
                              );
                            }
                          })()
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-2 flex justify-between items-center">
            <div className="flex gap-2">
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
                disabled={indexOfLastItem >= leaveData.length}
              >
                Next
              </button>
            </div>
            <div className="text-sm font-semibold text-gray-800">
              Page {leaveData.length > 0 ? currentPage : 0} of{" "}
              {leaveData.length > 0 ? Math.ceil(leaveData.length / itemsPerPage) : 0}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Wfh;