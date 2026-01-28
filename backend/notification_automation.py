#!/usr/bin/env python3
"""
Enhanced Notification Automation System for E-Connect
Handles all automated notification triggers and scheduled tasks
"""

import asyncio
import pytz
from datetime import datetime, timedelta
from Mongo import (
    Tasks, Users, admin, Notifications, Clock, Leave, RemoteWork,
    create_notification_with_websocket, get_unread_notification_count,
    ObjectId
)
from websocket_manager import notification_manager

# Helper functions
def get_current_timestamp_ist():
    """Get current timestamp in IST timezone"""
    return datetime.now(pytz.timezone("Asia/Kolkata"))

def format_date_readable(date_str):
    """Convert DD-MM-YYYY to readable format"""
    try:
        dt = datetime.strptime(date_str, "%d-%m-%Y")
        return dt.strftime("%B %d, %Y")
    except:
        return date_str

async def check_and_notify_overdue_tasks():
    """Check for overdue tasks and send notifications"""
    import sys
    try:
        current_time = get_current_timestamp_ist()
        current_date = current_time.strftime("%d-%m-%Y")
        print(f"[OverdueCheck] Running at {current_time.isoformat()} (IST)", file=sys.stderr)
        
        # Find all pending tasks
        overdue_tasks = list(Tasks.find({
            "status": {"$in": ["Pending", "In Progress", "pending", "in progress"]},
            "due_date": {"$exists": True, "$ne": ""}
        }))
        print(f"[OverdueCheck] Found {len(overdue_tasks)} tasks to check.", file=sys.stderr)
        
        overdue_count = 0
        notifications_sent = 0
        
        for task in overdue_tasks:
            try:
                print("[OverdueCheck] Checking for overdue tasks...")
                current_time = get_current_timestamp_ist()
                current_date = current_time.strftime("%d-%m-%Y")
                # Find all pending tasks
                overdue_tasks = list(Tasks.find({
                    "status": {"$in": ["Pending", "In Progress", "pending", "in progress"]},
                    "due_date": {"$exists": True, "$ne": ""}
                }))
                overdue_count = 0
                notifications_sent = 0
                for task in overdue_tasks:
                    try:
                        task_id = str(task["_id"])
                        userid = task.get("userid")
                        task_title = task.get("task", "Untitled Task")
                        due_date_str = task.get("due_date")
                        assigned_to = task.get("assigned_to", [])
                        manager_id = task.get("manager_id")
                        assigner_id = task.get("assigned_by") or task.get("creator_id")
                        if not due_date_str:
                            continue
                        # Parse due date (support both DD-MM-YYYY and YYYY-MM-DD)
                        due_date = None
                        current_date_obj = None
                        parse_success = False
                        for fmt in ["%d-%m-%Y", "%Y-%m-%d"]:
                            try:
                                due_date = datetime.strptime(due_date_str, fmt)
                                current_date_obj = datetime.strptime(current_date, "%d-%m-%Y")
                                parse_success = True
                                break
                            except Exception:
                                continue
                        if not parse_success:
                            continue
                        days_overdue = (current_date_obj - due_date).days
                        if days_overdue > 0:
                            overdue_count += 1
                            from Mongo import create_overdue_task_notification, create_notification_with_websocket, Users
                            # Notify task owner/assignee
                            if userid:
                                try:
                                    await create_overdue_task_notification(
                                        userid=userid,
                                        task_title=task_title,
                                        due_date_or_days=days_overdue,
                                        task_id=task_id,
                                        priority="critical"
                                    )
                                    notifications_sent += 1
                                except Exception:
                                    pass
                            # Notify assigned users
                            for assigned_user_id in assigned_to:
                                if assigned_user_id != userid:
                                    try:
                                        await create_overdue_task_notification(
                                            userid=assigned_user_id,
                                            task_title=task_title,
                                            due_date_or_days=days_overdue,
                                            task_id=task_id,
                                            priority="critical"
                                        )
                                        notifications_sent += 1
                                    except Exception:
                                        pass
                            # Notify assigner if not the assignee
                            if assigner_id and assigner_id != userid:
                                try:
                                    assigned_user = Users.find_one({"_id": ObjectId(userid)}) if userid else None
                                    assigned_user_name = assigned_user.get("name", "Employee") if assigned_user else "Employee"
                                    await create_notification_with_websocket(
                                        userid=assigner_id,
                                        title="Task You Assigned Is Overdue",
                                        message=f"The task '{task_title}' assigned by you to {assigned_user_name} is overdue by {days_overdue} day(s). Kindly check.",
                                        notification_type="assigned_task_overdue",
                                        priority="critical",
                                        action_url="/admin/task",
                                        related_id=task_id,
                                        metadata={
                                            "task_id": task_id,
                                            "assigned_to": userid,
                                            "assigned_to_name": assigned_user_name,
                                            "days_overdue": days_overdue,
                                            "is_overdue": True
                                        }
                                    )
                                    notifications_sent += 1
                                except Exception:
                                    pass
                            # Notify TL about employee's overdue task (robust lookup)
                            try:
                                employee = Users.find_one({"_id": ObjectId(userid)}) if userid else None
                                employee_name = employee.get("name", "Employee") if employee else "Employee"
                                tl_name = employee.get("TL") if employee else None
                                manager = None
                                if tl_name:
                                    manager = Users.find_one({"name": tl_name})
                                if not manager:
                                    managers = list(Users.find({"position": {"$in": ["Manager", "TL", "Team Lead"]}}))
                                else:
                                    managers = [manager]
                                for mgr in managers:
                                    manager_id = str(mgr["_id"])
                                    if manager_id == userid:
                                        continue
                                    try:
                                        await create_notification_with_websocket(
                                            userid=manager_id,
                                            title=f"Employee Task Overdue: {employee_name}",
                                            message=f"{employee_name}'s task '{task_title}' is {days_overdue} day(s) overdue. Immediate attention required.",
                                            notification_type="employee_task_overdue",
                                            priority="critical",
                                            action_url=f"/admin/task",
                                            related_id=task_id,
                                            metadata={
                                                "task_id": task_id,
                                                "employee_id": userid,
                                                "employee_name": employee_name,
                                                "days_overdue": days_overdue
                                            }
                                        )
                                        notifications_sent += 1
                                    except Exception:
                                        pass
                            except Exception:
                                pass
                            # Notify HR if the overdue task belongs to a manager or TL
                            try:
                                user = Users.find_one({"_id": ObjectId(userid)}) if userid else None
                                user_position = user.get("position", "") if user else ""
                                if user_position.upper() in ["MANAGER", "TL", "TEAM LEAD"]:
                                    from Mongo import get_hr_user_ids
                                    hr_user_ids = await get_hr_user_ids()
                                    for hr_id in hr_user_ids:
                                        try:
                                            await create_notification_with_websocket(
                                                userid=hr_id,
                                                title=f"TL Overdue Task Alert",
                                                message=f"{user.get('name', 'TL')}'s task '{task_title}' is overdue by {days_overdue} day(s). Please review.",
                                                notification_type="manager_task_overdue",
                                                priority="critical",
                                                action_url=f"/admin/task",
                                                related_id=task_id,
                                                metadata={
                                                    "task_id": task_id,
                                                    "manager_id": userid,
                                                    "manager_name": user.get('name', 'TL'),
                                                    "days_overdue": days_overdue
                                                }
                                            )
                                            notifications_sent += 1
                                        except Exception:
                                            pass
                            except Exception:
                                pass
                    except Exception:
                        continue
                return {"overdue_count": overdue_count, "notifications_sent": notifications_sent}
            except Exception:
                return {"error": "Overdue check failed"}
        
        # Find all tasks with upcoming deadlines (e.g., due today or tomorrow)
        upcoming_tasks = list(Tasks.find({
            "status": {"$in": ["Pending", "In Progress", "pending", "in progress"]},
            "due_date": {"$exists": True, "$ne": ""}
        }))
        for task in upcoming_tasks:
            try:
                task_id = str(task["_id"])
                userid = task.get("userid")
                task_title = task.get("task", "Untitled Task")
                due_date_str = task.get("due_date")
                assigned_to = task.get("assigned_to", [])
                
                if not due_date_str:
                    continue
                
                # Determine urgency and calculate days remaining
                due_date_obj = datetime.strptime(due_date_str, "%d-%m-%Y")
                current_date_obj = datetime.strptime(current_time.strftime("%d-%m-%Y"), "%d-%m-%Y")
                days_remaining = (due_date_obj - current_date_obj).days
                
                # Use enhanced deadline approach notification
                from Mongo import create_deadline_approach_notification
                
                # Notify task owner
                if userid:
                    await create_deadline_approach_notification(
                        userid=userid,
                        task_title=task_title,
                        days_remaining=days_remaining,
                        task_id=task_id,
                        priority="high" if days_remaining == 0 else "medium"
                    )
                    notifications_sent += 1
                
                # Notify assigned users
                for assigned_user_id in assigned_to:
                    if assigned_user_id != userid:
                        await create_deadline_approach_notification(
                            userid=assigned_user_id,
                            task_title=task_title,
                            days_remaining=days_remaining,
                            task_id=task_id,
                            priority="high" if days_remaining == 0 else "medium"
                        )
                        notifications_sent += 1
                        
            except Exception as e:
                continue
        
        return {"notifications_sent": notifications_sent}
        
    except Exception as e:
        return {"error": str(e)}

