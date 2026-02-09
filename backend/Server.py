from fastapi import FastAPI
app = FastAPI()
from Mongo import should_permanently_delete, Otherleave_History_Details,Permission_History_Details, Users,admin,normal_leave_details,store_Other_leave_request,get_remote_work_requests,attendance_details,leave_History_Details,Remote_History_Details,get_attendance_by_date,update_remote_work_request_status_in_mongo,updated_user_leave_requests_status_in_mongo,get_user_leave_requests, get_employee_id_from_db,store_Permission_request, get_all_users, get_admin_info, add_task_list, edit_the_task, delete_a_task, get_the_tasks, delete_leave, get_user_info, store_sunday_request, get_admin_info, add_an_employee, PreviousDayClockout, auto_clockout, recommend_manager_leave_requests_status_in_mongo, get_manager_leave_requests, get_only_user_leave_requests, get_admin_page_remote_work_requests, update_remote_work_request_recommend_in_mongo, get_TL_page_remote_work_requests,auto_approve_manager_leaves,edit_an_employee,get_managers,task_assign_to_multiple_users, get_team_members, get_local_ip, get_public_ip, assigned_task, get_single_task, get_user_by_position, get_manager_hr_assigned_tasks, get_hr_self_assigned_tasks, get_manager_only_tasks, create_notification, get_notifications, mark_notification_read, mark_all_notifications_read, get_unread_notification_count, delete_notification, get_notifications_by_type, create_task_notification, create_leave_notification, create_wfh_notification, create_system_notification, create_attendance_notification, notify_leave_submitted, notify_leave_approved, notify_leave_rejected, notify_leave_recommended, notify_wfh_submitted, notify_wfh_approved, notify_wfh_rejected, store_leave_request, store_remote_work_request, get_admin_user_ids, get_hr_user_ids, get_user_position, notify_admin_manager_leave_request, notify_hr_recommended_leave, notify_hr_pending_leaves, notify_admin_pending_leaves, get_current_timestamp_iso, Notifications, notify_manager_leave_request, get_user_manager_id
from model import Item4,Item,Item2,Item3,Csvadd,Csvedit,Csvdel,CT,Item5,Item6,Item9,RemoteWorkRequest,Item7,Item8, Tasklist, Taskedit, Deletetask, Gettasks, DeleteLeave,TaskEditRequest, Item9, AddEmployee,EditEmployee,Taskassign, SingleTaskAssign, NotificationModel, NotificationUpdate, NotificationFilter, NotificationManage, AttendanceManage, DeleteMessageRequest
from fastapi import FastAPI, HTTPException,Path,Query, HTTPException,Form, Request, WebSocket, WebSocketDisconnect
from websocket_manager import notification_manager
from Mongo import Leave, RemoteWork, Otherleave_History_Details,Permission_History_Details, Users,admin,normal_leave_details,store_Other_leave_request,get_remote_work_requests,attendance_details,leave_History_Details,Remote_History_Details,get_attendance_by_date,update_remote_work_request_status_in_mongo,updated_user_leave_requests_status_in_mongo,get_user_leave_requests, get_employee_id_from_db,store_Permission_request, get_all_users, get_admin_info, add_task_list, edit_the_task, delete_a_task, get_the_tasks, delete_leave, get_user_info, store_sunday_request, get_admin_info, add_an_employee, PreviousDayClockout, auto_clockout, recommend_manager_leave_requests_status_in_mongo, get_manager_leave_requests, get_only_user_leave_requests, get_admin_page_remote_work_requests, update_remote_work_request_recommend_in_mongo, get_TL_page_remote_work_requests,auto_approve_manager_leaves,edit_an_employee,get_managers,task_assign_to_multiple_users, task_assign_to_multiple_users_with_notification, get_team_members, get_local_ip, get_public_ip, assigned_task, get_single_task, get_manager_only_tasks, insert_holidays, get_holidays, calculate_working_days, calculate_user_attendance_stats, get_user_attendance_dashboard, get_team_attendance_stats, get_department_attendance_stats, get_manager_team_attendance, update_daily_attendance_stats, get_TL_page_remote_work_requests_with_history
from model import Item4,Item,Item2,Item3,Csvadd,Csvedit,Csvdel,CT,Item5,Item6,Item9,RemoteWorkRequest,Item7,Item8, Tasklist, Taskedit, Deletetask, Gettasks, DeleteLeave, TaskEditRequest, Item9, AddEmployee,EditEmployee,Taskassign, SingleTaskAssign, HolidayYear, Holiday
from fastapi import FastAPI, HTTPException,Path,Query, HTTPException,Form, Request
from fastapi.responses import JSONResponse
from fastapi.responses import RedirectResponse
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends, FastAPI,Body
from auth.auth_bearer import JWTBearer
from http.client import HTTPException
from datetime import datetime, timedelta, date
from dateutil import parser
from typing import Union, Dict, List, Optional, Literal
from bson import ObjectId
from bson import json_util
import json
import uvicorn
import Mongo
import pytz
import os
import uuid
from typing import List,Any, Dict
from fastapi import UploadFile, File
from fastapi.responses import FileResponse
import uuid, os
from datetime import datetime
from bson import ObjectId
import asyncio
from dotenv import load_dotenv
import requests
import re
load_dotenv() 

# GridFS setup
from pymongo import MongoClient
import gridfs
mongo_url = os.environ.get("MONGODB_URI")
client = MongoClient(
    mongo_url,
    serverSelectionTimeoutMS=30000,
    connectTimeoutMS=30000,
    socketTimeoutMS=30000
) 
db = client["RBG_AI"]  
fs = gridfs.GridFS(db)

from fastapi import UploadFile, File
from fastapi.responses import FileResponse
import uuid, os
from datetime import datetime
from bson import ObjectId
import json
from bson import Binary, ObjectId
import shutil
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
import io
import pytz
from bson import Binary
import uvicorn
import traceback
import uuid
from bson import ObjectId
from fastapi import (
    Body,
    Depends,
    FastAPI,
    Form,
    HTTPException,
    Path,
    Query,
    Request,
    WebSocket,
    WebSocketDisconnect,
    File,
    UploadFile,
    Form,

     
)
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from ws_manager import DirectChatManager, GeneralChatManager, NotifyManager,GroupChatManager

import Mongo
from Mongo import (
    Otherleave_History_Details,
    Permission_History_Details,
    normal_leave_details,
    store_Other_leave_request,
    get_remote_work_requests,
    attendance_details,
    leave_History_Details,
    Remote_History_Details,
    get_attendance_by_date,
    update_remote_work_request_status_in_mongo,
    updated_user_leave_requests_status_in_mongo,
    get_user_leave_requests,
    get_employee_id_from_db,
    store_Permission_request,
    get_all_users,
    get_admin_info,
    add_task_list,
    edit_the_task,
    delete_a_task,
    get_the_tasks,
    delete_leave,
    get_user_info,
    store_sunday_request,
    get_admin_info,
    add_an_employee,
    PreviousDayClockout,
    auto_clockout,
    recommend_manager_leave_requests_status_in_mongo,
    get_manager_leave_requests,
    get_only_user_leave_requests,
    get_admin_page_remote_work_requests,
    update_remote_work_request_recommend_in_mongo,
    get_TL_page_remote_work_requests,
    auto_approve_manager_leaves,
    edit_an_employee,
    get_managers,
    task_assign_to_multiple_users,
    task_assign_to_multiple_users_with_notification,
    get_team_members,
    assigned_task,
    get_single_task,
    get_public_ip,
    get_local_ip,
    get_allowed_contacts,
    append_chat_message,
    get_chat_history,
    chats_collection,
    threads_collection,
    groups_collection,
    update_file_status,
    get_assigned_docs,
    save_file_to_db,
    assign_docs,
    assignments_collection,
    Users,
    messages_collection,
    files_collection,
    create_meeting
    
    
    
    
)
from model import (
    
    AssignPayload,
    Message,
    ThreadMessage,
    Reaction,
    ChatHistoryResponse,
    PresencePayload,
    AssignPayload,
    ReviewPayload,
    ReviewDocument,
    GroupCreate,
    GroupUpdate,
   UpdateGroupPayload,
   MeetingAssignBaseModel
)
from auth.auth_bearer import JWTBearer
direct_chat_manager = DirectChatManager()

active_users: Dict[str, WebSocket] = {}
active_connections: Dict[str, WebSocket] = {}
# Task-specific chat manager


direct_chat_manager = DirectChatManager()
chat_manager = GeneralChatManager()
notify_manager = NotifyManager()
group_ws_manager = GroupChatManager()

import atexit

# Utility function to serialize MongoDB documents to JSON
def serialize_mongo_doc(doc):
    """
    Convert MongoDB document to JSON-serializable format.
    Handles ObjectId, datetime, date, and nested structures.
    """
    if not doc:
        return None
    
    if isinstance(doc, list):
        return [serialize_mongo_doc(item) for item in doc]
    
    if not isinstance(doc, dict):
        if isinstance(doc, ObjectId):
            return str(doc)
        elif isinstance(doc, (datetime, date)):
            return doc.isoformat()
        return doc
    
    # Convert ObjectId and datetime fields to strings
    serialized = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            serialized[key] = str(value)
        elif isinstance(value, datetime):
            serialized[key] = value.isoformat()
        elif isinstance(value, date):
            serialized[key] = value.isoformat()
        elif isinstance(value, list):
            # Handle lists that might contain ObjectIds, datetimes, or dicts
            serialized[key] = [serialize_mongo_doc(item) for item in value]
        elif isinstance(value, dict):
            # Recursively handle nested dictionaries
            serialized[key] = serialize_mongo_doc(value)
        else:
            serialized[key] = value
    
    return serialized



# Get CORS origins from environment or use defaults
allowed_origins_env = os.environ.get("ALLOWED_ORIGINS", "")
if allowed_origins_env:
    origins = [origin.strip() for origin in allowed_origins_env.split(",")]
else:
    origins = [
       "*"
    ]

print(f"CORS Allowed Origins: {origins}")

# Add CORS middleware FIRST (order matters!)
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add security headers after CORS
# @app.middleware("http")
# async def add_security_headers(request: Request, call_next):
#     try:
#         # Handle preflight requests
#         if request.method == "OPTIONS":
#             response = JSONResponse(content={}, status_code=200)
#             origin = request.headers.get("origin", "")
#             if origin in origins:
#                 response.headers["Access-Control-Allow-Origin"] = origin
#             response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
#             response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept, Origin, X-Requested-With"
#             response.headers["Access-Control-Allow-Credentials"] = "true"
#             response.headers["Access-Control-Max-Age"] = "3600"
#             return response
            
#         response = await call_next(request)
        
#         # Security Headers - OWASP Recommended
#         response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
#         response.headers["X-Content-Type-Options"] = "nosniff"
#         response.headers["X-Frame-Options"] = "DENY"
#         response.headers["X-XSS-Protection"] = "1; mode=block"
#         response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
#         response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
        
#         # Content Security Policy - Allow Google Sign-In, Swagger UI CDN and other third-party services
#         response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https: wss:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        
#         # Ensure CORS headers are always present
#         origin = request.headers.get("origin")
#         if origin in origins:
#             response.headers["Access-Control-Allow-Origin"] = origin
#             response.headers["Access-Control-Allow-Credentials"] = "true"
            
#         return response
#     except Exception as e:
#         # Ensure CORS headers are present even on errors
#         print(f"Error in middleware: {str(e)}")
#         traceback.print_exc()
        
#         origin = request.headers.get("origin", "")
#         response = JSONResponse(
#             content={"error": "Internal server error", "details": str(e)},
#             status_code=500
#         )
        
#         # Add security headers to error responses as well
#         response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
#         response.headers["X-Content-Type-Options"] = "nosniff"
#         response.headers["X-Frame-Options"] = "DENY"
#         response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
#         response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
#         response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https: wss:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        
#         if origin in origins:
#             response.headers["Access-Control-Allow-Origin"] = origin
#             response.headers["Access-Control-Allow-Credentials"] = "true"
            
#         return response

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}  # userid -> WebSocket

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        self.active_connections.pop(user_id, None)

    async def send_personal_message(self, message: dict, user_id: str):
        ws = self.active_connections.get(user_id)
        if ws:
            await ws.send_json(message)

manager = ConnectionManager()


# Initialize APScheduler for background tasks with IST timezone
# CRITICAL: Must use IST timezone to ensure jobs run at correct India time
ist_tz = pytz.timezone("Asia/Kolkata")
scheduler = BackgroundScheduler(timezone=ist_tz)

# Import notification automation
from notification_automation import (
    run_all_automated_checks, 
    check_and_notify_overdue_tasks,
    check_missed_attendance,
    check_pending_approvals
)

# Schedule the auto-clockout task to run daily at 9:30 PM (21:30 IST)
# This ensures employees who forget to clock out are automatically clocked out at end of day
scheduler.add_job(auto_clockout, 'cron', hour=21, minute=30, timezone=ist_tz, id='auto_clockout')

# Define sync wrapper functions for async tasks


def sync_check_missed_attendance():
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(check_missed_attendance())
        loop.close()
    except Exception as e:
        print(f"Error in sync_check_missed_attendance: {e}")

def sync_check_and_notify_overdue_tasks():
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(check_and_notify_overdue_tasks())
        loop.close()
    except Exception as e:
        print(f"Error in sync_check_and_notify_overdue_tasks: {e}")

def sync_run_all_automated_checks():
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(run_all_automated_checks())
        loop.close()
    except Exception as e:
        print(f"Error in sync_run_all_automated_checks: {e}")

def sync_check_pending_approvals():
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(check_pending_approvals())
        loop.close()
    except Exception as e:
        print(f"Error in sync_check_pending_approvals: {e}")

# Schedule notification automation tasks
# Morning checks at 8:00 AM IST (upcoming deadlines, missed attendance, and overdue tasks)


# TEST: Run overdue notification check every minute for immediate testing

# Overdue notification checks at 10:00, 12:00, and 15:00 IST
scheduler.add_job(
    sync_check_and_notify_overdue_tasks,
    'cron', hour=10, minute=0, timezone=ist_tz, id='overdue_check_10am'
)
scheduler.add_job(
    sync_check_and_notify_overdue_tasks,
    'cron', hour=12, minute=0, timezone=ist_tz, id='overdue_check_12noon'
)
scheduler.add_job(
    sync_check_and_notify_overdue_tasks,
    'cron', hour=15, minute=0, timezone=ist_tz, id='overdue_check_3pm'
)

scheduler.add_job(
    sync_check_missed_attendance,
    'cron', hour=10, minute=0, timezone=ist_tz, id='missed_attendance_check'
)

# Evening comprehensive check at 6:00 PM IST
scheduler.add_job(
    sync_run_all_automated_checks,
    'cron', hour=18, minute=0, timezone=ist_tz, id='evening_comprehensive_check'
)

# Pending approvals check twice daily (10 AM and 3 PM IST)
scheduler.add_job(
    sync_check_pending_approvals,
    'cron', hour=10, minute=30, timezone=ist_tz, id='morning_approvals_check'
)

scheduler.add_job(
    sync_check_pending_approvals,
    'cron', hour=15, minute=0, timezone=ist_tz, id='afternoon_approvals_check'
)


# Add new job for daily attendance stats update at 11:59 PM IST
scheduler.add_job(
    update_daily_attendance_stats,
    'cron',
    hour=23,
    minute=59,  # Run at 11:59 PM daily
    timezone=ist_tz,
    id='daily_attendance_update'
)


# Add job to run attendance update at startup
scheduler.add_job(
    update_daily_attendance_stats,
    'date',  # Run once at startup
    id='startup_attendance_update'
)


# Start the scheduler
scheduler.start()
atexit.register(lambda: scheduler.shutdown())

