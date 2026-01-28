import { Link } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { LS, ipadr } from "../../Utils/Resuse";
import { ArrowUp, ArrowDown, ArrowUpDown, RotateCw } from "lucide-react";
import { DateRangePicker } from "react-date-range";
import { format, isWithinInterval, parseISO } from 'date-fns';

const Remote_details = () => {
  const [RemoteWorkData, setRemoteWorkData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const datePickerRef = useRef(null);
  const [itemsPerPage] = useState(5);
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userid = LS.get("userid");
      const response = await axios.get(`${ipadr}/Remote-History/${userid}`);
      
      const responseData = response.data && Array.isArray(response.data.Remote_History)
        ? response.data.Remote_History
        : [];
      
      setRemoteWorkData(responseData);
      setFilteredData(responseData);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      setRemoteWorkData([]);
      setFilteredData([]);
      setError("Error fetching data. Please try again later.");
    }
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

  const convertDateFormat = (dateString) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
  };

  const filterDataByDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) {
      setFilteredData(RemoteWorkData);
      return;
    }

    const filtered = RemoteWorkData.filter(item => {
      const fromDate = parseISO(convertDateFormat(item.fromDate));
      const toDate = parseISO(convertDateFormat(item.toDate));
      
      return (
        isWithinInterval(fromDate, { start: startDate, end: endDate }) ||
        isWithinInterval(toDate, { start: startDate, end: endDate })
      );
    });

    const sortedData = sortConfig.column 
      ? sortData(filtered, sortConfig.column) 
      : filtered;
    
    setFilteredData(sortedData);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setDateRange([ranges.selection]);
    filterDataByDateRange(startDate, endDate);
  };

  const handleReset = () => {
    setDateRange([{
      startDate: null,
      endDate: null,
      key: "selection"
    }]);
    setFilteredData(RemoteWorkData);
    setCurrentPage(1);
    setSortConfig({ column: null, direction: 'asc' });
  };

  const sortData = (data, column) => {
    return [...data].sort((a, b) => {
      let compareA, compareB;

      switch (column) {
        case 'requestDate':
        case 'fromDate':
        case 'toDate':
          compareA = new Date(convertDateFormat(a[column])).getTime();
          compareB = new Date(convertDateFormat(b[column])).getTime();
          break;
        default:
          compareA = a[column];
          compareB = b[column];
      }

      if (compareA < compareB) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (compareA > compareB) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const toggleSort = (column) => {
    setSortConfig(prevConfig => {
      const newConfig = {
        column,
        direction: 
          prevConfig.column === column && prevConfig.direction === 'asc' 
            ? 'desc' 
            : 'asc'
      };
      
      const newSortedData = sortData(filteredData, column);
      setFilteredData(newSortedData);
      
      return newConfig;
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="mr-8 p-10 bg-white min-h-96 lg:min-h-[90vh] w-full shadow-black rounded-xl justify-center items-center relative jsonback ml-10 rounded-md">
      <div className="flex justify-between border-b-2">
        <h1 className="text-5xl font-semibold font-poppins pb-4 text-transparent bg-gradient-to-r from-zinc-600 to-zinc-950 bg-clip-text">
          Remotework Management
        </h1>
        <div className="flex justify-end my-4">
          <Link to="/User/Leave/LeaveHistory">
            <button className="px-4 py-2 text-base bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black active:bg-white active:text-white">
              Leave Details
            </button>
          </Link>
        </div>
      </div>

      <div className="w-full bg-gradient-to-b from-white to-blue-50 shadow-lg rounded-xl border border-gray-200 my-2 mt-10">
        <header className="flex justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold font-poppins">
            Remotework History
          </h2>
          <div className="relative flex items-center gap-2">
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

        <div className="p-3">
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : currentItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="text-xs text-black uppercase bg-[#6d9eeb7a]">
                  <tr>
                    <th 
                      scope="col" 
                      className="p-2 font-poppins text-center cursor-pointer"
                      onClick={() => toggleSort('requestDate')}
                    >
                      Date {renderSortIcon('requestDate')}
                    </th>
                    <th scope="col" className="p-2 font-poppins text-center">
                      Employee ID
                    </th>
                    <th scope="col" className="p-2 font-poppins text-center">
                      Employee Name
                    </th>
                    <th 
                      scope="col"
                      className="p-2 font-poppins text-center cursor-pointer"
                      onClick={() => toggleSort('fromDate')}
                    >
                      From Date {renderSortIcon('fromDate')}
                    </th>
                    <th 
                      scope="col"
                      className="p-2 font-poppins text-center cursor-pointer"
                      onClick={() => toggleSort('toDate')}
                    >
                      To Date {renderSortIcon('toDate')}
                    </th>
                    <th scope="col" className="p-2 font-poppins text-center">
                      Reason
                    </th>
                    <th scope="col" className="p-2 font-poppins text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700 bg-white">
                  {currentItems.map((RemoteWork, index) => (
                    <tr key={index}>
                      <td scope="col" className="p-2 font-poppins text-center">
                        {RemoteWork.requestDate}
                      </td>
                      <td scope="col" className="p-2 font-poppins text-center">
                        {RemoteWork.userid}
                      </td>
                      <td scope="col" className="p-2 font-poppins text-center">
                        {RemoteWork.employeeName}
                      </td>
                      <td scope="col" className="p-2 font-poppins text-center">
                        {RemoteWork.fromDate}
                      </td>
                      <td scope="col" className="p-2 font-poppins text-center">
                        {RemoteWork.toDate}
                      </td>
                      <td scope="col" className="p-2 font-poppins text-center">
                        {RemoteWork.reason}
                      </td>
                      <td
                        scope="col"
                        className={`p-2 font-poppins text-center ${
                          RemoteWork.status || RemoteWork.Recommendation === "Approved"
                            ? "text-green-500"
                            : RemoteWork.status || RemoteWork.Recommendation === "Rejected"
                            ? "text-red-500"
                            : ""
                        }`}
                      >
                        {RemoteWork.status || RemoteWork.Recommendation || "Pending"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm italic font-poppins text-center">No records found</p>
          )}
        </div>

        <div className="mt-4 px-3 pb-3 flex justify-between items-center">
          <div>
            <button
              className="py-1 px-3 bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black active:bg-white active:text-white mr-2"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className="py-1 px-3 bg-blue-500 rounded-md text-white hover:bg-[#b7c6df80] hover:text-black active:bg-white active:text-white"
              onClick={() => paginate(currentPage + 1)}
              disabled={indexOfLastItem >= filteredData.length}
            >
              Next
            </button>
          </div>
          <div className="text-sm font-semibold text-gray-800">
            Page {filteredData.length > 0 ? currentPage : 0} of{" "}
            {Math.ceil(filteredData.length / itemsPerPage)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Remote_details;