async def check_missed_attendance():
    """Check for employees who haven't clocked in by 10 AM"""
    try:
        current_time = get_current_timestamp_ist()
        # Use YYYY-MM-DD format to match Clock collection date format
        current_date = current_time.strftime("%Y-%m-%d")
        
        # Only check after 10 AM on weekdays
        if current_time.hour < 10 or current_time.weekday() >= 5:  # 0=Monday, 6=Sunday
            return {"message": "Not time for attendance check or weekend"}
        
        # Get all active users
        all_users = list(Users.find({"status": {"$ne": "inactive"}}))
        notifications_sent = 0
        
        for user in all_users:
            try:
                userid = str(user["_id"])
                user_name = user.get("name", "Employee")
                
                # Check if user has clocked in today
                # Clock collection stores date as "YYYY-MM-DD" format
                attendance_today = Clock.find_one({
                    "userid": userid,
                    "date": current_date,
                    "clockin": {"$exists": True, "$ne": ""}
                })
                
                # Only send notification if user hasn't clocked in
                if not attendance_today:
                    # Send missed clock-in notification
                    await create_notification_with_websocket(
                        userid=userid,
                        title="Missed Clock-In Reminder",
                        message=f"Hi {user_name}, you haven't clocked in today. Please clock in as soon as possible.",
                        notification_type="attendance",
                        priority="medium",
                        action_url="/User/Clockin_int",
                        metadata={
                            "date": current_date,
                            "type": "missed_clock_in"
                        }
                    )
                    notifications_sent += 1
                    
            except Exception as e:
                continue
        
        return {"notifications_sent": notifications_sent}
        
    except Exception as e:
        return {"error": str(e)}