# Initialize task scheduler on application startup
@app.on_event("startup")
async def startup_event():
    """Initialize task deadline scheduler when the application starts"""
    try:
        # Create indexes for better query performance
        try:
            assignments_collection.create_index("_id")
            Users.create_index("userid")
            Users.create_index("_id")
            print("✅ Database indexes created/verified")
        except Exception as idx_err:
            print(f"⚠️ Index creation warning: {idx_err}")
        
        task_scheduler = Mongo.setup_task_scheduler()
        # if task_scheduler:
        #     print("✅ Task deadline monitoring system initialized")
        # else:
        #     print("⚠️ Failed to initialize task deadline scheduler")
            
    except Exception as e:
        print(f"❌ Error initializing task scheduler: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup scheduler when application shuts down"""
    try:
        if scheduler:
            scheduler.shutdown()
            print("✅ Background scheduler shut down successfully")
    except Exception as e:
        print(f"⚠️ Error shutting down scheduler: {e}")

@app.post("/signup")
def Signup(item: Item):
    jwt=Mongo.Signup(item.email,item.password,item.name)
    print(jwt)
    return jwt

@app.post("/signin")
def Signup(item: Item2):
    c=Mongo.signin(item.email,item.password)
    return c

# Google Signin
@app.post("/Gsignin")
async def Signup(item: Item5):
    try:
        jwt = Mongo.Gsignin(item.client_name, item.email)
        print("Google Signin Response:", jwt)
        
        # Ensure the response is JSON serializable
        # Convert to JSON string using bson json_util, then parse back
        json_str = json_util.dumps(jwt)
        json_data = json.loads(json_str)
        
        return JSONResponse(content=json_data, status_code=200)
    except HTTPException as http_exc:
        # Re-raise HTTPException to be handled by FastAPI
        raise http_exc
    except Exception as e:
        print(f"Error in /Gsignin: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Time Management
@app.post('/Clockin')
def clockin(Data: CT):
    from datetime import datetime
    import pytz
    # Always use full datetime string for clock-in
    ist = pytz.timezone("Asia/Kolkata")
    now = datetime.now(ist)
    # If Data.current_time is provided, try to parse it, else use now
    time = getattr(Data, 'current_time', None)
    if time:
        try:
            # Try to parse as datetime string
            clockin_dt = datetime.strptime(time, "%Y-%m-%dT%H:%M:%S.%f%z")
            time_str = clockin_dt.isoformat()
        except Exception:
            # Fallback: treat as time only, combine with today
            time_str = now.isoformat()
    else:
        time_str = now.isoformat()
    result = Mongo.Clockin(userid=Data.userid, name=Data.name, time=time_str)
    return {"message": result}

@app.post('/Clockout')
def clockout(Data: CT):
    from datetime import datetime
    import pytz
    ist = pytz.timezone("Asia/Kolkata")
    now = datetime.now(ist)
    time = getattr(Data, 'current_time', None)
    if time:
        try:
            clockout_dt = datetime.strptime(time, "%Y-%m-%dT%H:%M:%S.%f%z")
            time_str = clockout_dt.isoformat()
        except Exception:
            time_str = now.isoformat()
    else:
        time_str = now.isoformat()
    result = Mongo.Clockout(userid=Data.userid, name=Data.name, time=time_str)
    return {"message": result}



# Unified Attendance & Clock Records Endpoint (after Clockout)
@app.post("/attendance/manage")
async def manage_attendance(data: AttendanceManage):
    """
    Endpoint for attendance and clock records management.
    - If userid is provided: return all records for that user.
    - If date is provided: return all records for that date.
    - If both: return records for that user on that date.
    - If neither : both "" empty fields then displays all records"
    """
    try:
        userid = getattr(data, 'userid', None)
        date = getattr(data, 'date', None)
        # Treat empty string as not provided
        if userid == "":
            userid = None
        if date == "":
            date = None
        from dateutil import parser
        attendance_data = get_attendance_by_date()


        # If neither userid nor date is provided, return all attendance records
        if not userid and not date:
            # attendance_data already contains all records from get_attendance_by_date()
            print('DEBUG neither case attendance_data:', attendance_data)
        else:
            # Filter by userid if provided
            if userid:
                attendance_data = [rec for rec in attendance_data if rec.get('userid') == userid]

            # Filter by date if provided
            if date:
                try:
                    filter_date = parser.parse(date).date()
                except Exception:
                    filter_date = None
                if filter_date:
                    filtered = []
                    for record in attendance_data:
                        record_date = record.get('date')
                        if record_date:
                            try:
                                rec_date = parser.parse(record_date).date()
                                if rec_date == filter_date:
                                    filtered.append(record)
                            except Exception:
                                pass
                    attendance_data = filtered
        
        # Format datetime fields for better readability
        # Convert ISO format to readable time format in clockin/clockout fields
        formatted_attendance = []
        for record in attendance_data:
            formatted_record = record.copy()
            
            # Format clockin time - replace with formatted version
            if 'clockin' in formatted_record and formatted_record['clockin']:
                try:
                    clockin_dt = parser.parse(formatted_record['clockin'])
                    formatted_record['clockin'] = clockin_dt.strftime('%I:%M:%S %p')
                except:
                    pass
            
            # Format clockout time - replace with formatted version
            if 'clockout' in formatted_record and formatted_record['clockout']:
                try:
                    clockout_dt = parser.parse(formatted_record['clockout'])
                    formatted_record['clockout'] = clockout_dt.strftime('%I:%M:%S %p')
                except:
                    pass
            
            formatted_attendance.append(formatted_record)
        
        return {
            "status": "success",
            "attendance": formatted_attendance or []
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in attendance management: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Employee ID
@app.get("/get_EmployeeId/{name}")
async def get_employee_id(name: str = Path(..., title="The username of the user")):
    try:
        employee_id = get_employee_id_from_db(name)
        if employee_id:
            return {"Employee_ID": employee_id}
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(500, str(e))

#Leave-request
@app.post('/leave-request')
async def leave_request(item: Item6):
    """
    Submit a regular leave request
    - Sick Leave, Casual Leave, etc.
    - Validates dates and checks conflicts
    """
    try:
        
        print(item.selectedDate)
        print(item.requestDate)

        # Add request time in the desired timezone
        time = datetime.now(pytz.timezone("Asia/Kolkata")).strftime("%I:%M:%S %p")

        # Store the leave request in MongoDB
        result = Mongo.store_leave_request(
            item.userid,
            item.employeeName,
            time,
            item.leaveType,
            item.selectedDate,  # Formatted as DD-MM-YYYY
            item.requestDate,  # Formatted as DD-MM-YYYY
            item.reason,
        )

        # Check if result is a conflict or other business logic issue
        if isinstance(result, str):
            if "Conflict" in result or "already has" in result:
                # This is a business logic conflict, not a request error
                return {
                    "success": False,
                    "status": "conflict",
                    "message": "Request processed successfully, but a scheduling conflict was detected.",
                    "details": result,
                    "suggestion": "Please select a different date or check your existing requests."
                }
            elif result == "Leave request stored successfully":
                # Success case - notify employee and appropriate approver
                try:
                    # 1. Notify employee about successful submission
                    await notify_leave_submitted(
                        userid=item.userid,
                        leave_type=item.leaveType,
                        leave_id=None
                    )
                    print(f"✅ Employee notification sent for leave submission")
                    
                    # 2. Check if the user is a tl and send appropriate notifications
                    user_position = await Mongo.get_user_position(item.userid)
                    
                    if user_position == "TL":
                        # tl leave request - notify admin
                        admin_ids = await Mongo.get_admin_user_ids()
                        if admin_ids:
                            await Mongo.notify_admin_manager_leave_request(
                                manager_name=item.employeeName,
                                manager_id=item.userid,
                                leave_type=item.leaveType,
                                leave_date=item.selectedDate,
                                leave_id=None
                            )
                            print(f"✅ Admin notification sent for TL leave request")
                        else:
                            print(f"⚠️ No admin found, skipping admin notification")
                    else:
                        # Regular employee leave request - notify TL
                        manager_id = await Mongo.get_user_manager_id(item.userid)
                        if manager_id:
                            try:
                                notify_result = await Mongo.notify_manager_leave_request(
                                    employee_name=item.employeeName,
                                    employee_id=item.userid,
                                    leave_type=item.leaveType,
                                    leave_date=item.selectedDate,
                                    manager_id=manager_id,
                                    leave_id=None
                                )
                                # Debug logs removed
                            except Exception as notify_ex:
                                pass  # Debug logs removed
                        else:
                            pass  # Debug logs removed
                        
                except Exception as notification_error:
                    print(f"⚠️ Notification error: {notification_error}")
                
                return {
                    "success": True,
                    "status": "submitted",
                    "message": "Leave request submitted successfully",
                    "details": result
                }
            else:
                # Other validation errors (Sunday, invalid dates, etc.)
                return {
                    "success": False,
                    "status": "validation_error",
                    "message": "Request validation failed",
                    "details": result,
                    "suggestion": "Please check your request details and try again."
                }

        return {"message": "Leave request processed", "result": result}
    except Exception as e:
        print(f"❌ Error in leave request: {e}")
        # Only return 500 for actual server errors, not business logic issues
        return {
            "success": False,
            "status": "error",
            "message": "An unexpected error occurred while processing your request",
            "details": str(e),
            "suggestion": "Please try again later or contact support if the issue persists."
        }

@app.post('/Bonus-leave-request')
async def bonus_leave_request(item: Item9):
    """
    Submit a bonus leave request
    - Compensation for Sunday work
    - Requires available bonus leave balance
    """
    try:
        time = datetime.now(pytz.timezone("Asia/Kolkata")).strftime("%I:%M:%S %p")

        # Store bonus leave request
        result = store_sunday_request(
            item.userid,
            item.employeeName,
            time,
            item.leaveType,
            item.selectedDate,
            item.reason,
            item.requestDate,
        )

        # ✅ FIXED: Check for explicit success message ONLY
        if isinstance(result, str) and result == "Leave request stored successfully":
            # Only send notifications when request is truly successful
            try:
                # 1. Notify employee about successful submission
                await Mongo.notify_leave_submitted(
                    userid=item.userid,
                    leave_type=item.leaveType,
                    leave_id=None
                )
                print(f"✅ Employee notification sent for bonus leave submission")
                
                # 2. Check if the user is a TL and send appropriate notifications
                user_position = await Mongo.get_user_position(item.userid)
                
                if user_position == "TL":
                    # TL bonus leave request - notify admin
                    admin_ids = await Mongo.get_admin_user_ids()
                    if admin_ids:
                        await Mongo.notify_admin_manager_leave_request(
                            manager_name=item.employeeName,
                            manager_id=item.userid,
                            leave_type=item.leaveType,
                            leave_date=item.selectedDate,
                            leave_id=None
                        )
                        print(f"✅ Admin notification sent for TL bonus leave request")
                    else:
                        print(f"⚠️ No admin found, skipping admin notification")
                else:
                    # Regular employee bonus leave request - notify TL
                    manager_id = await Mongo.get_user_manager_id(item.userid)
                    if manager_id:
                        await Mongo.notify_manager_leave_request(
                            employee_name=item.employeeName,
                            employee_id=item.userid,
                            leave_type=item.leaveType,
                            leave_date=item.selectedDate,
                            manager_id=manager_id,
                            leave_id=None
                        )
                        print(f"✅ TL notification sent for employee bonus leave approval request")
                    else:
                        print(f"⚠️ No TL found for user {item.userid}, skipping TL notification")
                
            except Exception as notification_error:
                print(f"⚠️ Notification error: {notification_error}")
            
            # Return success response
            return {
                "success": True,
                "status": "submitted",
                "message": "Bonus leave request submitted successfully",
                "details": result
            }
        
        # Handle specific error cases WITHOUT notifications
        elif result == "No bonus leave available":
            return {
                "success": False,
                "status": "no_bonus_available",
                "message": "No bonus leave available",
                "details": result,
                "suggestion": "You don't have any bonus leave days available."
            }
        
        elif "Conflict" in str(result) or "already has" in str(result):
            return {
                "success": False,
                "status": "conflict",
                "message": "Request processed successfully, but a scheduling conflict was detected.",
                "details": result,
                "suggestion": "Please select a different date or check your existing requests."
            }
        
        else:
            # Other validation errors
            return {
                "success": False,
                "status": "validation_error",
                "message": "Request validation failed",
                "details": result,
                "suggestion": "Please check your request details and try again."
            }

    except Exception as e:
        print(f"❌ Error in bonus leave request: {e}")
        return {
            "success": False,
            "status": "error",
            "message": "An unexpected error occurred while processing your request",
            "details": str(e),
            "suggestion": "Please try again later or contact support if the issue persists."
        }


@app.post('/Other-leave-request')
async def other_leave_request(item: Item7):
    """
    Submit an other leave request (LOP - Loss of Pay)
    - Multi-day leave requests
    - Maximum 5 consecutive days
    """
    try:
        # Add request time in the desired timezone
        time = datetime.now(pytz.timezone("Asia/Kolkata")).strftime("%I:%M:%S %p")

        # Store the leave request in MongoDB
        result = store_Other_leave_request(
            item.userid,
            item.employeeName,
            time,  # Use the generated time
            item.leaveType,
            item.selectedDate,  # Formatted as DD-MM-YYYY
            item.ToDate,  # Formatted as DD-MM-YYYY
            item.requestDate,  # Formatted as DD-MM-YYYY
            item.reason,
        )

        # Check if result is a conflict or other business logic issue
        if isinstance(result, str):
            if "Conflict" in result or "already has" in result:
                # This is a business logic conflict, not a request error
                return {
                    "success": False,
                    "status": "conflict",
                    "message": "Request processed successfully, but a scheduling conflict was detected.",
                    "details": result,
                    "suggestion": "Please select different dates or check your existing requests."
                }
            elif result == "Leave request stored successfully":
                # Success case - notify employee and TL
                try:
                    # 1. Notify employee about successful submission
                    await Mongo.notify_leave_submitted(
                        userid=item.userid,
                        leave_type=item.leaveType,
                        leave_id=None  # No specific ID for other leave
                    )
                    print(f"✅ Employee notification sent for other leave submission")
                    
                    # 2. Check if the user is a TL and send appropriate notifications
                    user_position = await Mongo.get_user_position(item.userid)
                    
                    if user_position == "TL":
                        # TL other leave request - notify admin
                        admin_ids = await Mongo.get_admin_user_ids()
                        if admin_ids:
                            date_range = f"{item.selectedDate} to {item.ToDate}" if item.selectedDate != item.ToDate else item.selectedDate
                            await Mongo.notify_admin_manager_leave_request(
                                manager_name=item.employeeName,
                                manager_id=item.userid,
                                leave_type=item.leaveType,
                                leave_date=date_range,
                                leave_id=None
                            )
                            print(f"✅ Admin notification sent for TL other leave request")
                        else:
                            print(f"⚠️ No admin found, skipping admin notification")
                    else:
                        # Regular employee other leave request - notify TL
                        manager_id = await Mongo.get_user_manager_id(item.userid)
                        if manager_id:
                            date_range = f"{item.selectedDate} to {item.ToDate}" if item.selectedDate != item.ToDate else item.selectedDate
                            await Mongo.notify_manager_leave_request(
                                employee_name=item.employeeName,
                                employee_id=item.userid,
                                leave_type=item.leaveType,
                                leave_date=date_range,
                                manager_id=manager_id,
                                leave_id=None
                            )
                            print(f"✅ TL notification sent for employee other leave approval request")
                        else:
                            print(f"⚠️ No TL found for user {item.userid}, skipping TL notification")
                        
                except Exception as notification_error:
                    print(f"⚠️ Notification error: {notification_error}")
                
                return {
                    "success": True,
                    "status": "submitted",
                    "message": "Other leave request submitted successfully",
                    "details": result
                }
            else:
                # Other validation errors (Sunday, too many days, etc.)
                return {
                    "success": False,
                    "status": "validation_error",
                    "message": "Request validation failed",
                    "details": result,
                    "suggestion": "Please check your request details and try again."
                }

        return {"message": "Leave request processed", "result": result}
    except Exception as e:
        print(f"❌ Error in other leave request: {e}")
        raise HTTPException(400, str(e))


@app.post('/Permission-request')
async def permission_request(item: Item8):
    """
    Submit a permission request
    - Short duration absences (Morning/Afternoon)
    """
    try:
        result = store_Permission_request(
                item.userid,
                item.employeeName,
                item.time,
                item.leaveType,
                item.selectedDate,
                item.requestDate,
                item.timeSlot,
                item.reason,
            )

        # Check if result is a conflict or other business logic issue
        if isinstance(result, str):
            if "Conflict" in result or "already has" in result:
                # This is a business logic conflict, not a request error
                return {
                    "success": False,
                    "status": "conflict",
                    "message": "Request processed successfully, but a scheduling conflict was detected.",
                    "details": result,
                    "suggestion": "Please select different dates or check your existing requests."
                }
            elif result == "Leave request stored successfully":
                # Success case - notify employee and TL
                try:
                    # 1. Notify employee about successful submission
                    await Mongo.notify_leave_submitted(
                        userid=item.userid,
                        leave_type=item.leaveType,
                        leave_id=None  # No specific ID for permission
                    )
                    print(f"✅ Employee notification sent for permission submission")
                    
                    # 2. Check if the user is a tl and send appropriate notifications
                    user_position = await Mongo.get_user_position(item.userid)
                    
                    if user_position == "TL":
                        # tl permission request - notify admin
                        admin_ids = await Mongo.get_admin_user_ids()
                        if admin_ids:
                            permission_details = f"{item.selectedDate} ({item.timeSlot})"
                            await Mongo.notify_admin_manager_leave_request(
                                manager_name=item.employeeName,
                                manager_id=item.userid,
                                leave_type=item.leaveType,
                                leave_date=permission_details,
                                leave_id=None
                            )
                            print(f"✅ Admin notification sent for TL permission request")
                        else:
                            print(f"⚠️ No admin found, skipping admin notification")
                    else:
                        # Regular employee permission request - notify tl
                        manager_id = await Mongo.get_user_manager_id(item.userid)
                        if manager_id:
                            permission_details = f"{item.selectedDate} ({item.timeSlot})"
                            await Mongo.notify_manager_leave_request(
                                employee_name=item.employeeName,
                                employee_id=item.userid,
                                leave_type=item.leaveType,
                                leave_date=permission_details,
                                manager_id=manager_id,
                                leave_id=None
                            )
                            print(f"✅ TL notification sent for employee permission approval request")
                        else:
                            print(f"⚠️ No TL found for user {item.userid}, skipping TL notification")
                        
                except Exception as notification_error:
                    print(f"⚠️ Notification error: {notification_error}")
                
                return {
                    "success": True,
                    "status": "submitted",
                    "message": "Permission request submitted successfully",
                    "details": result
                }
            else:
                # Other validation errors (Sunday, too many days, etc.)
                return {
                    "success": False,
                    "status": "validation_error",
                    "message": "Request validation failed",
                    "details": result,
                    "suggestion": "Please check your request details and try again."
                }

        return {"message": "Permission request processed", "result": result}
    except Exception as e:
        print(f"❌ Error in permission request: {e}")
        raise HTTPException(400, str(e))

# Leave History
@app.get("/leave-History/{userid}/")
async def get_leave_history(
    userid: str = Path(..., title="The userid of the user"),
    selectedOption: str = Query("Leave", alias="selectedOption")  # Default to "Leave"
):
    """
    Combined endpoint for leave history
    - Leave: Normal leave (Sick, Casual, Bonus)
    - LOP: Other Leave
    - Permission: Permission requests
    """
    try:
        print(f"DEBUG: /leave-History endpoint called - userid: {userid}, selectedOption: {selectedOption}")
        
        # Determine which function to call based on selectedOption
        if selectedOption == "Leave":
            leave_history = Mongo.normal_leave_details(userid)
        elif selectedOption == "LOP":
            leave_history = Otherleave_History_Details(userid)
        elif selectedOption == "Permission":
            leave_history = Permission_History_Details(userid)
        else:
            return {
                "error": f"Invalid selectedOption: '{selectedOption}'. Expected 'Leave', 'LOP', or 'Permission'",
                "leave_history": []
            }
        
        print(f"DEBUG: Returning {len(leave_history) if leave_history else 0} leave history records")
        return {"leave_history": leave_history or []}
        
    except Exception as e:
        print(f"ERROR in /leave-History: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/leave_requests")
async def fetch_leave_requests(
    selectedOption: str = Query(..., alias="selectedOption"),
    role: str = Query(..., alias="role"),
    TL: str = Query(None, alias="TL")
):
    """
    Fetch leave requests based on role
    - HR: All employee requests
    - Admin: TL requests
    - TL: Team member requests (requires TL parameter)
    """
    try:
        print(f"DEBUG: /leave_requests endpoint called - selectedOption: {selectedOption}, role: {role}, TL: {TL}")
        
        # Normalize role to lowercase
        role = role.lower()
        
        # Determine which function to call based on role
        if role == "hr":
            user_leave_requests = get_user_leave_requests(selectedOption)
        elif role == "admin":
            user_leave_requests = get_manager_leave_requests(selectedOption)
        elif role == "tl":
            if not TL:
                return {
                    "error": "TL parameter is required for tl role",
                    "user_leave_requests": []
                }
            user_leave_requests = get_only_user_leave_requests(selectedOption, TL)
        else:
            return {
                "error": f"Invalid role parameter: '{role}'. Expected 'hr', 'admin', or 'tl'",
                "user_leave_requests": []
            }
        
        print(f"DEBUG: Returning {len(user_leave_requests) if user_leave_requests else 0} requests")
        return {"user_leave_requests": user_leave_requests or []}
        
    except Exception as e:
        print(f"ERROR in /leave_requests: {e}")
        return {
            "error": f"An error occurred: {str(e)}",
            "user_leave_requests": []
        }



# HR Page Leave Responses
@app.put("/updated_user_leave_requests")
async def updated_user_leave_requests_status(leave_id: str = Form(...), status: str = Form(...)):
    """
    Update leave request status (Approve/Reject/Recommend)
    - Updates status in database
    - Sends notification to employee
    - Returns updated leave request details
    """
    try:
        response = updated_user_leave_requests_status_in_mongo(leave_id, status)
        
        # Create notification for leave status update
        if response and "userid" in response:
            # Properly handle different status values
            status_lower = status.lower()
            if status_lower == "approved":
                action = "Approved"
                priority = "high"
            elif status_lower in ["rejected", "reject"]:
                action = "Rejected"
                priority = "high"
            elif status_lower in ["recommended", "recommend"]:
                action = "Recommended"
                priority = "medium"
            else:
                action = status  # Use the original status for any other case
                priority = "medium"
            
            create_leave_notification(
                userid=response["userid"],
                leave_type=response.get("leave_type", "Leave"),
                action=action,
                leave_id=leave_id,
                priority=priority
            )
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
   
@app.post("/remote-work-request")
async def remote_work_request(request: RemoteWorkRequest):
    """
    Submit a remote work (WFH) request
    - Single or multi-day remote work requests
    - Validates dates and checks conflicts
    """
    try:
        # Add request time in IST
        time = datetime.now(pytz.timezone("Asia/Kolkata")).strftime("%I:%M:%S %p")


        result = Mongo.store_remote_work_request(
            request.userid,
            request.employeeName,
            time,
            request.fromDate,
            request.toDate,
            request.requestDate,
            request.reason,
            request.ip
        )
        
        # Check if result is a dictionary (success) or string (error/conflict)
        if isinstance(result, dict) and result.get("success"):
            # Success case - notify employee and tl
            try:
                wfh_id = result.get("wfh_id")
                from_date = result.get("from_date")
                to_date = result.get("to_date")
                
                # 1. Notify employee about successful submission
                await Mongo.notify_wfh_submitted(
                    userid=request.userid,
                    request_date=from_date,
                    wfh_id=wfh_id
                )
                print(f"✅ Employee notification sent for WFH submission with ID: {wfh_id}")
                
                # 2. Check if user is a tl and handle notifications accordingly
                user = Mongo.Users.find_one({"_id": Mongo.ObjectId(request.userid)})
                if user and user.get("position") == "TL":
                    # If tl is submitting WFH, notify admin
                    try:
                        await Mongo.notify_admin_manager_wfh_request(
                            manager_name=request.employeeName,
                            manager_id=request.userid,
                            request_date_from=from_date,
                            request_date_to=to_date,
                            wfh_id=wfh_id
                        )
                        print(f"✅ Admin notification sent for TL WFH request")
                    except Exception as admin_notification_error:
                        print(f"⚠️ Admin notification error: {admin_notification_error}")
                else:
                    # Regular employee - notify their tl using improved notification system
                    manager_id = await Mongo.get_user_manager_id(request.userid)
                    if manager_id:
                        # Import the improved notification function
                        from notification_automation import notify_wfh_submitted_to_manager
                        await notify_wfh_submitted_to_manager(
                            employee_name=request.employeeName,
                            employee_id=request.userid,
                            request_date_from=from_date,
                            request_date_to=to_date,
                            manager_id=manager_id,
                            wfh_id=wfh_id
                        )
                        print(f"✅ TL notification sent for WFH approval request")
                    else:
                        print(f"⚠️ No TL found for user {request.userid}, skipping TL notification")
                    
            except Exception as notification_error:
                print(f"⚠️ Notification error: {notification_error}")
                import traceback
                traceback.print_exc()
            
            return {
                "success": True,
                "status": "submitted",
                "message": result.get("message", "Remote work request submitted successfully"),
                "details": result,
                "wfh_id": wfh_id
            }
        elif isinstance(result, str):
            if "Conflict" in result or "already has" in result:
                # This is a business logic conflict, not a request error
                return {
                    "success": False,
                    "status": "conflict",
                    "message": "Request processed successfully, but a scheduling conflict was detected.",
                    "details": result,
                    "suggestion": "Please select different dates or check your existing requests."
                }
            elif "successfully" in result:
                # Old format success - fallback
                try:
                    # 1. Notify employee about successful submission
                    await Mongo.notify_wfh_submitted(
                        userid=request.userid,
                        request_date=request.fromDate,
                        wfh_id=None
                    )
                    print(f"✅ Employee notification sent for WFH submission (fallback)")
                    
                    # 2. Check if user is a tl and handle notifications accordingly
                    user = Mongo.Users.find_one({"_id": Mongo.ObjectId(request.userid)})
                    if user and user.get("position") == "TL":
                        # If tl is submitting WFH, notify admin
                        try:
                            await Mongo.notify_admin_manager_wfh_request(
                                manager_name=request.employeeName,
                                manager_id=request.userid,
                                request_date_from=request.fromDate,
                                request_date_to=request.toDate,
                                wfh_id=None
                            )
                            print(f"✅ Admin notification sent for TL WFH request (fallback)")
                        except Exception as admin_notification_error:
                            print(f"⚠️ Admin notification error: {admin_notification_error}")
                    else:
                        # Regular employee - notify their tl
                        manager_id = await Mongo.get_user_manager_id(request.userid)
                        if manager_id:
                            await Mongo.notify_manager_wfh_request(
                                employee_name=request.employeeName,
                                employee_id=request.userid,
                                request_date_from=request.fromDate,
                                request_date_to=request.toDate,
                                manager_id=manager_id,
                                wfh_id=None
                            )
                            print(f"✅ TL notification sent for WFH approval request")
                        else:
                            print(f"⚠️ No TL found for user {request.userid}, skipping TL notification")
                        
                except Exception as notification_error:
                    print(f"⚠️ Notification error: {notification_error}")
                
                return {
                    "success": True,
                    "status": "submitted",
                    "message": "Remote work request submitted successfully",
                    "details": result
                }
            else:
                # Other validation errors (Sunday, too many days, etc.)
                return {
                    "success": False,
                    "status": "validation_error",
                    "message": "Request validation failed",
                    "details": result,
                    "suggestion": "Please check your request details and try again."
                }
        
        return {"message": "WFH request processed", "result": result}
    except Exception as e:
        print(f"❌ Error in WFH request: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Remote Work History    
@app.get("/Remote-History/{userid}") 
async def get_Remote_History(userid: str = Path(..., title="The name of the user whose Remote History you want to fetch")):
    """
    Fetch remote work history for a user
    - Returns all WFH requests (approved, pending, rejected)
    - Sorted by request date
    """
    try:
        Remote_History = Remote_History_Details(userid)
        return {"Remote_History": Remote_History}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

# Remote Work Request

@app.get("/remote_work_requests")
async def fetch_remote_work_requests(
    role: str = Query(..., alias="role"),  # "hr", "admin", "tl"
    TL: str = Query(None, alias="TL"),
    show_processed: bool = Query(False, alias="show_processed")
):
    """
    Fetch remote work requests with role-based filtering.
    - role: "hr" (all requests), "admin" (admin view), "tl" (team requests, requires TL)
    - TL : if role is TL then this field should be TL's name otherwise empty
    - show_processed: False (pending only) / True (includes history, for managers)
    """
    try:
        print(f"DEBUG: /remote_work_requests endpoint called - role: {role}, TL: {TL}, show_processed: {show_processed}")
        
        # Normalize role to lowercase
        role = role.lower()
        
        # Determine which function to call based on role
        if role == "hr":
            remote_work_requests = get_remote_work_requests()
        elif role == "admin":
            remote_work_requests = get_admin_page_remote_work_requests()
        elif role == "tl":
            if not TL:
                return {
                    "error": "TL parameter is required for tl role",
                    "remote_work_requests": []
                }
            from Mongo import get_TL_page_remote_work_requests_with_history
            remote_work_requests = get_TL_page_remote_work_requests_with_history(TL, show_processed)
        else:
            return {
                "error": f"Invalid role parameter: '{role}'. Expected 'hr', 'admin', or 'tl'",
                "remote_work_requests": []
            }
        
        print(f"DEBUG: Returning {len(remote_work_requests) if remote_work_requests else 0} remote work requests")
        return {"remote_work_requests": remote_work_requests or []}
        
    except Exception as e:
        print(f"ERROR in /remote_work_requests: {e}")
        return {
            "error": f"An error occurred: {str(e)}",
            "remote_work_requests": []
        }

# HR Remote Work Responses
@app.put("/update_remote_work_requests")
async def update_remote_work_request_status(userid: str = Form(...), status: str = Form(...), id: str = Form(...)):
    """
    Update remote work request status (Approve/Reject)
    - Final approval/rejection by HR or Admin
    - Sends notification to employee
    - Returns status update confirmation
    """
    try:
        updated = update_remote_work_request_status_in_mongo(userid, status, id)
        if updated:
            # Send notification to the user about the status update
            try:
                wfh_request = Mongo.RemoteWork.find_one({"_id": Mongo.ObjectId(id)})
                if wfh_request:
                    from_date = wfh_request.get("fromDate")
                    from_date_str = from_date.strftime("%d-%m-%Y") if from_date else None
                    
                    if status.lower() == "approved":
                        # Import the improved approval notification function
                        from notification_automation import notify_wfh_approved_to_employee
                        # Get employee name for better notification
                        employee_name = wfh_request.get("employeeName", "Employee")
                        to_date = wfh_request.get("toDate")
                        to_date_str = to_date.strftime("%d-%m-%Y") if to_date else from_date_str
                        
                        await notify_wfh_approved_to_employee(
                            userid=userid,
                            employee_name=employee_name,
                            request_date_from=from_date_str,
                            request_date_to=to_date_str,
                            approved_by="HR",
                            wfh_id=id
                        )
                        print(f"✅ WFH approved notification sent to user {userid}")
                    elif status.lower() == "rejected":
                        # Import the improved rejection notification function  
                        from notification_automation import notify_wfh_rejected_to_employee
                        # Get employee name for better notification
                        employee_name = wfh_request.get("employeeName", "Employee")
                        to_date = wfh_request.get("toDate")
                        to_date_str = to_date.strftime("%d-%m-%Y") if to_date else from_date_str
                        
                        await notify_wfh_rejected_to_employee(
                            userid=userid,
                            employee_name=employee_name,
                            request_date_from=from_date_str,
                            request_date_to=to_date_str,
                            rejected_by="HR",
                            reason="Not specified",
                            wfh_id=id
                        )
                        print(f"✅ WFH rejected notification sent to user {userid}")
            except Exception as notification_error:
                print(f"⚠️ Notification error: {notification_error}")
            
            return {"message": "Status updated successfully"}
        else:
            return {"message": "Failed to update status"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# HR Remote Work Responses
@app.put("/recommend_remote_work_requests")
async def update_remote_work_request_status(userid: str = Form(...), status: str = Form(...), id: str = Form(...)):
    """
    Recommend remote work request (TL action)
    - TL recommends WFH for HR approval
    - Sends notification to HR
    - Returns recommendation status
    """
    try:
        print(f"WFH recommendation update - User: {userid}, Status: {status}, ID: {id}")
        updated = update_remote_work_request_recommend_in_mongo(userid, status, id)
        if updated and status.lower() == "recommend":
            # Send notification to HR when WFH is recommended
            try:
                wfh_request = Mongo.RemoteWork.find_one({"_id": Mongo.ObjectId(id)})
                if wfh_request:
                    employee_name = wfh_request.get("employeeName", "Unknown Employee")
                    employee_id = wfh_request.get("userid")  # This is the actual employee ID
                    from_date = wfh_request.get("fromDate")
                    to_date = wfh_request.get("toDate")
                    from_date_str = from_date.strftime("%d-%m-%Y") if from_date else "Unknown Date"
                    to_date_str = to_date.strftime("%d-%m-%Y") if to_date else "Unknown Date"
                    
                    # Get the employee's manager name (who is doing the recommendation)
                    employee = Mongo.Users.find_one({"_id": Mongo.ObjectId(employee_id)})
                    manager_name = employee.get("TL", "Manager") if employee else "Manager"
                    
                    # Import the improved HR notification function
                    from notification_automation import notify_wfh_recommended_to_hr
                    await notify_wfh_recommended_to_hr(
                        employee_name=employee_name,
                        employee_id=employee_id,
                        request_date_from=from_date_str,
                        request_date_to=to_date_str,
                        recommended_by=manager_name,
                        wfh_id=id
                    )
                    print(f"✅ HR notification sent for recommended WFH: {employee_name} (recommended by {manager_name})")
                    
                else:
                    print(f"⚠️ WFH request not found for ID: {id}")
            except Exception as notification_error:
                print(f"⚠️ HR notification error: {notification_error}")
        
        print(id)
        updated = update_remote_work_request_recommend_in_mongo(userid, status, id)
        if updated:
            return {"message": "Recommend status updated successfully"}
        else:
            return {"message": "Failed to update recommend status"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/admin_signup")
def adminid_Signup(item: Item):
    jwt=Mongo.admin_Signup(item.email,item.password,item.name,item.phone,item.position,item.date_of_joining)
    return jwt

@app.post("/admin_signin")
def admin_Signup(item: Item2):
    checkuser = admin.find_one({'email': item.email})
    jwt = Mongo.admin_signin(checkuser, item.password, item.email)
    email = jwt.get('email')
    admin_info = get_admin_info(email)
    print(jwt)
    return {
        "jwt": jwt,
        "Name": admin_info.get('name'),
        "Email": admin_info.get('email'),
        "Phone no": admin_info.get('phone'),
        "Position": admin_info.get('position'),
        "Date of joining": admin_info.get('date_of_joining')
    }


from datetime import datetime
import pytz
from fastapi import HTTPException

def parse_and_format_date(date_str):
    """Parses various date formats and converts them to DD-MM-YYYY format."""
    if not date_str:
        return None


    date_str = date_str.rstrip('Z')  # Remove 'Z' if present
    formats = ["%Y-%m-%dT%H:%M:%S.%f", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"]  # Possible formats


    for fmt in formats:
        try:
            parsed_date = datetime.strptime(date_str, fmt)
            return parsed_date.strftime("%d-%m-%Y")  # Convert to DD-MM-YYYY
        except ValueError:
            continue  # Try next format if parsing fails


    raise ValueError(f"Invalid date format: {date_str}")


# ============== REMOTE WORK ENDPOINTS ==============
 
@app.get("/ip-info")
def fetch_ip_info():
    return {
        "public_ip": get_public_ip(),
        "local_ip": get_local_ip()
}

# =========all
@app.get("/tl/leave_details/{user_id}")
async def get_TL_team_leave_details(
    user_id: str,
    statusFilter: Optional[str] = Query(None),
    leaveTypeFilter: Optional[str] = Query(None),
    departmentFilter: Optional[str] = Query(None)
):
    """
    Get leave details for team members under a specific TL with filtering options.
    - statusFilter: Filter by leave status ("Pending", "Approved", "Rejected", "All")
    - leaveTypeFilter: Filter by leave type ("Sick Leave", "Casual Leave", "Earned Leave", "All")
    - departmentFilter: Filter by department name or "All" for no filter
    """
    try:
        # First, verify the manager exists and get their info
        manager = Users.find_one({"_id": ObjectId(user_id)})
        if not manager:
            raise HTTPException(status_code=404, detail="TL not found")
        
        manager_name = manager.get("name")
        if not manager_name:
            raise HTTPException(status_code=400, detail="TL name not found")
        
        # Build the aggregation pipeline
        pipeline = []
        
        # Convert userid to ObjectId if it's a string
        pipeline.append({
            "$addFields": {
                "userid_as_objectid": {
                    "$cond": {
                        "if": {"$eq": [{"$type": "$userid"}, "objectId"]},
                        "then": "$userid",
                        "else": {"$toObjectId": "$userid"}
                    }
                }
            }
        })
        
        # Join with Users collection
        pipeline.append({
            "$lookup": {
                "from": "Users",
                "localField": "userid_as_objectid",
                "foreignField": "_id",
                "as": "user_info"
            }
        })
        
        # Unwind the user_info array
        pipeline.append({"$unwind": "$user_info"})
        
        # Filter to only show team members under this tl
        base_match = {
            "user_info.TL": manager_name,  # Team members have this manager as TL
            "user_info.position": {"$ne": "TL"}  # Exclude other managers
        }
        
        # Add additional filters
        if departmentFilter and departmentFilter != "All":
            base_match["user_info.department"] = departmentFilter
        
        if statusFilter and statusFilter != "All":
            if statusFilter == "Pending":
                base_match["status"] = {"$exists": False}
            else:
                base_match["status"] = statusFilter
        
        if leaveTypeFilter and leaveTypeFilter != "All":
            base_match["leaveType"] = leaveTypeFilter
        
        # Apply the match conditions
        pipeline.append({"$match": base_match})
        
        # Add employee info fields to output
        pipeline.append({
            "$addFields": {
                "employeeName": "$user_info.name",
                "position": "$user_info.position",
                "department": "$user_info.department",
                "email": "$user_info.email",
                "teamLeader": "$user_info.TL"
            }
        })
        
        # Remove temporary fields
        pipeline.append({
            "$project": {
                "user_info": 0,
                "userid_as_objectid": 0
            }
        })
        
        # Sort by request date (most recent first)
        pipeline.append({
            "$sort": {"requestDate": -1}
        })
        
        # Execute aggregation
        leave_details = list(Leave.aggregate(pipeline))
        
        # Format dates and ObjectIds
        for leave in leave_details:
            leave["_id"] = str(leave["_id"])
            if "selectedDate" in leave and leave["selectedDate"]:
                leave["selectedDate"] = leave["selectedDate"].strftime("%d-%m-%Y")
            if "requestDate" in leave and leave["requestDate"]:
                leave["requestDate"] = leave["requestDate"].strftime("%d-%m-%Y")
            if "ToDate" in leave and leave["ToDate"]:
                leave["ToDate"] = leave["ToDate"].strftime("%d-%m-%Y")
        
        return {
            "manager_info": {
                "user_id": user_id,
                "manager_name": manager_name
            },
            "leave_details": leave_details,
            "total_count": len(leave_details),
            "filters_applied": {
                "status": statusFilter or "All",
                "leave_type": leaveTypeFilter or "All",
                "department": departmentFilter or "All"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/tl/remote_work_details/{user_id}")
async def get_TL_team_remote_work_details(
    user_id: str,
    statusFilter: Optional[str] = Query(None),
    departmentFilter: Optional[str] = Query(None)
):
    """
    Get remote work details for team members under a specific TL with filtering options.
    - statusFilter: Filter by status ("Pending", "Recommended", "Approved", "Rejected", "All")
    - departmentFilter: Filter by department name or "All" for no filter
    """
    try:
        # First, verify the tl exists and get their info
        manager = Users.find_one({"_id": ObjectId(user_id)})
        if not manager:
            raise HTTPException(status_code=404, detail="TL not found")
        
        manager_name = manager.get("name")
        if not manager_name:
            raise HTTPException(status_code=400, detail="TL name not found")
        
        # Build the aggregation pipeline
        pipeline = []
        
        # Convert userid to ObjectId if it's a string
        pipeline.append({
            "$addFields": {
                "userid_as_objectid": {
                    "$cond": {
                        "if": {"$eq": [{"$type": "$userid"}, "objectId"]},
                        "then": "$userid",
                        "else": {"$toObjectId": "$userid"}
                    }
                }
            }
        })
        
        # Join with Users collection
        pipeline.append({
            "$lookup": {
                "from": "Users",
                "localField": "userid_as_objectid",
                "foreignField": "_id",
                "as": "user_info"
            }
        })
        
        # Unwind the user_info array
        pipeline.append({"$unwind": "$user_info"})
        
        # Filter to only show team members under this tl
        base_match = {
            "user_info.TL": manager_name,  # Team members have this manager as TL
            "user_info.position": {"$ne": "TL"}  # Exclude other managers
        }
        
        # Add additional filters
        if departmentFilter and departmentFilter != "All":
            base_match["user_info.department"] = departmentFilter
        
        if statusFilter and statusFilter != "All":
            if statusFilter == "Pending":
                base_match["status"] = {"$exists": False}
                base_match["Recommendation"] = {"$exists": False}
            elif statusFilter == "Recommended":
                base_match["Recommendation"] = "Recommend"
            else:
                base_match["status"] = statusFilter
        
        # Apply the match conditions
        pipeline.append({"$match": base_match})
        
        # Add employee info fields to output
        pipeline.append({
            "$addFields": {
                "employeeName": "$user_info.name",
                "position": "$user_info.position",
                "department": "$user_info.department",
                "email": "$user_info.email",
                "teamLeader": "$user_info.TL"
            }
        })
        
        # Remove temporary fields
        pipeline.append({
            "$project": {
                "user_info": 0,
                "userid_as_objectid": 0
            }
        })
        
        # Sort by request date (most recent first)
        pipeline.append({
            "$sort": {"requestDate": -1}
        })
        
        # Execute aggregation
        remote_work_details = list(RemoteWork.aggregate(pipeline))
        
        # Format dates and ObjectId
        for remote_work in remote_work_details:
            remote_work["_id"] = str(remote_work["_id"])
            if "fromDate" in remote_work and remote_work["fromDate"]:
                remote_work["fromDate"] = remote_work["fromDate"].strftime("%d-%m-%Y")
            if "toDate" in remote_work and remote_work["toDate"]:
                remote_work["toDate"] = remote_work["toDate"].strftime("%d-%m-%Y")
            if "requestDate" in remote_work and remote_work["requestDate"]:
                remote_work["requestDate"] = remote_work["requestDate"].strftime("%d-%m-%Y")
        
        return {
            "manager_info": {
                "user_id": user_id,
                "manager_name": manager_name
            },
            "remote_work_details": remote_work_details,
            "total_count": len(remote_work_details),
            "filters_applied": {
                "status": statusFilter or "All",
                "department": departmentFilter or "All"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/tl/team_members/{user_id}")
async def get_TL_team_members(user_id: str):
    """Get list of team members under a specific tl"""
    try:
        # Get manager info
        manager = Users.find_one({"_id": ObjectId(user_id)})
        if not manager:
            raise HTTPException(status_code=404, detail="TL not found")
        
        manager_name = manager.get("name")
        
        # Get team members under this manager
        team_members = list(Users.find(
            {
                "TL": manager_name,
                "position": {"$ne": "TL"}
            },
            {
                "_id": 1,
                "name": 1,
                "email": 1,
                "position": 1,
                "department": 1,
                "phone": 1,
                "status": 1
            }
        ))
        
        # Format the response
        formatted_members = []
        for member in team_members:
            formatted_members.append({
                "userid": str(member["_id"]),
                "name": member.get("name"),
                "email": member.get("email"),
                "position": member.get("position"),
                "department": member.get("department"),
                "phone": member.get("phone"),
                "status": member.get("status", "Active")
            })
        
        return {
            "manager_info": {
                "user_id": user_id,
                "manager_name": manager_name
            },
            "team_members": formatted_members,
            "total_count": len(formatted_members)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/leave_details/user/")
async def get_all_users_leave_details(
    statusFilter: Optional[str] = Query(None),
    leaveTypeFilter: Optional[str] = Query(None),
    positionFilter: Optional[str] = Query(None),
    departmentFilter: Optional[str] = Query(None)
):
    """
    Get leave details for all users across the organization with filtering options.
    - statusFilter: Filter by leave status ("Pending", "Approved", "Rejected", "All")
    - leaveTypeFilter: Filter by leave type ("Sick Leave", "Casual Leave", "Earned Leave", "All")
    - positionFilter: Filter by employee position or "All" for no filter
    - departmentFilter: Filter by department name or "All" for no filter
    """
    try:
        # Build the aggregation pipeline with flexible userid matching
        pipeline = []
        
        # Convert userid to ObjectId if it's a string
        pipeline.append({
            "$addFields": {
                "userid_as_objectid": {
                    "$cond": {
                        "if": {"$eq": [{"$type": "$userid"}, "objectId"]},
                        "then": "$userid",
                        "else": {"$toObjectId": "$userid"}
                    }
                }
            }
        })
        
        # Join with Users collection
        pipeline.append({
            "$lookup": {
                "from": "Users",
                "localField": "userid_as_objectid",
                "foreignField": "_id",
                "as": "user_info"
            }
        })
        
        # Handle cases where user info might not be found
        pipeline.append({
            "$addFields": {
                "user_info": {
                    "$cond": {
                        "if": {"$eq": [{"$size": "$user_info"}, 0]},
                        "then": [{"name": "Unknown User", "position": "Unknown", "department": "Unknown", "email": "Unknown", "TL": "Unknown"}],
                        "else": "$user_info"
                    }
                }
            }
        })
        
        # Unwind the user_info array
        pipeline.append({"$unwind": "$user_info"})
        
        # Build match conditions for filtering
        match_conditions = {}
        
        if positionFilter and positionFilter != "All":
            match_conditions["user_info.position"] = positionFilter
            
        if departmentFilter and departmentFilter != "All":
            match_conditions["user_info.department"] = departmentFilter
        
        if statusFilter and statusFilter != "All":
            if statusFilter == "Pending":
                match_conditions["status"] = {"$exists": False}
            else:
                match_conditions["status"] = statusFilter
        
        if leaveTypeFilter and leaveTypeFilter != "All":
            match_conditions["leaveType"] = leaveTypeFilter
        
        # Add match stage if there are conditions
        if match_conditions:
            pipeline.append({"$match": match_conditions})
        
        # Add employee info fields to output
        pipeline.append({
            "$addFields": {
                "employeeName": "$user_info.name",
                "position": "$user_info.position",
                "department": "$user_info.department",
                "email": "$user_info.email",
                "teamLeader": "$user_info.TL"
            }
        })
        
        # Remove temporary fields
        pipeline.append({
            "$project": {
                "user_info": 0,
                "userid_as_objectid": 0
            }
        })
        
        # Sort by request date (most recent first)
        pipeline.append({
            "$sort": {"requestDate": -1}
        })
        
        # Execute aggregation
        leave_details = list(Leave.aggregate(pipeline))
        
        # Format dates and ObjectIds
        for leave in leave_details:
            leave["_id"] = str(leave["_id"])
            if "selectedDate" in leave and leave["selectedDate"]:
                leave["selectedDate"] = leave["selectedDate"].strftime("%d-%m-%Y")
            if "requestDate" in leave and leave["requestDate"]:
                leave["requestDate"] = leave["requestDate"].strftime("%d-%m-%Y")
            if "ToDate" in leave and leave["ToDate"]:
                leave["ToDate"] = leave["ToDate"].strftime("%d-%m-%Y")
        
        return {
            "leave_details": leave_details,
            "total_count": len(leave_details),
            "filters_applied": {
                "position": positionFilter or "All",
                "status": statusFilter or "All",
                "leave_type": leaveTypeFilter or "All",
                "department": departmentFilter or "All"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/remote_work_details/user/")
async def get_all_users_remote_work_details(
    statusFilter: Optional[str] = Query(None),
    positionFilter: Optional[str] = Query(None),
    departmentFilter: Optional[str] = Query(None)
):
    """
    Get remote work details for all users across the organization with filtering options.
    - statusFilter: Filter by status ("Pending", "Recommended", "Approved", "Rejected", "All")
    - positionFilter: Filter by employee position or "All" for no filter
    - departmentFilter: Filter by department name or "All" for no filter
    """
    try:
        # Build the aggregation pipeline with flexible userid matching
        pipeline = []
        
        # Convert userid to ObjectId if it's a string
        pipeline.append({
            "$addFields": {
                "userid_as_objectid": {
                    "$cond": {
                        "if": {"$eq": [{"$type": "$userid"}, "objectId"]},
                        "then": "$userid",
                        "else": {"$toObjectId": "$userid"}
                    }
                }
            }
        })
        
        # Join with Users collection
        pipeline.append({
            "$lookup": {
                "from": "Users",
                "localField": "userid_as_objectid",
                "foreignField": "_id",
                "as": "user_info"
            }
        })
        
        # Handle cases where user info might not be found
        pipeline.append({
            "$addFields": {
                "user_info": {
                    "$cond": {
                        "if": {"$eq": [{"$size": "$user_info"}, 0]},
                        "then": [{"name": "Unknown User", "position": "Unknown", "department": "Unknown", "email": "Unknown", "TL": "Unknown"}],
                        "else": "$user_info"
                    }
                }
            }
        })
        
        # Unwind the user_info array
        pipeline.append({"$unwind": "$user_info"})
        
        # Build match conditions for filtering
        match_conditions = {}
        
        if positionFilter and positionFilter != "All":
            match_conditions["user_info.position"] = positionFilter
            
        if departmentFilter and departmentFilter != "All":
            match_conditions["user_info.department"] = departmentFilter
        
        if statusFilter and statusFilter != "All":
            if statusFilter == "Pending":
                match_conditions["status"] = {"$exists": False}
                match_conditions["Recommendation"] = {"$exists": False}
            elif statusFilter == "Recommended":
                match_conditions["Recommendation"] = "Recommend"
            else:
                match_conditions["status"] = statusFilter
        
        # Add match stage if there are conditions
        if match_conditions:
            pipeline.append({"$match": match_conditions})
        
        # Add employee info fields to output
        pipeline.append({
            "$addFields": {
                "employeeName": "$user_info.name",
                "position": "$user_info.position",
                "department": "$user_info.department",
                "email": "$user_info.email",
                "teamLeader": "$user_info.TL"
            }
        })
        
        # Remove temporary fields
        pipeline.append({
            "$project": {
                "user_info": 0,
                "userid_as_objectid": 0
            }
        })
        
        # Sort by request date (most recent first)
        pipeline.append({
            "$sort": {"requestDate": -1}
        })
        
        # Execute aggregation
        remote_work_details = list(RemoteWork.aggregate(pipeline))
        
        # Format dates and ObjectId
        for remote_work in remote_work_details:
            remote_work["_id"] = str(remote_work["_id"])
            if "fromDate" in remote_work and remote_work["fromDate"]:
                remote_work["fromDate"] = remote_work["fromDate"].strftime("%d-%m-%Y")
            if "toDate" in remote_work and remote_work["toDate"]:
                remote_work["toDate"] = remote_work["toDate"].strftime("%d-%m-%Y")
            if "requestDate" in remote_work and remote_work["requestDate"]:
                remote_work["requestDate"] = remote_work["requestDate"].strftime("%d-%m-%Y")
        
        return {
            "remote_work_details": remote_work_details,
            "total_count": len(remote_work_details),
            "filters_applied": {
                "position": positionFilter or "All",
                "status": statusFilter or "All",
                "department": departmentFilter or "All"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get_all_users")
async def get_all_users_route():
        # Fetch all users using the function from Mongo.py
        users = get_all_users()
        if users:
            return users  # Return the list of users
        else:
            raise HTTPException(status_code=404, detail="No users found")

@app.post("/assign_tasks")
async def assign_tasks(item: Taskassign):
    assigner_name = None
    for t in item.Task_details:
        if not t.assigned_by:
            t.assigned_by = t.TL or "Manager"

        if not assigner_name and t.assigned_by:
            assigner_name = t.assigned_by
        elif not assigner_name and t.TL:
            assigner_user = Users.find_one({"_id": ObjectId(t.TL)}) if ObjectId.is_valid(t.TL) else None
            if not assigner_user:
                assigner_user = Users.find_one({"name": t.TL})
            assigner_name = assigner_user.get("name", t.TL) if assigner_user else t.TL

    for t in item.Task_details:
        try:
            datetime.strptime(t.date, "%Y-%m-%d")
            datetime.strptime(t.due_date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid date format for task assigned to {t.userid}. Use yyyy-mm-dd.")

    result = await task_assign_to_multiple_users_with_notification(
        task_details=item.Task_details,
        assigner_name=assigner_name
    )

    return {
        "message": "Tasks assigned successfully",
        "task_ids": result,
        "count": len(result)
    }

@app.post("/task_actions")
def handle_task(request: TaskEditRequest):
    try:
        if request.action not in ["edit", "delete"]:
            raise HTTPException(status_code=400, detail="Invalid action. Use 'edit' or 'delete'.")

        # Delete action
        if request.action == "delete":
            result = delete_a_task(request.taskid)
            if result == "Task not found":
                raise HTTPException(status_code=404, detail="Task not found")
            return {"message": result}

        # Edit action
        current_date = datetime.now().strftime("%Y-%m-%d")
        result = Mongo.edit_the_task(
            taskid=str(request.taskid),
            userid=request.userid,
            cdate=current_date,
            due_date=request.due_date,
            updated_task=request.updated_task,
            status=request.status,
            priority=request.priority,
            subtasks=request.subtasks,
            comments=request.comments,
            files=request.files,
            verified=request.verified
        )

        if result == "Task not found":
            raise HTTPException(status_code=404, detail="Task not found")
        elif result == "No fields to update":
            raise HTTPException(status_code=400, detail="No fields to update")
        elif result == "Cannot demote verified task":
            raise HTTPException(status_code=403, detail="Cannot change status of a verified task")

        return {"message": result}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tasks")
async def get_tasks(
    role: Optional[str] = Query(None, description="Role: HR, TL, or Employee"),  # made optional
    TL_name: Optional[str] = None,
    userid: Optional[str] = None,
    taskid: Optional[str] = None,
    date: Optional[str] = None,
):
    """
    Unified Task Fetch Endpoint:
    Handles all task retrieval scenarios for HR, TL, and Employee.
    """

    try:
        # 1️⃣ Fetch a single task by ID
        if taskid:
            result = get_single_task(taskid)
            if not result:
                raise HTTPException(status_code=404, detail="Task not found")
            return {"type": "single_task", "data": result}

        # 2️⃣ Role must be provided for other views
        if not role:
            raise HTTPException(status_code=400, detail="role query param is required when taskid is not provided")

        # 3️⃣ HR → Get tasks assigned to a specific tl or all tl
        if role.lower() == "hr":
            all_tasks = []

            if userid:  # specific tl
                tasks = get_manager_hr_assigned_tasks(userid)
                if tasks:
                    all_tasks.extend(tasks)
            else:  # all managers
                managers = get_managers()  # all users with role="TL"
                for manager in managers:
                    if manager.get("userid"):
                        tasks = get_manager_hr_assigned_tasks(manager["userid"])
                        if tasks:
                            all_tasks.extend(tasks)

            # Optional date filter
            if date:
                all_tasks = [t for t in all_tasks if t.get("date") == date]

            return {"type": "hr_tasks", "data": all_tasks}

        # 4️⃣ Manager (also TL)
        elif role.lower() in ["manager", "tl"]:
            if not TL_name:
                raise HTTPException(status_code=400, detail="TL view requires TL_name")

            tasks = Mongo.assigned_task(TL_name, userid)

            if userid:
                user_info = Mongo.get_user_info(userid)
                if user_info and user_info.get("tl_name") != TL_name:
                    raise HTTPException(status_code=403, detail="Employee not under this TL")

            if date:
                tasks = [t for t in tasks if t.get("date") == date]

            for t in tasks:
                user = Mongo.get_user_info(t["userid"])
                if user:
                    t["employee_name"] = user.get("name", "Unknown")
                if "created_date" not in t or not t["created_date"]:
                    raw_date = t.get("date")
                    if raw_date:
                        try:
                            parsed = datetime.strptime(raw_date, "%d-%m-%Y")
                            t["created_date"] = parsed.strftime("%Y-%m-%d")
                        except Exception:
                            t["created_date"] = str(raw_date)

            return {"type": "manager_tasks", "data": tasks}

        # 5️⃣ Employee
        elif role.lower() == "employee":
            if not userid:
                raise HTTPException(status_code=400, detail="Employee view requires userid")
            tasks = Mongo.get_manager_only_tasks(userid, date)
            for t in tasks:
                t.setdefault("subtasks", [])
                t.setdefault("comments", [])
                t.setdefault("files", [])
            return {"type": "employee_tasks", "data": tasks}

        else:
            raise HTTPException(status_code=400, detail="Invalid role provided")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# @app.get("/list_users")
# def get_users(role: Optional[str] = Query(None, description="Role: 'TL' or 'TeamMembers'"),
#               TL: Optional[str] = Query(None, description="Team Lead name, required if role is TeamMembers")):
#     try:
#         if role == "TL":
#             result = get_user_by_position("TL")
#             if result:
#                 return result
#             else:
#                 raise HTTPException(status_code=404, detail="TL not found")
#         elif role == "TeamMembers":
#             if not TL:
#                 raise HTTPException(status_code=400, detail="TL parameter is required for TeamMembers")
#             result = get_team_members(TL)
#             return result
#         else:
#             raise HTTPException(status_code=400, detail="Invalid role. Use 'TL' or 'TeamMembers'")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


@app.get("/list_users")
def get_users(role: Optional[str] = Query(None),
              TL: Optional[str] = Query(None)):
    try:
        if role == "TL":
            result = get_user_by_position("TL")
            return serialize_mongo_doc(result)  # 🔥 CRITICAL
        elif role == "TeamMembers":
            if not TL:
                raise HTTPException(status_code=400, detail="TL required")
            result = get_team_members(TL)
            return serialize_mongo_doc(result)  # 🔥 CRITICAL - WAS MISSING
        else:
            raise HTTPException(status_code=400, detail="Invalid role")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/task/{taskid}/files")
async def upload_task_file(
    taskid: str,
    file: UploadFile = File(...),
    uploaded_by: str = Form(...)
):
   
    try:
        file_bytes = await file.read()
        
        # Test MongoDB connection before attempting to save
        try:
            client.admin.command('ping')
        except Exception as conn_error:
            print(f"MongoDB connection error: {conn_error}")
            raise HTTPException(status_code=503, detail=f"Database connection failed: {str(conn_error)}")
        
        gridfs_id = fs.put(file_bytes, filename=file.filename, content_type=file.content_type, uploadedBy=uploaded_by)
        file_meta = {
            "id": str(gridfs_id),
            "name": file.filename,
            "size": len(file_bytes),
            "type": file.content_type,
            "uploadedAt": datetime.utcnow().isoformat() + "Z",
            "uploadedBy": uploaded_by,
            "gridfs_id": str(gridfs_id)
        }

        ok = Mongo.add_file_to_task(taskid, file_meta)
        if not ok:
            fs.delete(gridfs_id)
            raise HTTPException(status_code=404, detail="Task not found")

        # Send file upload notifications
        try:
            task = Mongo.Tasks.find_one({"_id": Mongo.ObjectId(taskid)})
            if task:
                task_title = task.get("task", "Task")
                task_userid = task.get("userid")
                
                # Get uploader name
                uploader = Mongo.Users.find_one({"_id": Mongo.ObjectId(uploaded_by)}) if ObjectId.is_valid(uploaded_by) else None
                uploader_name = uploader.get("name", "Team Member") if uploader else "Team Member"
                
                # Notify task owner if file uploaded by someone else
                if task_userid and uploaded_by != task_userid:
                    Mongo.create_notification(
                        userid=task_userid,
                        title="File Uploaded",
                        message=f"{uploader_name} uploaded a file '{file.filename}' to your task '{task_title}'.",
                        notification_type="task",
                        priority="medium",
                        action_url=Mongo.get_role_based_action_url(task_userid, "task"),
                        related_id=taskid,
                        metadata={
                            "task_title": task_title,
                            "action": "File Uploaded",
                            "filename": file.filename,
                            "uploaded_by": uploaded_by
                        }
                    )
                
                # Notify tl if they exist and didn't upload the file
                assigned_by = task.get("assigned_by")
                if assigned_by and assigned_by != "self" and assigned_by != uploaded_by and assigned_by != task_userid:
                    Mongo.create_notification(
                        userid=assigned_by,
                        title="File Uploaded to Assigned Task",
                        message=f"{uploader_name} uploaded a file '{file.filename}' to the task '{task_title}'.",
                        notification_type="task",
                        priority="medium",
                        action_url=Mongo.get_role_based_action_url(assigned_by, "manager_task"),
                        related_id=taskid,
                        metadata={
                            "task_title": task_title,
                            "action": "File Uploaded",
                            "filename": file.filename,
                            "uploaded_by": uploaded_by
                        }
                    )
        except Exception as e:
            print(f"Error sending file upload notification: {e}")
            traceback.print_exc()

        return {"message": "File uploaded successfully", "file": file_meta}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"File upload error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

@app.get("/task/{taskid}/files/{fileid}")
async def get_task_file(taskid: str, fileid: str):
    file_meta = Mongo.get_task_file_metadata(taskid, fileid)
    if not file_meta:
        raise HTTPException(status_code=404, detail="File not found")

    
    gridfs_id = file_meta.get("gridfs_id")
    if not gridfs_id:
        raise HTTPException(status_code=404, detail="File not stored in GridFS")
    try:
        file_obj = fs.get(ObjectId(gridfs_id))
        return StreamingResponse(file_obj, media_type=file_meta.get("type", "application/octet-stream"),
                                headers={"Content-Disposition": f"attachment; filename={file_meta.get('name', 'file')}"})
    except Exception:
        raise HTTPException(status_code=404, detail="File not found in GridFS")

@app.get("/get_user/{userid}")
def get_user(userid: str):
    print("Searching user ID:", userid)

    try:
        obj_id = ObjectId(userid)
    except Exception as e:
        print(f"Invalid ObjectId format: {str(e)}")
        return JSONResponse(
            content={"error": f"Invalid ID format: {str(e)}", "userid": userid},
            status_code=400
        )

    try:
        # First, try to find in Users collection
        # user = Users.find_one({"_id": obj_id}, {"password": 0})
        user = Users.find_one({"_id": obj_id}, {"password": 0, "assigned_docs": 0})
        
        if user:
            user = serialize_mongo_doc(user)
            print(f"User found in Users collection: {user.get('email')}")
            return JSONResponse(content=user, status_code=200)
        
        # If not found in Users, check admin collection
        admin_user = admin.find_one({"_id": obj_id}, {"password": 0})
        
        if admin_user:
            admin_user = serialize_mongo_doc(admin_user)
            print(f"User found in admin collection: {admin_user.get('email')}")
            return JSONResponse(content=admin_user, status_code=200)
        
        # User not found in either collection
        print("User not found in any collection!")
        return JSONResponse(
            content={"error": "User not found", "userid": userid},
            status_code=404
        )
    
    except Exception as e:
        print(f"Database error in get_user: {str(e)}")
        import traceback
        traceback.print_exc()
        return JSONResponse(
            content={"error": "Internal server error", "details": str(e)},
            status_code=500
        )

@app.put("/edit_employee")
def edit_employee(item: EditEmployee):
    try:
        # Convert Pydantic model to dict
        employee_dict = item.dict()
       
        # Call the edit function
        result = edit_an_employee(employee_dict)
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in edit_employee endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/get_TL_list")
async def fetch_TLs():
 result = get_managers()
 return result


@app.get("/get_admin/{userid}")
def get_admin(userid: str):
    result = Mongo.get_admin_information(userid)
    return result


@app.post("/add_employee")
def add_employee(item:AddEmployee):
    result = add_an_employee(item.dict())
    return result

@app.get("/auto_approve_TL_leaves")
async def trigger_auto_approval():
    result = auto_approve_manager_leaves()
    return result


# Notification System Endpoints

@app.get("/notifications/{userid}")
async def get_user_notifications(
    userid: str,
):
    """Get notifications for a user with optional filters"""
    try:
        notifications = get_notifications(
            userid=userid,
        )
        return {"notifications": notifications}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/notifications/manage")
async def manage_notifications(data: NotificationManage):
    """
    Endpoint to manage notifications .
    Actions: mark_read, mark_all_read, delete
    """
    try:
        action = data.action
        userid = data.userid
        notification_id = data.notification_id
        notification_ids = data.notification_ids or []
        is_read = data.is_read
        
        # Action: Mark single notification as read/unread
        if action == "mark_read":
            if not notification_id:
                raise HTTPException(status_code=400, detail="notification_id is required")
            success = mark_notification_read(notification_id, is_read)
            if success:
                return {"status": "success", "message": "Notification updated successfully"}
            else:
                raise HTTPException(status_code=404, detail="Notification not found")
        
        # Action: Mark all notifications as read for a user
        elif action == "mark_all_read":
            if not userid:
                raise HTTPException(status_code=400, detail="userid is required")
            count = mark_all_notifications_read(userid)
            return {"status": "success", "message": f"Marked {count} notifications as read", "count": count}
        
        # Action: Delete single notification
        elif action == "delete":
            if not notification_id:
                raise HTTPException(status_code=400, detail="notification_id is required")
            success = delete_notification(notification_id)
            if success:
                return {"status": "success", "message": "Notification deleted successfully"}
            else:
                raise HTTPException(status_code=404, detail="Notification not found")
        
        else:
            raise HTTPException(status_code=400, detail=f"Invalid action: {action}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/notifications/{userid}/unread-count")
async def get_user_unread_count(userid: str):
    """Get count of unread notifications for a user"""
    try:
        count = get_unread_notification_count(userid)
        return {"unread_count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# WebSocket endpoint for real-time notifications
@app.websocket("/ws/notifications/{userid}")
async def websocket_endpoint(websocket: WebSocket, userid: str):
    print(f"WebSocket connection attempt for user: {userid}")
    try:
        await notification_manager.connect(websocket, userid)
        print(f"WebSocket connected successfully for user: {userid}")
        
        # Send existing unread notifications on connection
        try:
            notifications = get_notifications(userid, is_read=False, limit=10)
            if notifications:
                for notification in notifications:
                    if websocket.client_state.value == 1:  # WebSocketState.CONNECTED
                        await websocket.send_text(json.dumps({
                            "type": "notification",
                            "data": notification
                        }))
        except Exception as e:
            print(f"Error sending initial notifications: {e}")
        
        # Keep the connection alive
        while True:
            try:
                # Check if connection is still open
                if websocket.client_state.value != 1:  # Not CONNECTED
                    break
                    
                # Receive any message (ping/pong or other client messages)
                data = await websocket.receive_text()
                print(f"Received message from {userid}: {data}")
                
                # Only send response if connection is still open
                if websocket.client_state.value == 1:  # WebSocketState.CONNECTED
                    await websocket.send_text(json.dumps({"type": "pong", "message": "Connection alive"}))
                    
            except WebSocketDisconnect:
                print(f"WebSocket disconnect for user: {userid}")
                break
            except Exception as e:
                print(f"WebSocket receive error for user {userid}: {e}")
                break
                
    except WebSocketDisconnect:
        print(f"WebSocket disconnect for user: {userid}")
    except Exception as e:
        print(f"WebSocket error for user {userid}: {e}")
    finally:
        # Ensure cleanup happens
        notification_manager.disconnect(websocket, userid)

if __name__ == "__main__":
    # Get port from environment variable (Railway sets this)
    port = int(os.environ.get("PORT", 8080))
    
    # Check if SSL certificates exist (for local development)
    key_file_path = os.path.join(os.path.dirname(__file__), '../certificates/key.pem')
    cert_file_path = os.path.join(os.path.dirname(__file__), '../certificates/cert.pem')
    
    # Use SSL only if certificates exist (local development)
    # Railway handles SSL at the edge, so we don't need it in production
    if os.path.exists(key_file_path) and os.path.exists(cert_file_path):
        print(f"Starting with SSL on port {port}")
        uvicorn.run(
            "Server:app",
            host="0.0.0.0",
            port=port,
            ssl_keyfile=key_file_path,
            ssl_certfile=cert_file_path
        )
    else:
        print(f"Starting without SSL on port {port}")
        uvicorn.run(
            "Server:app",
            host="0.0.0.0",
            port=port
        )


#---------------------------------------------------------------------------------------------------------




# Holiday Management Endpoints
@app.post("/api/holidays/{year}")
def add_holidays(year: int, body: HolidayYear):
    """Admin only - Add holidays for a specific year"""
    if body.year != year:
        raise HTTPException(status_code=400, detail="Year mismatch between path and body")
   
    insert_holidays(year, [h.dict() for h in body.holidays])
    return {"message": f"Holidays saved for {year}"}


@app.get("/api/holidays/{year}")
def get_holidays_for_year(year: int, include_working_days: bool = False):
    """
    Get holidays and working days for a year
    
    Parameters:
    - year: The year to get holidays for
    - include_working_days: If True, includes working days calculation (default: False)
    """
    holiday_doc = get_holidays(year)
    
    if not holiday_doc:
        return {
            "year": year,
            "holidays": [],
            "totalWorkingDays": None,
            "workingDays": None
        } if include_working_days else {"year": year, "holidays": []}
    
    if "_id" in holiday_doc:
        holiday_doc["_id"] = str(holiday_doc["_id"])
    
    if include_working_days:
        holidays = holiday_doc["holidays"]
        working_days = calculate_working_days(year, holidays)
        
        return {
            **holiday_doc,
            "totalWorkingDays": len(working_days),
            "workingDays": working_days
        }
    
    return holiday_doc

@app.get("/attendance/user/{userid}")
async def get_user_attendance(
    userid: str, 
    year: int = Query(None)
):
    """
    Get user attendance statistics for a specific year or dashboard view
    - If year is provided: returns stats for that year
    - If year is None: returns dashboard data (current year overview)
    """
    try:
        if year is None:
            # Dashboard view - no year specified
            dashboard_data = get_user_attendance_dashboard(userid)
            return dashboard_data
        else:
            # Specific year view
            stats = calculate_user_attendance_stats(userid, year)
            user = Users.find_one({"_id": ObjectId(userid)}, {"name": 1, "email": 1})
            
            return {
                "user_info": {
                    "userid": userid,
                    "name": user.get("name", "Unknown") if user else "Unknown",
                    "email": user.get("email", "") if user else ""
                },
                "attendance_stats": stats,
                "year": year
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/attendance/team/{team_leader}")
async def get_team_attendance(
    team_leader: str, 
    year: int = Query(None),
    member_id: str = Query(None)
):
    """
    Get team attendance statistics
    - If member_id is None: returns all team members' attendance
    - If member_id is provided: returns specific team member's detailed attendance
    """
    try:
        if year is None:
            year = date.today().year
        
        if member_id is None:
            # Get all team members' attendance
            team_stats = get_team_attendance_stats(team_leader, year)
            return team_stats
        else:
            # Get specific team member's attendance
            # Verify that the user belongs to this team leader
            user = Users.find_one({"_id": ObjectId(member_id), "TL": team_leader})
            if not user:
                raise HTTPException(status_code=403, detail="User is not in your team")
            
            stats = calculate_user_attendance_stats(member_id, year)
            
            return {
                "team_leader": team_leader,
                "member_stats": {
                    **stats,
                    "user_info": {
                        "userid": member_id,
                        "name": user.get("name"),
                        "email": user.get("email"),
                        "department": user.get("department"),
                        "position": user.get("position")
                    }
                },
                "year": year
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/attendance/admin/overview")
async def get_admin_attendance_overview(year: int = Query(None)):
    """Admin can see company-wide attendance statistics"""
    try:
        if year is None:
            year = date.today().year
        
        company_stats = get_department_attendance_stats(year=year)
        return company_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Helper function to send delivered status after a short delay
async def send_delivered_status_delayed(message_id: str, sender_id: str, recipient_id: str):
    """Send delivered status to sender after a short delay"""
    await asyncio.sleep(0.5)  # Small delay to ensure message is received
    try:
        await direct_chat_manager.send_message(sender_id, {
            "type": "message_status",
            "messageId": message_id,
            "status": "delivered",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        })
        
        # Update status in database
        if ObjectId.is_valid(message_id):
            msg_obj_id = ObjectId(message_id)
        else:
            msg_obj_id = message_id
        
        chats_collection.update_one(
            {"$or": [{"_id": msg_obj_id}, {"id": message_id}]},
            {"$set": {
                "status": "delivered",
                "status_updated_at": datetime.utcnow().isoformat() + "Z"
            }}
        )
    except Exception as e:
        print(f"Error sending delivered status: {e}")


# Helper function to send delivered status for group messages
async def send_group_delivered_status(message_id: str, sender_id: str, group_id: str):
    """Send delivered status to sender for group messages after a short delay"""
    await asyncio.sleep(0.5)  # Small delay to ensure message is received
    try:
        # Send delivered status update to the sender
        await direct_chat_manager.send_message(sender_id, {
            "type": "message_status",
            "messageId": message_id,
            "status": "delivered",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        })
        
        # Update status in database
        if ObjectId.is_valid(message_id):
            msg_obj_id = ObjectId(message_id)
        else:
            msg_obj_id = message_id
        
        messages_collection.update_one(
            {"$or": [{"_id": msg_obj_id}, {"id": message_id}]},
            {"$set": {
                "status": "delivered",
                "status_updated_at": datetime.utcnow().isoformat() + "Z"
            }}
        )
    except Exception as e:
        print(f"Error sending group delivered status: {e}")


@app.websocket("/ws/notify/{user_id}")
async def ws_notify(websocket: WebSocket, user_id: str):
    await notify_manager.connect(user_id, websocket)
    try:
        # Keep the connection alive; client does not need to send anything frequently.
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await notify_manager.disconnect(user_id, websocket)


# Fetch chat history
# server.py
active_users: dict[str, WebSocket] = {}

@app.websocket("/ws/{userid}")
async def websocket_endpoint(websocket: WebSocket, userid: str):
    # Connect socket
    await direct_chat_manager.connect(userid, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            
            # Skip empty messages completely, but allow control packets like typing/read receipts
            text = msg.get("text", "").strip()
            msg_type = msg.get("type", "chat")

            # Allow 'typing' and 'read_receipt' messages even when text is empty
            if not text and msg_type not in ("read_receipt", "typing", "message_status"):
                continue
            
            msg["timestamp"] = datetime.utcnow().isoformat() + "Z"
            msg.pop("pending", None)

            # Handle message status updates (delivered, read, etc.)
            if msg_type == "message_status":
                message_id = msg.get("messageId")
                status = msg.get("status")  # 'delivered' or 'read'
                to_user = msg.get("to_user")
                
                if message_id and status and to_user:
                    try:
                        # Update the message status in database
                        if ObjectId.is_valid(message_id):
                            msg_obj_id = ObjectId(message_id)
                        else:
                            msg_obj_id = message_id
                        
                        update_data = {
                            f"status": status,
                            f"status_updated_at": datetime.utcnow().isoformat() + "Z"
                        }
                        
                        chats_collection.update_one(
                            {"$or": [{"_id": msg_obj_id}, {"id": message_id}]},
                            {"$set": update_data}
                        )
                        
                        # Send status update back to sender
                        await direct_chat_manager.send_message(to_user, {
                            "type": "message_status",
                            "messageId": message_id,
                            "status": status,
                            "timestamp": msg.get("timestamp")
                        })
                    except Exception as e:
                        print(f"Error updating message status: {e}")
                continue  # Don't process as regular message

            # Handle read receipts separately
            if msg_type == "read_receipt":
                # Send read receipt notification to the original sender
                to_user = msg.get("to_user")
                if to_user:
                    await direct_chat_manager.send_message(to_user, {
                        "type": "message_status",
                        "messageId": msg.get("messageId"),
                        "status": "read",
                        "timestamp": msg.get("timestamp")
                    })
                continue  # Don't save read receipts to database

            # Handle typing indicator messages safely and route them without assuming to_user exists
            if msg_type == "typing":
                try:
                    chat_id = msg.get("chatId")
                    # For group typing events, forward to group tl
                    if chat_id and str(chat_id).startswith("group_"):
                        await group_ws_manager.send_message(chat_id, msg)
                    else:
                        # Direct chat: prefer explicit to_user, otherwise derive from chatId
                        to_user = msg.get("to_user")
                        if not to_user and chat_id:
                            parts = str(chat_id).split("_")
                            if len(parts) == 2:
                                # pick the other participant
                                to_user = parts[0] if parts[1] == userid else parts[1]
                        if to_user:
                            await direct_chat_manager.send_message(to_user, msg)
                except Exception as e:
                    print(f"Error routing typing event: {e}")
                continue

            if msg_type == "thread":
                temp_id = msg.get("tempId")
                msg["id"] = msg.get("id") or str(ObjectId())
                threads_collection.insert_one(msg.copy())
                msg["_tempId"] = temp_id
                msg.pop("_id", None)

                if msg.get("chatId") and msg.get("chatId").startswith("group_"):
                    # Send to group channel
                    await group_ws_manager.send_message(msg["chatId"], msg)
                    continue

            if msg_type == "thread":
                temp_id = msg.get("tempId")
                msg["id"] = msg.get("id") or str(ObjectId())
                threads_collection.insert_one(msg.copy())
                msg["_tempId"] = temp_id
                msg.pop("_id", None)

                if msg.get("chatId") and msg.get("chatId").startswith("group_"):
                    # Send to group channel
                    await group_ws_manager.send_message(msg["chatId"], msg)
                else:
                    # Direct chat thread - create notification
                    recipient_id = msg.get("to_user")
                    message_text = msg.get("text", "")
                    
                    if recipient_id and message_text:
                        try:
                            # Get sender info
                            sender = Users.find_one({"_id": ObjectId(userid)}) if ObjectId.is_valid(userid) else Users.find_one({"userid": userid})
                            sender_name = sender.get("name", "Unknown User") if sender else "Unknown User"
                            
                            # Create direct chat notification
                            await Mongo.create_direct_chat_notification(
                                sender_id=userid,
                                recipient_id=recipient_id,
                                sender_name=sender_name,
                                message_preview=message_text
                            )
                        except Exception as e:
                            print(f"Error creating thread chat notification: {e}")
                    
                    await direct_chat_manager.send_message(msg["to_user"], msg)

            else:  # normal chat
                msg["chatId"] = msg.get("chatId") or "_".join(sorted([userid, msg["to_user"]]))
                # Set initial status to 'sent' when message is saved to database
                msg["status"] = "sent"
                msg["status_updated_at"] = msg.get("timestamp")
                
                # Insert message and capture the inserted ID
                insert_result = chats_collection.insert_one(msg.copy())
                msg_id = str(insert_result.inserted_id)
                msg["id"] = msg_id  # Set the actual database ID
                msg.pop("_id", None)

                # Create direct chat notification
                recipient_id = msg.get("to_user")
                message_text = msg.get("text", "")
                
                if recipient_id and message_text:
                    try:
                        # Get sender info from Users or admin collection
                        sender = None
                        sender_name = "Unknown User"
                        if ObjectId.is_valid(userid):
                            sender = Users.find_one({"_id": ObjectId(userid)})
                            if not sender:
                                sender = admin.find_one({"_id": ObjectId(userid)})
                        else:
                            sender = Users.find_one({"userid": userid})
                            if not sender:
                                sender = admin.find_one({"userid": userid})
                        if sender:
                            sender_name = sender.get("name", "Admin") if sender.get("name") else "Admin"

                        # Create direct chat notification
                        await Mongo.create_direct_chat_notification(
                            sender_id=userid,
                            recipient_id=recipient_id,
                            sender_name=sender_name,
                            message_preview=message_text
                        )
                    except Exception as e:
                        print(f"Error creating direct chat notification: {e}")

                # Send message to recipient
                await direct_chat_manager.send_message(msg["to_user"], msg)
                
                # After recipient receives the message, send delivered status back to sender
                # This will be done automatically when recipient receives and acknowledges
                asyncio.create_task(send_delivered_status_delayed(msg_id, userid, msg["to_user"]))

    except WebSocketDisconnect:
        direct_chat_manager.disconnect(userid, websocket)





@app.get("/history/{chatId}")
async def history(chatId: str, limit: int = Query(20, ge=1, le=100), before: str = Query(None), user_id: str = Query(None)):
    query = {
        "chatId": chatId,
        "type": {"$ne": "thread"},
        "isThread": {"$ne": True}
    }
    
    # Filter out messages deleted for this user
    if user_id:
        query["deleted_for"] = {"$ne": user_id}
    
    if before:
        try:
            before_obj_id = ObjectId(before)
            query["_id"] = {"$lt": before_obj_id}
        except:
            pass
    
    cursor = chats_collection.find(query).sort("timestamp", -1).limit(limit)
    messages = []
    for doc in cursor:
        mid = str(doc.get("id") or doc.get("_id"))
        reply_count = threads_collection.count_documents({"rootId": mid})
        messages.append({
            "id": mid,
            "from_user": doc.get("from_user"),
            "to_user": doc.get("to_user"),
            "text": doc.get("text"),
            "file": doc.get("file"),
            "timestamp": doc["timestamp"].isoformat() if isinstance(doc.get("timestamp"), datetime) else doc.get("timestamp"),
            "chatId": doc.get("chatId"),
            "reply_count": reply_count,
            "status": doc.get("status", "sent"),
            "status_updated_at": doc.get("status_updated_at", doc.get("timestamp")),
        })
    messages.reverse()
    return messages


@app.post("/thread")
async def save_thread(payload: dict = Body(...)):
    payload["id"] = payload.get("id") or str(ObjectId())
    payload["timestamp"] = datetime.utcnow().isoformat() +"Z"
    threads_collection.insert_one(payload.copy())
    return {"status": "success", "thread": payload}

@app.get("/thread/{rootId}")
async def get_threads(rootId: str, user_id: str = Query(None)):
    query = {"rootId": rootId}
    
    # Filter out thread messages deleted for this user
    if user_id:
        query["deleted_for"] = {"$ne": user_id}
    
    threads = list(threads_collection.find(query).sort("timestamp", 1))
    result = []
    for t in threads:
        result.append({
            "id": str(t.get("id") or t.get("_id")),
            "from_user": t.get("from_user"),
            "to_user": t.get("to_user"),
            "text": t.get("text"),
            "file": t.get("file"),
            "timestamp": t.get("timestamp"),
            "rootId": t.get("rootId"),
        })
    return result



@app.post("/create_group")
async def create_group(group: GroupCreate):
    group_id = str(uuid.uuid4())
    doc = {
        "_id": group_id,
        "name": group.name,
        "members": group.members,
        "created_at": datetime.utcnow()
    }
    groups_collection.insert_one(doc)
    return {"status": "success", "group_id": group_id, "name": group.name}

from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

@app.get("/get_user_groups/{user_id}")
async def get_user_groups(user_id: str):
    # Fetch groups where user is a member
    groups_cursor = groups_collection.find({"members": user_id})
    groups = list(groups_cursor)  # <--- await here

    # Convert MongoDB ObjectId and datetime to JSON-safe
    groups_json = jsonable_encoder(groups)

    return JSONResponse(content=groups_json)





@app.websocket("/ws/group/{group_id}")
async def websocket_group(websocket: WebSocket, group_id: str):
    await group_ws_manager.connect(group_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()

            # Skip empty messages completely, but allow control packets like typing/read receipts/message_status
            text = data.get("text", "").strip()
            msg_type = data.get("type", "message")
            if not text and msg_type not in ("read_receipt", "typing", "message_status"):
                continue

            # If this is a message status update, handle it separately
            if msg_type == "message_status":
                message_id = data.get("messageId")
                status = data.get("status")  # 'delivered' or 'read'
                
                if message_id and status:
                    try:
                        # Update the message status in database
                        if ObjectId.is_valid(message_id):
                            msg_obj_id = ObjectId(message_id)
                        else:
                            msg_obj_id = message_id
                        
                        messages_collection.update_one(
                            {"$or": [{"_id": msg_obj_id}, {"id": message_id}]},
                            {"$set": {
                                "status": status,
                                "status_updated_at": datetime.utcnow().isoformat() + "Z"
                            }}
                        )
                        
                        # Broadcast status update to all group members
                        await group_ws_manager.broadcast(group_id, data)
                    except Exception as e:
                        print(f"Error updating group message status: {e}")
                continue

            # If this is a typing control frame for the group, broadcast it and don't persist
            if msg_type == "typing":
                try:
                    await group_ws_manager.broadcast(group_id, data)
                    # Also forward typing events to each member's personal socket so
                    # users receive group typing notifications even when they are
                    # connected to their personal socket (not the group socket).
                    try:
                        group = groups_collection.find_one({"_id": group_id})
                        if group:
                            members = group.get("members", [])
                            sender = data.get("from_user")
                            for member_id in members:
                                try:
                                    if member_id and member_id != sender:
                                        # send typing payload to member's personal connection
                                        await direct_chat_manager.send_message(member_id, data)
                                except Exception:
                                    # ignore per-member send errors
                                    pass
                    except Exception as e:
                        print(f"Error forwarding group typing to personal sockets: {e}")
                except Exception as e:
                    print(f"Error broadcasting group typing event: {e}")
                continue

            # Add timestamp & unique id
            data["timestamp"] = datetime.utcnow().isoformat() + "Z"
            data["id"] = data.get("id") or str(ObjectId())

            # Check if this is a thread message
            msg_type = data.get("type", "message")
            
            if msg_type == "thread" or data.get("isThread") or data.get("rootId"):
                # Thread message - save to threads_collection only
                threads_collection.insert_one({
                    "type": "thread",
                    "chatId": group_id,
                    "from_user": data.get("from_user"),
                    "text": data.get("text"),
                    "rootId": data.get("rootId"),
                    "isThread": True,
                    "timestamp": data["timestamp"],
                    "id": data["id"]
                })
            elif msg_type != "read_receipt":
                # Regular message - save to messages_collection with initial status
                insert_result = messages_collection.insert_one({
                    "chatId": group_id,
                    "from_user": data.get("from_user"),
                    "text": data.get("text"),
                    "file": data.get("file"),
                    "timestamp": data["timestamp"],
                    "status": "sent",  # Initial status is 'sent'
                    "status_updated_at": data["timestamp"]
                })
                data["id"] = str(insert_result.inserted_id)  # Update data with real ID

            # Broadcast to all group members
            await group_ws_manager.broadcast(group_id, data)
            
            # Send delivered status to sender after a short delay (for regular messages only)
            if msg_type == "message" and not data.get("isThread") and data.get("id"):
                asyncio.create_task(send_group_delivered_status(data.get("id"), data.get("from_user"), group_id))
            
            # Create group chat notifications
            try:
                sender_id = data.get("from_user")
                message_text = data.get("text", "")
                
                # Get group info
                group = groups_collection.find_one({"_id": group_id})
                if group and message_text:
                    group_name = group.get("name", "Group")
                    member_ids = group.get("members", [])
                    
                    # Get sender name
                    sender = Users.find_one({"userid": sender_id})
                    sender_name = sender.get("name", "Unknown User") if sender else "Unknown User"
                    
                    # Send notifications to all members except sender
                    await Mongo.create_group_chat_notification(
                        sender_id=sender_id,
                        group_id=group_id,
                        sender_name=sender_name,
                        group_name=group_name,
                        message_preview=message_text,
                        member_ids=member_ids
                    )
            except Exception as e:
                print(f"Error creating group chat notification: {e}")
                
    except Exception as e:
        print("WS disconnected", e)
    finally:
        group_ws_manager.disconnect(group_id, websocket)


# Fetch group chat history
@app.get("/group_history/{group_id}")
async def group_history(group_id: str, limit: int = Query(20, ge=1, le=100), before: str = Query(None), user_id: str = Query(None)):
    query = {
        "chatId": group_id,
        "type": {"$ne": "thread"},
        "isThread": {"$ne": True}
    }
    
    # Filter out messages deleted for this user
    if user_id:
        query["deleted_for"] = {"$ne": user_id}
    
    if before:
        try:
            before_obj_id = ObjectId(before)
            query["_id"] = {"$lt": before_obj_id}
        except:
            pass
    
    cursor = messages_collection.find(query).sort("timestamp", -1).limit(limit)
    messages = []
    for doc in cursor:
        mid = str(doc.get("_id"))
        reply_count = threads_collection.count_documents({"rootId": mid})
        messages.append({
            "id": mid,
            "from_user": doc.get("from_user"),
            "text": doc.get("text"),
            "file": doc.get("file"),
            "timestamp": doc.get("timestamp").isoformat() if isinstance(doc.get("timestamp"), datetime) else doc.get("timestamp"),
            "chatId": doc.get("chatId"),
            "reply_count": reply_count,
            "status": doc.get("status", "sent"),
            "status_updated_at": doc.get("status_updated_at", doc.get("timestamp").isoformat() if isinstance(doc.get("timestamp"), datetime) else doc.get("timestamp")),
        })
    messages.reverse()
    return messages

@app.delete("/delete_group/{group_id}")
async def delete_group(group_id: str):
    result = groups_collection.delete_one({"_id": group_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Optionally, delete all messages in that group
    messages_collection.delete_many({"chatId": group_id})
    
    return {"status": "success", "message": f"Group {group_id} deleted successfully"}

@app.put("/update_group/{group_id}")
async def update_group(group_id: str, group: GroupUpdate):
    result = groups_collection.update_one(
        {"_id": group_id},
        {"$set": {"name": group.name, "members": group.members, "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Group not found")
    return {"status": "success", "group_id": group_id, "name": group.name}


@app.post("/delete_message")
async def delete_message(request: DeleteMessageRequest):
    """Delete a message either for one user or for everyone"""
    try:
        message_id = request.message_id
        delete_type = request.delete_type
        user_id = request.user_id
        chat_id = request.chat_id
        is_group = request.is_group
        
        # Convert message_id to ObjectId if valid
        if ObjectId.is_valid(message_id):
            msg_obj_id = ObjectId(message_id)
        else:
            msg_obj_id = message_id
        
        # Select appropriate collection
        collection = messages_collection if is_group else chats_collection
        
        # Find the message
        message = collection.find_one({"$or": [{"_id": msg_obj_id}, {"id": message_id}]})
        
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
        
        if delete_type == "for_everyone":
            # Check if user is the sender
            if message.get("from_user") != user_id:
                raise HTTPException(status_code=403, detail="Only sender can delete for everyone")
            
            # Delete the message from database
            collection.delete_one({"$or": [{"_id": msg_obj_id}, {"id": message_id}]})
            
            # Delete all associated threads
            threads_collection.delete_many({"rootId": message_id})
            
            # Broadcast deletion to all participants
            deletion_event = {
                "type": "message_deleted",
                "messageId": message_id,
                "deleteType": "for_everyone",
                "chatId": chat_id,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            
            if is_group:
                # Broadcast to group
                await group_ws_manager.broadcast(chat_id, deletion_event)
            else:
                # Send to both users in direct chat
                to_user = message.get("to_user")
                from_user = message.get("from_user")
                if to_user:
                    await direct_chat_manager.send_message(to_user, deletion_event)
                if from_user:
                    await direct_chat_manager.send_message(from_user, deletion_event)
            
            return {"status": "success", "message": "Message deleted for everyone"}
        
        else:  # delete_type == "for_me"
            # Add user to deleted_for array
            result = collection.update_one(
                {"$or": [{"_id": msg_obj_id}, {"id": message_id}]},
                {
                    "$addToSet": {"deleted_for": user_id},
                    "$set": {"deleted_at": datetime.utcnow().isoformat() + "Z"}
                }
            )
            
            if result.modified_count == 0:
                raise HTTPException(status_code=400, detail="Failed to update message")
            
            # Fetch updated message to check if should be permanently deleted
            updated_message = collection.find_one({"$or": [{"_id": msg_obj_id}, {"id": message_id}]})
            
            # Get group members if it's a group message
            group_members = None
            if is_group:
                group_id = chat_id.replace("group_", "")
                group = groups_collection.find_one({"_id": group_id})
                if group:
                    group_members = group.get("members", [])
            
            # Check if message should be permanently deleted
            if should_permanently_delete(updated_message, is_group, group_members):
                # All participants have deleted - permanently remove from DB
                collection.delete_one({"$or": [{"_id": msg_obj_id}, {"id": message_id}]})
                
                # Delete all associated threads
                threads_collection.delete_many({"rootId": message_id})
                
                print(f"Message {message_id} permanently deleted - all participants deleted it")
                
                # Optionally broadcast permanent deletion
                permanent_deletion_event = {
                    "type": "message_permanently_deleted",
                    "messageId": message_id,
                    "chatId": chat_id,
                    "timestamp": datetime.utcnow().isoformat() + "Z"
                }
                
                if is_group:
                    await group_ws_manager.broadcast(chat_id, permanent_deletion_event)
                else:
                    to_user = updated_message.get("to_user")
                    from_user = updated_message.get("from_user")
                    if to_user:
                        await direct_chat_manager.send_message(to_user, permanent_deletion_event)
                    if from_user:
                        await direct_chat_manager.send_message(from_user, permanent_deletion_event)
                
                return {
                    "status": "success", 
                    "message": "Message deleted for you and permanently removed from server",
                    "permanently_deleted": True
                }
            
            # Send deletion event only to this user
            deletion_event = {
                "type": "message_deleted",
                "messageId": message_id,
                "deleteType": "for_me",
                "chatId": chat_id,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            
            await direct_chat_manager.send_message(user_id, deletion_event)
            
            return {
                "status": "success", 
                "message": "Message deleted for you",
                "permanently_deleted": False
            }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting message: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/delete_thread_message")
async def delete_thread_message(request: DeleteMessageRequest):
    """Delete a thread message"""
    try:
        message_id = request.message_id
        delete_type = request.delete_type
        user_id = request.user_id
        chat_id = request.chat_id
        is_group = request.is_group
        
        # Convert message_id to ObjectId if valid
        if ObjectId.is_valid(message_id):
            msg_obj_id = ObjectId(message_id)
        else:
            msg_obj_id = message_id
        
        # Find the thread message
        thread_msg = threads_collection.find_one({"$or": [{"_id": msg_obj_id}, {"id": message_id}]})
        
        if not thread_msg:
            raise HTTPException(status_code=404, detail="Thread message not found")
        
        if delete_type == "for_everyone":
            # Check if user is the sender
            if thread_msg.get("from_user") != user_id:
                raise HTTPException(status_code=403, detail="Only sender can delete for everyone")
            
            # Delete the thread message
            threads_collection.delete_one({"$or": [{"_id": msg_obj_id}, {"id": message_id}]})
            
            # Broadcast deletion to all participants
            deletion_event = {
                "type": "thread_deleted",
                "messageId": message_id,
                "rootId": thread_msg.get("rootId"),
                "deleteType": "for_everyone",
                "chatId": chat_id,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            
            if is_group:
                await group_ws_manager.broadcast(chat_id, deletion_event)
            else:
                to_user = thread_msg.get("to_user")
                from_user = thread_msg.get("from_user")
                if to_user:
                    await direct_chat_manager.send_message(to_user, deletion_event)
                if from_user:
                    await direct_chat_manager.send_message(from_user, deletion_event)
            
            return {"status": "success", "message": "Thread message deleted for everyone"}
        
        else:  # delete_type == "for_me"
            # Add user to deleted_for array
            result = threads_collection.update_one(
                {"$or": [{"_id": msg_obj_id}, {"id": message_id}]},
                {
                    "$addToSet": {"deleted_for": user_id},
                    "$set": {"deleted_at": datetime.utcnow().isoformat() + "Z"}
                }
            )
            
            if result.modified_count == 0:
                raise HTTPException(status_code=400, detail="Failed to update thread message")
            
            # Fetch updated message to check if should be permanently deleted
            updated_message = threads_collection.find_one({"$or": [{"_id": msg_obj_id}, {"id": message_id}]})
            
            # Get group members if it's a group message
            group_members = None
            if is_group:
                group_id = chat_id.replace("group_", "")
                group = groups_collection.find_one({"_id": group_id})
                if group:
                    group_members = group.get("members", [])
            
            # Check if message should be permanently deleted
            if should_permanently_delete(updated_message, is_group, group_members):
                # All participants have deleted - permanently remove from DB
                threads_collection.delete_one({"$or": [{"_id": msg_obj_id}, {"id": message_id}]})
                
                print(f"Thread message {message_id} permanently deleted - all participants deleted it")
                
                # Optionally broadcast permanent deletion
                permanent_deletion_event = {
                    "type": "thread_permanently_deleted",
                    "messageId": message_id,
                    "rootId": updated_message.get("rootId"),
                    "chatId": chat_id,
                    "timestamp": datetime.utcnow().isoformat() + "Z"
                }
                
                if is_group:
                    await group_ws_manager.broadcast(chat_id, permanent_deletion_event)
                else:
                    to_user = updated_message.get("to_user")
                    from_user = updated_message.get("from_user")
                    if to_user:
                        await direct_chat_manager.send_message(to_user, permanent_deletion_event)
                    if from_user:
                        await direct_chat_manager.send_message(from_user, permanent_deletion_event)
                
                return {
                    "status": "success", 
                    "message": "Thread message deleted for you and permanently removed from server",
                    "permanently_deleted": True
                }
            
            deletion_event = {
                "type": "thread_deleted",
                "messageId": message_id,
                "rootId": updated_message.get("rootId"),
                "deleteType": "for_me",
                "chatId": chat_id,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            
            await direct_chat_manager.send_message(user_id, deletion_event)
            
            return {
                "status": "success", 
                "message": "Thread message deleted for you",
                "permanently_deleted": False
            }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting thread message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ------------------ Assign Document ------------------
@app.post("/assign_docs")
async def assign_docs(payload: AssignPayload, assigned_by: str = "HR"):
    if not payload.userIds or not payload.docName:
        raise HTTPException(status_code=400, detail="docName and userIds required")
    
    count = 0
    for uid in payload.userIds:
        # Only add doc if not already assigned
        result = Users.update_one(
            {"userid": uid, "assigned_docs.docName": {"$ne": payload.docName}},
            {"$push": {
                "assigned_docs": {
                    "docName": payload.docName,
                    "status": "Pending",
                    "assignedBy": assigned_by,
                    "assignedAt": datetime.utcnow(),
                    "fileId": None,
                    "remarks": None
                }
            }}
        )
        if result.modified_count > 0:
            count += 1
            
            # Send notification to user about document assignment
            try:
                await Mongo.create_document_assignment_notification(
                    userid=uid,
                    doc_name=payload.docName,
                    assigned_by_name=assigned_by,
                    assigned_by_id=None  # Can be enhanced to get actual assigner ID
                )
            except Exception as e:
                print(f"Error sending document assignment notification: {e}")

    return {"message": f'"{payload.docName}" assigned to {count} user(s)'}


# ------------------ Fetch Assigned Documents ------------------
@app.get("/documents/assigned/{userId}")
def fetch_assigned_docs(userId: str):
    try:
        # First try to find user in Users collection
        user = Users.find_one({"userid": userId})
        
        # If not found, try with ObjectId format
        if not user:
            try:
                user = Users.find_one({"_id": ObjectId(userId)})
            except Exception as e:
                print(f"Error finding user by ObjectId: {e}")
                pass
        
        # If still not found, check admin collection
        if not user:
            try:
                user = admin.find_one({"_id": ObjectId(userId)})
            except Exception as e:
                print(f"Error finding user in admin collection: {e}")
                pass
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        assigned_docs = []
        assigned_docs_list = user.get("assigned_docs", [])
        
        # Collect all valid file IDs first
        file_ids = []
        for doc in assigned_docs_list:
            file_id = doc.get("fileId")
            if file_id:
                try:
                    file_ids.append(ObjectId(file_id))
                except Exception as e:
                    print(f"Invalid file_id format {file_id}: {e}")
        
        # Batch query for all files at once to reduce database calls
        file_docs_map = {}
        if file_ids:
            try:
                # Use find with $in operator for batch retrieval with timeout
                cursor = assignments_collection.find(
                    {"_id": {"$in": file_ids}}
                ).max_time_ms(5000)  # 5 second timeout for this query
                
                for file_doc in cursor:
                    file_docs_map[str(file_doc["_id"])] = file_doc
            except Exception as e:
                print(f"Error batch fetching files: {e}")
                # Continue without file docs if batch query fails
        
        # Build response
        for doc in assigned_docs_list:
            file_id = doc.get("fileId")
            file_exists = file_id and str(file_id) in file_docs_map
            
            assigned_docs.append({
                "docName": doc.get("docName"),
                "status": doc.get("status", "Pending"),
                "fileUrl": f"/download_file/{file_id}" if file_exists else None,
                "assignedBy": doc.get("assignedBy"),
                "assignedAt": doc.get("assignedAt"),
                "fileId": file_id,
                "remarks": doc.get("remarks")
            })
        
        return assigned_docs
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in fetch_assigned_docs: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")



# ------------------ Review Document ------------------
@app.put("/review_document")
async def review_document(payload: ReviewPayload):
    result = Users.update_one(
        {"userid": payload.userId, "assigned_docs.docName": payload.docName},
        {"$set": {
            "assigned_docs.$.status": payload.status,
            "assigned_docs.$.remarks": payload.remarks,
            "assigned_docs.$.reviewedAt": datetime.utcnow()
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Document assignment not found")
    
    # Send notification to user about document review
    try:
        # Get reviewer info (assuming it's from the request or session)
        # For now, we'll use a placeholder - you can enhance this to get actual reviewer info
        reviewer_name = payload.remarks or "Reviewer"  # This should be enhanced
        
        await Mongo.create_document_review_notification(
            userid=payload.userId,
            doc_name=payload.docName,
            reviewer_name="Document Reviewer",  # Should get actual reviewer name
            reviewer_id=None,  # Should get actual reviewer ID
            status=payload.status,
            remarks=payload.remarks
        )
    except Exception as e:
        print(f"Error sending document review notification: {e}")
    
    return {"message": f"Document {payload.docName} marked as {payload.status}"}



# ------------------ Upload Document ------------------

@app.post("/upload_document")
async def upload_document(
    userid: str = Form(...),
    docName: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        # Read file content
        file_data = await file.read()

        # Create file document
        file_doc = {
            "userid": userid,
            "docName": docName,
            "file": Binary(file_data),
            "filename": file.filename,
            "content_type": file.content_type,
            "createdAt": datetime.utcnow()
        }

        # Insert into files collection
        result = assignments_collection.insert_one(file_doc)
        file_id = str(result.inserted_id)

        # Update assigned_docs with consistent field names
        result_update = Users.update_one(
            {"userid": userid, "assigned_docs.docName": docName},
            {"$set": {"assigned_docs.$.status": "Uploaded", "assigned_docs.$.fileId": file_id}}
        )

        # If no existing doc, append
        if result_update.matched_count == 0:
            Users.update_one(
                {"userid": userid},
                {"$push": {
                    "assigned_docs": {
                        "docName": docName,
                        "status": "Uploaded",
                        "fileId": file_id
                    }
                }}
            )
        
        # Send notification about document upload to reviewers
        try:
            # Get user info
            user = Users.find_one({"userid": userid})
            user_name = user.get("name", "User") if user else "User"
            
            # Send notification to HR and tl
            await Mongo.create_document_upload_notification(
                userid=userid,
                doc_name=docName,
                uploaded_by_name=user_name,
                uploaded_by_id=userid,
                reviewer_ids=None  # Will auto-detect HR and tl
            )
        except Exception as e:
            print(f"Error sending document upload notification: {e}")

        return {"message": "File uploaded successfully", "file_id": file_id}

    except Exception as e:
        print("Error storing file in MongoDB:", e)
        raise HTTPException(status_code=500, detail="500: Failed to save file in database")

# ------------------ Download Document ------------------
@app.get("/download_file/{file_id}")
def download_file(file_id: str):
    try:
        file_doc = assignments_collection.find_one({"_id": ObjectId(file_id)})
        if not file_doc:
            raise HTTPException(status_code=404, detail="File not found")

        return StreamingResponse(
            iter([file_doc["file"]]),
            media_type=file_doc.get("content_type", "application/octet-stream"),
            headers={"Content-Disposition": f'attachment; filename="{file_doc["filename"]}"'}
        )
    except Exception as e:
        print("Download error:", e)
        raise HTTPException(status_code=500, detail="Failed to download file")

    try:
        file_doc = assignments_collection.find_one({"_id": ObjectId(file_id)})
        if not file_doc:
            raise HTTPException(status_code=404, detail="File not found")

        # Delete file from collection
        assignments_collection.delete_one({"_id": ObjectId(file_id)})

        # Update user's assigned_docs to remove fileId and set status to pending
        Users.update_one(
            {"userid": file_doc["userid"], "assigned_docs.fileId": file_id},
            {"$set": {"assigned_docs.$.status": "Pending", "assigned_docs.$.fileId": None}}
        )

        return {"message": "File deleted successfully"}
    except Exception as e:
        print("Delete error:", e)
        raise HTTPException(status_code=500, detail="Failed to delete file")

@app.delete("/documents/delete/{file_id}")
def delete_file(file_id: str):
    try:
        file_doc = assignments_collection.find_one({"_id": ObjectId(file_id)})  
        if not file_doc:
            raise HTTPException(status_code=404, detail="File not found")

        # Delete file from collection
        assignments_collection.delete_one({"_id": ObjectId(file_id)})

        # Update user's assigned_docs
        Users.update_one(
            {"userid": file_doc["userid"], "assigned_docs.fileId": file_id},
            {"$set": {"assigned_docs.$.status": "Pending", "assigned_docs.$.fileId": None}}
        )

        return {"message": "File deleted successfully"}
    except Exception as e:
        print("Delete error:", e)
        raise HTTPException(status_code=500, detail="Failed to delete file")

@app.delete("/assigned_doc_delete")
async def delete_assigned_doc(data: dict):
    userId = data.get("userId")
    docName = data.get("docName")

    user = Users.find_one({"userid": userId})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    Users.update_one(
        {"userid": userId},
        {"$pull": {"assigned_docs": {"docName": docName}}}
    )

    return {"message": f"Document '{docName}' deleted successfully"}

from fastapi import Response


# Backend: /api/download/:filename
@app.get("/download/{doc_type}")
async def download_document(doc_type: str, userid: str = Query(...)):
    valid_docs = {"offer_letter", "nda", "resume", "college_id", "aadhaar", "pan"}
    
    if doc_type not in valid_docs:
        raise HTTPException(400, "Invalid document type")
    
    user = Users.find_one({"userid": userid})
    if not user:
        raise HTTPException(404, "User not found")
    
    doc_url = user["documents"].get(doc_type)
    if not doc_url:
        raise HTTPException(404, f"{doc_type.replace('_', ' ').title()} not available")
    
    print(f"📥 Original URL: {doc_url}")
    
    # ✅ EXTRACT FILE ID FROM YOUR URL
    file_id_match = re.search(r'/d/([a-zA-Z0-9-_]+)', doc_url)
    if not file_id_match:
        raise HTTPException(400, "Invalid Google Docs URL")
    
    file_id = file_id_match.group(1)
    print(f"📄 File ID: {file_id}")
    
    # ✅ CONVERT TO DIRECT PDF EXPORT
    pdf_export_url = f"https://docs.google.com/document/d/{file_id}/export?format=pdf"
    print(f"📤 PDF Export: {pdf_export_url}")
    
    try:
        # Use session with proper headers to bypass Google restrictions
        session = requests.Session()
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        response = session.get(pdf_export_url, timeout=30)
        response.raise_for_status()
        
        filename = f"{doc_type.replace('_', '-')}_{userid[:8]}.pdf"
        print(f"✅ Downloaded {len(response.content)} bytes")
        
        return StreamingResponse(
            io.BytesIO(response.content),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Length": str(len(response.content))
            }
        )
    except requests.exceptions.RequestException as e:
        print(f"❌ Google Docs blocked: {e}")
        raise HTTPException(500, "Google Docs access restricted. Please use PDF files instead.")



# TL Meeting Endpoints
# Add to Server.py
@app.post("/assign-tl-meeting")
async def assign_tl_meeting_endpoint(request: dict = Body(...)):
    """TL assigns meeting - BULLETPROOF VERSION"""
    try:
        tl_id = request.get("tl_id")
        tl_name = request.get("tl_name")
        meeting_link = request.get("meeting_link")
        meeting_date = request.get("meeting_date")
        meeting_time = request.get("meeting_time")
        team_members = [m for m in request.get("team_members", []) if m]  # Remove nulls

        if not all([tl_id, tl_name, meeting_link, meeting_date, meeting_time, team_members]):
            raise HTTPException(400, "All fields required")

        # ✅ Generate meeting ID (NO import needed)
        meeting_id = f"meet_{int(datetime.now().timestamp())}"
        
        meeting_data = {
            "meeting_id": meeting_id,
            "tl_id": tl_id,
            "tl_name": tl_name,
            "meeting_link": meeting_link,
            "meeting_date": meeting_date,
            "meeting_time": meeting_time,
            "team_members": team_members,
            "status": "scheduled",
            "created_at": datetime.now(pytz.timezone('Asia/Kolkata')).isoformat()
        }

        # ✅ DEDICATED MEETINGS COLLECTION (CREATE IF NOT EXISTS)
        Meetings = db["Meetings"]  # ✅ New collection
        
        # Insert meeting
        result = Meetings.insert_one(meeting_data)
        print(f"✅ Meeting created: {meeting_id} in Meetings collection")

        # Add reference to each team member
        for member_id in team_members:
            Users.update_one(
                {"userid": member_id},
                {"$push": {
                    "assigned_meetings": {
                        **{k: v for k, v in meeting_data.items() if k != "team_members"},
                        "status": "scheduled"
                    }
                }},
                upsert=True  # Create user doc if not exists
            )

        return {
            "success": True,
            "meeting_id": meeting_id,
            "message": "Meeting assigned successfully",
            "team_members_count": len(team_members),
            "meetings_collection_id": str(result.inserted_id)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Meeting assignment error: {e}")
        raise HTTPException(500, f"Failed to assign meeting: {str(e)}")



@app.get("/tl-meetings/{tl_id}")
def get_tl_meetings_endpoint(tl_id: str):  # 🔥 RENAMED - NO CONFLICT
    """Get ALL meetings assigned BY this TL"""
    try:
        # 🔥 DIRECT MONGO - NO IMPORT/RECURSION
        from Mongo import Meetings  # Your existing import
        
        tl_meetings = list(Meetings.find({"tl_id": tl_id}).sort("created_at", -1))
        
        # Use YOUR serialize_mongo_doc function
        return serialize_mongo_doc({
            "tl_id": tl_id,
            "tl_meetings": tl_meetings,
            "total": len(tl_meetings)
        })
    except Exception as e:
        print(f"❌ TL Meetings Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/employee-meetings/{userid}")
async def get_employee_meetings(userid: str):
    """Get meetings from BOTH collections"""
    try:
        # 1. Main Meetings collection (Primary source)
        Meetings = db["Meetings"]
        main_meetings = list(Meetings.find({"team_members": userid}).sort("created_at", -1))
        
        # 2. Backup: User's assigned_meetings array
        user_meetings = []
        user_doc = Users.find_one({"userid": userid}, {"assigned_meetings": 1})
        if user_doc and user_doc.get("assigned_meetings"):
            user_meetings = user_doc["assigned_meetings"]
        
        # Combine + dedupe
        all_meetings = main_meetings + user_meetings
        
        # Format response
        formatted = []
        for meeting in all_meetings:
            formatted.append({
                "meeting_id": meeting.get("meeting_id", str(meeting.get("_id", ""))),
                "tl_id": meeting.get("tl_id"),
                "tl_name": meeting.get("tl_name", "Unknown TL"),
                "meeting_link": meeting.get("meeting_link"),
                "meeting_date": meeting.get("meeting_date"),
                "meeting_time": meeting.get("meeting_time"),
                "status": meeting.get("status", "scheduled"),
                "created_at": meeting.get("created_at")
            })
        
        return {
            "success": True,
            "meetings": formatted,
            "count": len(formatted)
        }
    except Exception as e:
        print(f"Employee meetings error: {e}")
        return {"success": False, "meetings": [], "count": 0}




@app.put("/update-meeting-status")
async def update_meeting_status(status_data: dict = Body(...)):
    """Employee marks meeting as attended/missed"""
    meeting_id = status_data.get("meeting_id")
    userid = status_data.get("userid")
    status = status_data.get("status")  # "attended", "missed"
    
    success = update_meeting_status(meeting_id, userid, status)
    return {"success": success, "message": "Status updated"}