async def check_missed_clock_out():
    """Check for users who clocked in but forgot to clock out"""
    try:
        from datetime import datetime, time
        import pytz
        
        current_time = datetime.now(pytz.timezone("Asia/Kolkata"))
        current_date = current_time.strftime("%Y-%m-%d")
        notifications_sent = 0
        
        # Only check after office hours (after 7 PM)
        office_end_time = time(19, 0)  # 7:00 PM
        if current_time.time() < office_end_time:
            return {"message": "Too early for clock-out reminders"}
        
        # Find all users who clocked in today but haven't clocked out
        users_without_clockout = list(Clock.find({
            "date": current_date,
            "clockin": {"$exists": True, "$ne": ""},
            "clockout": {"$exists": False}
        }))
        
        for record in users_without_clockout:
            try:
                userid = record.get("userid")
                user_name = record.get("name", "User")
                clockin_time = record.get("clockin", "")
                
                if not userid:
                    continue
                
                # Send missed clock-out notification
                await create_notification_with_websocket(
                    userid=userid,
                    title="Missed Clock-Out Reminder",
                    message=f"Hi {user_name}, you clocked in at {clockin_time} but haven't clocked out yet. Please remember to clock out.",
                    notification_type="attendance",
                    priority="medium",
                    action_url="/User/Clockin_int",
                    metadata={
                        "date": current_date,
                        "type": "missed_clock_out",
                        "clockin_time": clockin_time
                    }
                )
                notifications_sent += 1
                
            except Exception as e:
                continue
        
        return {"notifications_sent": notifications_sent}
        
    except Exception as e:
        return {"error": str(e)}

async def check_pending_approvals():
    """Check for pending leave/WFH approvals that need attention"""
    try:
        current_time = get_current_timestamp_ist()
        notifications_sent = 0
        
        # Check pending leave requests
        pending_leaves = list(Leave.find({
            "status": {"$in": ["Pending", "pending", "Recommended"]}
        }))
        
        for leave in pending_leaves:
            try:
                leave_id = str(leave["_id"])
                userid = leave.get("userid")
                employee_name = leave.get("name", "Employee")
                leave_type = leave.get("leave_type", "Leave")
                from_date = leave.get("from_date")
                to_date = leave.get("to_date")
                status = leave.get("status", "Pending")
                
                # Get admin/HR users to notify
                admin_users = list(admin.find({}, {"_id": 1}))
                hr_users = list(Users.find({
                    "$or": [
                        {"position": {"$regex": "HR", "$options": "i"}},
                        {"department": {"$regex": "HR", "$options": "i"}}
                    ]
                }, {"_id": 1}))
                
                approval_users = admin_users + hr_users
                
                for approver in approval_users:
                    approver_id = str(approver["_id"])
                    
                    await create_notification_with_websocket(
                        userid=approver_id,
                        title=f"Pending Leave Approval: {employee_name}",
                        message=f"{employee_name} has requested {leave_type} from {from_date} to {to_date}. Status: {status}",
                        notification_type="leave_approval_required",
                        priority="medium",
                        action_url="/admin/leaveapproval",
                        related_id=leave_id,
                        metadata={
                            "leave_id": leave_id,
                            "employee_id": userid,
                            "employee_name": employee_name,
                            "leave_type": leave_type,
                            "from_date": from_date,
                            "to_date": to_date
                        }
                    )
                    notifications_sent += 1
                    
            except Exception as e:
                continue
        
        # Check pending WFH requests
        pending_wfh = list(RemoteWork.find({
            "status": {"$in": ["Pending", "pending", "Recommended"]}
        }))
        
        for wfh in pending_wfh:
            try:
                wfh_id = str(wfh["_id"])
                userid = wfh.get("userid")
                employee_name = wfh.get("name", "Employee")
                from_date = wfh.get("from_date")
                to_date = wfh.get("to_date")
                status = wfh.get("status", "Pending")
                
                # Get admin/HR users to notify
                admin_users = list(admin.find({}, {"_id": 1}))
                hr_users = list(Users.find({
                    "$or": [
                        {"position": {"$regex": "HR", "$options": "i"}},
                        {"department": {"$regex": "HR", "$options": "i"}}
                    ]
                }, {"_id": 1}))
                
                approval_users = admin_users + hr_users
                
                for approver in approval_users:
                    approver_id = str(approver["_id"])
                    
                    await create_notification_with_websocket(
                        userid=approver_id,
                        title=f"Pending WFH Approval: {employee_name}",
                        message=f"{employee_name} has requested Work From Home from {from_date} to {to_date}. Status: {status}",
                        notification_type="wfh_approval_required",
                        priority="medium",
                        action_url="/admin/LeaveManage/wfh",
                        related_id=wfh_id,
                        metadata={
                            "wfh_id": wfh_id,
                            "employee_id": userid,
                            "employee_name": employee_name,
                            "from_date": from_date,
                            "to_date": to_date
                        }
                    )
                    notifications_sent += 1
                    
            except Exception as e:
                continue
        
        return {"notifications_sent": notifications_sent}
        
    except Exception as e:
        return {"error": str(e)}

# Main automation runner
async def run_all_automated_checks():
    """Run all automated notification checks"""
    try:
        results = {}
        
        # Run all checks concurrently
        overdue_result = await check_and_notify_overdue_tasks()
        # upcoming_result = await check_upcoming_deadlines()  # Removed undefined function
        attendance_result = await check_missed_attendance()
        clockout_result = await check_missed_clock_out()
        approval_result = await check_pending_approvals()
        
        results["overdue_tasks"] = overdue_result
        # results["upcoming_deadlines"] = upcoming_result  # Removed undefined function
        results["missed_attendance"] = attendance_result
        results["missed_clock_out"] = clockout_result
        results["pending_approvals"] = approval_result
        
        total_notifications = (
            overdue_result.get("notifications_sent", 0) +
            # upcoming_result.get("notifications_sent", 0) +  # Removed undefined function
            attendance_result.get("notifications_sent", 0) +
            clockout_result.get("notifications_sent", 0) +
            approval_result.get("notifications_sent", 0)
        )
        
        return results
        
    except Exception as e:
        return {"error": str(e)}

# WFH-specific notification triggers to match leave flow
async def notify_wfh_submitted_to_manager(employee_name, employee_id, request_date_from, request_date_to, manager_id, wfh_id=None):
    """Notify manager when employee submits WFH request - matches leave submission flow"""
    try:
        date_range = f"from {request_date_from} to {request_date_to}" if request_date_from != request_date_to else f"for {request_date_from}"
        
        return await create_notification_with_websocket(
            userid=manager_id,
            title=f"New WFH Request: {employee_name}",
            message=f"{employee_name} has submitted a work from home request {date_range}. Please review and approve.",
            notification_type="wfh_manager_approval",
            priority="high",
            action_url="/User/LeaveManage",
            related_id=wfh_id,
            metadata={
                "action": "manager_approval_needed",
                "employee_name": employee_name,
                "employee_id": employee_id,
                "request_date_from": request_date_from,
                "request_date_to": request_date_to,
                "wfh_id": wfh_id
            }
        )
    except Exception as e:
        return False

async def notify_wfh_recommended_to_hr(employee_name, employee_id, request_date_from, request_date_to, recommended_by, wfh_id=None):
    """Notify HR when manager recommends WFH request - matches leave recommendation flow"""
    try:
        # Get HR users
        hr_users = list(Users.find({
            "$or": [
                {"position": {"$regex": "HR", "$options": "i"}},
                {"department": {"$regex": "HR", "$options": "i"}}
            ]
        }, {"_id": 1}))
        
        date_range = f"from {request_date_from} to {request_date_to}" if request_date_from != request_date_to else f"for {request_date_from}"
        
        notifications_sent = 0
        for hr_user in hr_users:
            hr_id = str(hr_user["_id"])
            await create_notification_with_websocket(
                userid=hr_id,
                title=f"WFH Request Recommended: {employee_name}",
                message=f"{employee_name}'s work from home request {date_range} has been recommended by {recommended_by} for HR approval.",
                notification_type="wfh_hr_approval",
                priority="high",
                action_url="/User/LeaveManage",
                related_id=wfh_id,
                metadata={
                    "action": "hr_approval_needed",
                    "employee_name": employee_name,
                    "employee_id": employee_id,
                    "request_date_from": request_date_from,
                    "request_date_to": request_date_to,
                    "recommended_by": recommended_by,
                    "wfh_id": wfh_id
                }
            )
            notifications_sent += 1
        
        return notifications_sent > 0
    except Exception as e:
        return False

async def notify_wfh_approved_to_employee(userid, employee_name, request_date_from, request_date_to, approved_by, wfh_id=None):
    """Notify employee when WFH is approved - matches leave approval flow"""
    try:
        date_range = f"from {request_date_from} to {request_date_to}" if request_date_from != request_date_to else f"for {request_date_from}"
        
        return await create_notification_with_websocket(
            userid=userid,
            title=f"WFH Request Approved",
            message=f"Your work from home request {date_range} has been approved by {approved_by}.",
            notification_type="wfh_approved",
            priority="medium",
            action_url="/employee/wfh-status",
            related_id=wfh_id,
            metadata={
                "action": "wfh_approved",
                "employee_name": employee_name,
                "request_date_from": request_date_from,
                "request_date_to": request_date_to,
                "approved_by": approved_by,
                "wfh_id": wfh_id
            }
        )
    except Exception as e:
        return False

async def notify_wfh_rejected_to_employee(userid, employee_name, request_date_from, request_date_to, rejected_by, reason=None, wfh_id=None):
    """Notify employee when WFH is rejected - matches leave rejection flow"""
    try:
        date_range = f"from {request_date_from} to {request_date_to}" if request_date_from != request_date_to else f"for {request_date_from}"
        reason_text = f" Reason: {reason}" if reason else ""
        
        return await create_notification_with_websocket(
            userid=userid,
            title=f"WFH Request Rejected",
            message=f"Your work from home request {date_range} has been rejected by {rejected_by}.{reason_text}",
            notification_type="wfh_rejected",
            priority="high",
            action_url="/employee/wfh-status",
            related_id=wfh_id,
            metadata={
                "action": "wfh_rejected",
                "employee_name": employee_name,
                "request_date_from": request_date_from,
                "request_date_to": request_date_to,
                "rejected_by": rejected_by,
                "reason": reason,
                "wfh_id": wfh_id
            }
        )
    except Exception as e:
        return False

if __name__ == "__main__":
    # Run the automation checks
    asyncio.run(run_all_automated_checks())
