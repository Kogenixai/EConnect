// Debounce utility for scroll handler
  function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }
import { useState, useEffect, useRef } from "react";
import {
  FiSend,
  FiPlus,
  FiSearch,
  FiSmile,
  FiChevronLeft,
  FiTrash2,
  FiMessageSquare,
  FiEdit2,
  FiCheck,
  FiAlertCircle,
  FiUsers,
  FiMoreVertical,
} from "react-icons/fi";
import { LS, ipadr } from "../Utils/Resuse";
import { toast } from "react-toastify";
import Picker from "emoji-picker-react";

const MESSAGES_PAGE_SIZE = 20;

const formatTime = (isoString, withDate = false) => {
  if (!isoString) return "";
  let date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  return withDate
    ? date.toLocaleString([], { dateStyle: "short", timeStyle: "short" })
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function Chat() {
    const [memberSearch, setMemberSearch] = useState('');
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const chatContainerRef = useRef(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState({});
  const [activeChat, setActiveChat] = useState({ id: "", name: "", chatId: "", type: "user" });
  const [contacts, setContacts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadInput, setThreadInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showThreadEmojiPicker, setShowThreadEmojiPicker] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [showGroupMembers, setShowGroupMembers] = useState(false);
  const [currentGroupMembers, setCurrentGroupMembers] = useState([]);
  const [currentGroupName, setCurrentGroupName] = useState("");
  const [messageStatus, setMessageStatus] = useState({});
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const ws = useRef(null);
  const typingTimers = useRef({});
  const [typingUsers, setTypingUsers] = useState({});
 
  // New state for delete functionality
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [activeMessageMenu, setActiveMessageMenu] = useState(null);

  useEffect(() => {
    return () => {
      Object.values(typingTimers.current || {}).forEach((t) => clearTimeout(t));
      typingTimers.current = {};
    };
  }, []);

  const isTL = LS.get("position");
  const isDepart = LS.get("department");
  const userid = LS.get("userid");
  const [unread, setUnread] = useState(() => {
    try {
      const stored = localStorage.getItem('unreadCounts');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [lastMessageTime, setLastMessageTime] = useState({});
 
  const resetUnread = (chatId) => {
    setUnread((prev) => {
      const updated = { ...prev, [chatId]: 0 };
      localStorage.setItem('unreadCounts', JSON.stringify(updated));
      return updated;
    });
  };
 
  const updateLastMessageTime = (chatId) => {
    setLastMessageTime((prev) => ({
      ...prev,
      [chatId]: Date.now(),
    }));
  };
 
  const username = LS.get("username");
  const isAdmin = LS.get("isadmin");

  const buildChatId = (a, b) => [a, b].sort().join("_");

  const sortedGroups = [...groups].sort((a, b) => {
    const timeA = lastMessageTime[a._id] || 0;
    const timeB = lastMessageTime[b._id] || 0;
    return timeB - timeA;
  });

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((msg) => {
      const dateObj = new Date(msg.timestamp);
      const dateKey = dateObj.toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(msg);
    });
    return groups;
  };

  // Handle message deletion
  const handleDeleteMessage = async (message, deleteType) => {
    try {
      const isGroup = activeChat.type === "group";
      const response = await fetch(`${ipadr}/delete_message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message_id: message.id,
          delete_type: deleteType,
          user_id: userid,
          chat_id: activeChat.chatId,
          is_group: isGroup,
        }),
      });

      if (response.ok) {
        toast.success(
          deleteType === "for_everyone"
            ? "Message deleted for everyone"
            : "Message deleted for you"
        );
       
        setMessages((prev) => {
          const chatData = prev[activeChat.chatId];
          if (!chatData) return prev;
         
          return {
            ...prev,
            [activeChat.chatId]: {
              ...chatData,
              messages: chatData.messages.filter((m) => m.id !== message.id),
            },
          };
        });
      } else {
        const error = await response.json();
        toast.error(error.detail || "Failed to delete message");
      }
    } catch (err) {
      console.error("Error deleting message:", err);
      toast.error("Failed to delete message");
    }
   
    setShowDeleteModal(false);
    setMessageToDelete(null);
    setActiveMessageMenu(null);
  };

  // Handle thread message deletion
  const handleDeleteThreadMessage = async (message, deleteType) => {
    try {
      const isGroup = activeChat.type === "group";
      const response = await fetch(`${ipadr}/delete_thread_message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message_id: message.id,
          delete_type: deleteType,
          user_id: userid,
          chat_id: activeChat.chatId,
          is_group: isGroup,
        }),
      });

      if (response.ok) {
        toast.success(
          deleteType === "for_everyone"
            ? "Reply deleted for everyone"
            : "Reply deleted for you"
        );
       
        const threadKey = `thread:${selectedThread.id}`;
        setMessages((prev) => {
          const threadMessages = prev[threadKey] || [];
          return {
            ...prev,
            [threadKey]: threadMessages.filter((m) => m.id !== message.id),
          };
        });
      } else {
        const error = await response.json();
        toast.error(error.detail || "Failed to delete reply");
      }
    } catch (err) {
      console.error("Error deleting thread message:", err);
      toast.error("Failed to delete reply");
    }
   
    setShowDeleteModal(false);
    setMessageToDelete(null);
    setActiveMessageMenu(null);
  };

  // Open delete confirmation modal
  const openDeleteModal = (message, isThread = false) => {
    setMessageToDelete({ ...message, isThread });
    setShowDeleteModal(true);
    setActiveMessageMenu(null);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeMessageMenu && !e.target.closest('.message-menu-container')) {
        setActiveMessageMenu(null);
      }
    };
   
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMessageMenu]);

  // Fetch contacts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${ipadr}/get_all_users`);
        const data = await res.json();
        const filtered = data.filter((user) => {
          if (user.id === userid) return true;
          if (isTL?.toLowerCase() === "TL") return true;
          if (isDepart?.toLowerCase() === "HR") return true;
          if (isAdmin) return true;
          return user.department?.toLowerCase() !== "HR";
        });
        setContacts(filtered);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, [userid, isTL, isDepart, isAdmin]);

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch(`${ipadr}/get_user_groups/${userid}`);
        const data = await res.json();
        setGroups(data);
      } catch (err) {
        console.error("Failed to fetch groups:", err);
      }
    };
    fetchGroups();
  }, [userid]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (activeChat.chatId) {
      resetUnread(activeChat.chatId);
    }
  }, [messages, activeChat]);

  // Infinite scroll
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container || !activeChat.chatId) return;
    let lastFetchTime = 0;
    const SCROLL_DEBOUNCE = 200;
    const NEAR_TOP = 60;
    const handleScroll = debounce(() => {
      if (
        container.scrollTop <= NEAR_TOP &&
        messages[activeChat.chatId]?.hasMore &&
        !messages[activeChat.chatId]?.loading
      ) {
        const now = Date.now();
        if (now - lastFetchTime > SCROLL_DEBOUNCE) {
          fetchOlderMessages(activeChat.chatId, true);
          lastFetchTime = now;
        }
      }
      const atBottom = Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 2;
      if (atBottom) {
        resetUnread(activeChat.chatId);
        setShowScrollToBottom(false);
      } else {
        setShowScrollToBottom(true);
      }
    }, SCROLL_DEBOUNCE);
    container.addEventListener('scroll', handleScroll);
    setTimeout(() => {
      if (container) {
        const atBottom = Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 2;
        setShowScrollToBottom(!atBottom);
      }
    }, 100);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeChat.chatId, messages]);

  // Fetch older messages
  const fetchOlderMessages = async (chatId, autoScroll = false) => {
    if (messages[chatId]?.loading) return;
    setMessages((prev) => ({
      ...prev,
      [chatId]: {
        ...prev[chatId],
        loading: true,
      },
    }));
    try {
      const oldestId = messages[chatId]?.oldestId;
      const url = activeChat.type === 'group'
        ? `${ipadr}/group_history/${activeChat.id}?limit=${MESSAGES_PAGE_SIZE}&user_id=${userid}${oldestId ? `&before=${oldestId}` : ''}`
        : `${ipadr}/history/${chatId}?limit=${MESSAGES_PAGE_SIZE}&user_id=${userid}${oldestId ? `&before=${oldestId}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const older = await res.json();
       
        const statusMap = {};
        older.forEach(msg => {
          if (msg.id && msg.status) {
            statusMap[msg.id] = {
              status: msg.status,
              time: msg.status_updated_at || msg.timestamp
            };
          }
        });
        setMessageStatus(prev => ({ ...prev, ...statusMap }));
       
        setMessages((prev) => {
          const prevMsgs = prev[chatId]?.messages || [];
          const newMsgs = [...older, ...prevMsgs];
          return {
            ...prev,
            [chatId]: {
              ...prev[chatId],
              messages: newMsgs,
              hasMore: older.length === MESSAGES_PAGE_SIZE,
              loading: false,
              oldestId: older.length > 0 ? older[0].id : prev[chatId]?.oldestId,
            },
          };
        });
        if (autoScroll && chatEndRef.current) {
          setTimeout(() => {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      } else {
        setMessages((prev) => ({
          ...prev,
          [chatId]: {
            ...prev[chatId],
            loading: false,
            hasMore: false,
          },
        }));
      }
    } catch {
      setMessages((prev) => ({
        ...prev,
        [chatId]: {
          ...prev[chatId],
          loading: false,
        },
      }));
    }
  };

  // WebSocket connection
  const openWebSocket = (chatType = "user", chatId = "", groupId = "") => {
    ws.current?.close();

    const wsProtocol = ipadr.startsWith("https") ? "wss" : "ws";
    const host = ipadr.replace(/^https?:\/\//, "");
    const url =
      chatType === "group"
        ? `${wsProtocol}://${host}/ws/group/${groupId}`
        : `${wsProtocol}://${host}/ws/${userid}`;

    ws.current = new WebSocket(url);

    ws.current.onopen = () => setIsConnected(true);
    ws.current.onclose = () => setIsConnected(false);
    ws.current.onerror = (err) => {
      console.error("WS error", err);
      setIsConnected(false);
    };

    ws.current.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
       
        // Handle message deletion events
        if (payload.type === "message_deleted") {
          const { messageId, deleteType, chatId } = payload;
         
          setMessages((prev) => {
            const chatData = prev[chatId];
            if (!chatData) return prev;
           
            return {
              ...prev,
              [chatId]: {
                ...chatData,
                messages: chatData.messages.filter((m) => m.id !== messageId),
              },
            };
          });
          return;
        }

        // Handle thread deletion events
        if (payload.type === "thread_deleted") {
          const { messageId, rootId } = payload;
          const threadKey = `thread:${rootId}`;
         
          setMessages((prev) => {
            const threadMessages = prev[threadKey] || [];
            return {
              ...prev,
              [threadKey]: threadMessages.filter((m) => m.id !== messageId),
            };
          });
          return;
        }
       
        if (payload.type === "presence_list") {
          try {
            const list = Array.isArray(payload.users) ? payload.users : [];
            setOnlineUsers(list);
          } catch (e) {
            console.error("Failed processing presence_list payload", e);
          }
          return;
        }

        if (payload.type === "presence") {
          try {
            const u = payload.user;
            if (!u) return;
            if (payload.status === "online") {
              setOnlineUsers((prev) => Array.from(new Set([...(prev || []), u])));
            } else if (payload.status === "offline") {
              setOnlineUsers((prev) => (prev || []).filter((x) => x !== u));
            }
          } catch (e) {
            console.error("Failed processing presence payload", e);
          }
          return;
        }

        if (payload.type === "typing") {
          try {
            if (payload.from_user === userid) return;
            const cId = payload.chatId;
            if (!cId) return;
            if (payload.isTyping) {
              setTypingUsers((prev) => ({ ...prev, [cId]: payload.from_user }));
              if (typingTimers.current[cId]) clearTimeout(typingTimers.current[cId]);
              typingTimers.current[cId] = setTimeout(() => {
                setTypingUsers((prev) => {
                  const copy = { ...prev };
                  delete copy[cId];
                  return copy;
                });
                delete typingTimers.current[cId];
              }, 3500);
            } else {
              setTypingUsers((prev) => {
                const copy = { ...prev };
                delete copy[cId];
                return copy;
              });
              if (typingTimers.current[cId]) {
                clearTimeout(typingTimers.current[cId]);
                delete typingTimers.current[cId];
              }
            }
          } catch (e) {
            console.error("Failed processing typing payload", e);
          }
          return;
        }
       
        if (activeChat.chatId === chatId) {
          resetUnread(chatId);
        }
       
        if (payload.type === "message_status") {
          const { messageId, status, timestamp } = payload;
          setMessageStatus((prev) => ({
            ...prev,
            [messageId]: { status, time: timestamp || new Date().toISOString() }
          }));
          return;
        }

        if (payload.tempId && payload.id) {
          setMessageStatus((prev) => ({
            ...prev,
            [payload.tempId]: { status: 'delivered', time: payload.timestamp }
          }));
        }

        if (payload.type === "thread" || payload.isThread === true || payload.rootId) {
          if (!payload.text || !payload.text.trim()) {
            return;
          }
         
          const threadKey = `thread:${payload.rootId}`;
          setMessages((prev) => {
            const arr = prev[threadKey] || [];
            const idx = arr.findIndex((m) => m.tempId === payload.tempId || m.id === payload.id);
            if (idx > -1) {
              arr[idx] = payload;
              return { ...prev, [threadKey]: [...arr] };
            }
           
            const updatedMessages = { ...prev };
            const rootId = payload.rootId;
           
            Object.keys(updatedMessages).forEach((chatKey) => {
              if (!chatKey.startsWith('thread:')) {
                const chatData = updatedMessages[chatKey];
                if (chatData && chatData.messages) {
                  updatedMessages[chatKey] = {
                    ...chatData,
                    messages: chatData.messages.map((msg) => {
                      if (msg.id === rootId || msg.tempId === rootId) {
                        return { ...msg, reply_count: (msg.reply_count || 0) + 1 };
                      }
                      return msg;
                    }),
                  };
                }
              }
            });
           
            updatedMessages[threadKey] = [...arr, payload];
            return updatedMessages;
          });
          return;
        }

        let msgChatId =
          payload.chatId ||
          (payload.type === "user"
            ? buildChatId(payload.from_user || payload.from, payload.to_user || payload.to)
            : payload.chatId);

        const isGroupMessage = payload.chatId && payload.chatId.toString().match(/^[a-f0-9]{24}$|^group_/);
        const unreadTrackingKey = isGroupMessage && !msgChatId.startsWith('group_')
          ? `group_${msgChatId}`
          : msgChatId;

        if (payload.reply_count === undefined) {
          payload.reply_count = 0;
        }

        if (!payload.text || !payload.text.trim()) {
          return;
        }

        setMessages((prev) => {
          const chatData = prev[msgChatId];
          const chatMessages = chatData?.messages || [];
          const filtered = chatMessages.filter((m) => m.id !== payload.id && m.id !== payload.tempId);
          return {
            ...prev,
            [msgChatId]: {
              messages: [...filtered, payload],
              hasMore: chatData?.hasMore || false,
              loading: chatData?.loading || false,
              oldestId: chatData?.oldestId || null,
            },
          };
        });
       
        if (payload.tempId && payload.id && payload.tempId !== payload.id) {
          setMessageStatus((prev) => {
            const tempStatus = prev[payload.tempId];
            if (tempStatus) {
              const newStatus = payload.status || tempStatus.status || 'delivered';
              return {
                ...prev,
                [payload.id]: { status: newStatus, time: payload.status_updated_at || payload.timestamp || tempStatus.time },
                [payload.tempId]: undefined,
              };
            }
            return {
              ...prev,
              [payload.id]: {
                status: payload.status || 'delivered',
                time: payload.status_updated_at || payload.timestamp
              },
            };
          });
        } else if (payload.id && payload.status) {
          setMessageStatus((prev) => ({
            ...prev,
            [payload.id]: {
              status: payload.status,
              time: payload.status_updated_at || payload.timestamp
            },
          }));
        }

        const lastMessageKey = unreadTrackingKey.replace('group_', '');
        updateLastMessageTime(lastMessageKey);

        if (msgChatId !== activeChat.chatId) {
          setUnread((prev) => {
            const updated = { ...prev, [unreadTrackingKey]: (prev[unreadTrackingKey] || 0) + 1 };
            localStorage.setItem('unreadCounts', JSON.stringify(updated));
            return updated;
          });
        } else {
          setUnread((prev) => {
            const updated = { ...prev, [unreadTrackingKey]: 0 };
            localStorage.setItem('unreadCounts', JSON.stringify(updated));
            return updated;
          });
        }

      } catch (err) {
        console.error("Invalid WS payload:", event.data, err);
      }
    };
  };

  // Fetch thread messages
  useEffect(() => {
    if (!selectedThread) return;

    fetch(`${ipadr}/thread/${selectedThread.id}?user_id=${userid}`)
      .then((res) => res.json())
      .then((data) =>
        setMessages((prev) => ({ ...prev, [`thread:${selectedThread.id}`]: data }))
      )
      .catch((err) => console.error("Failed to fetch thread:", err));
  }, [selectedThread, userid]);

  useEffect(() => {
    if (selectedThread && selectedThread.chatId !== activeChat.chatId) {
      setSelectedThread(null);
    }
  }, [activeChat.chatId, selectedThread]);

  // Contact click
  const handleContactClick = async (contact) => {
    try {
      const res = await fetch(`${ipadr}/get_EmployeeId/${encodeURIComponent(contact.name)}`);
      const data = await res.json();
      const employeeId = data.Employee_ID || data.employee_id || data.EmployeeId;

      if (!employeeId) {
        toast.error(`Failed to get employee ID for ${contact.name}`);
        return;
      }

      const chatId = buildChatId(userid, employeeId);
      setActiveChat({ id: employeeId, name: contact.name, chatId, type: "user" });
      setUnread((prev) => ({ ...prev, [chatId]: 0 }));
      openWebSocket("user");

      const historyRes = await fetch(`${ipadr}/history/${chatId}?limit=${MESSAGES_PAGE_SIZE}&user_id=${userid}`);
      if (historyRes.ok) {
        const history = await historyRes.json();
        setMessages((prev) => ({
          ...prev,
          [chatId]: {
            messages: history,
            hasMore: history.length === MESSAGES_PAGE_SIZE,
            loading: false,
            oldestId: history.length > 0 ? history[0].id : null,
          },
        }));
       
        const statusMap = {};
        history.forEach(msg => {
          if (msg.id && msg.status) {
            statusMap[msg.id] = {
              status: msg.status,
              time: msg.status_updated_at || msg.timestamp
            };
          }
        });
        setMessageStatus(prev => ({ ...prev, ...statusMap }));
       
        setTimeout(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            const unreadMessages = history.filter(msg =>
              msg.from_user === employeeId &&
              msg.id &&
              (!msg.status || msg.status !== 'read')
            );
            unreadMessages.forEach(msg => {
              ws.current.send(JSON.stringify({
                type: "message_status",
                messageId: msg.id,
                status: "read",
                to_user: msg.from_user,
                from_user: userid,
                chatId: chatId,
                timestamp: new Date().toISOString()
              }));
            });
          }
        }, 500);
      }
    } catch (err) {
      console.error("Failed to open chat:", err);
      toast.error("Failed to open chat with this contact.");
    }
  };

  // Group click
  const handleGroupClick = async (group) => {
    const groupChatId = `group_${group._id}`;
    setActiveChat({
      id: group._id,
      name: group.name,
      chatId: groupChatId,
      type: "group"
    });
    resetUnread(groupChatId);
    openWebSocket("group", groupChatId, group._id);
   
    try {
      const res = await fetch(`${ipadr}/group_history/${group._id}?limit=${MESSAGES_PAGE_SIZE}&user_id=${userid}`);
      if (res.ok) {
        const history = await res.json();
        setMessages((prev) => ({
          ...prev,
          [`group_${group._id}`]: {
            messages: history,
            hasMore: history.length === MESSAGES_PAGE_SIZE,
            loading: false,
            oldestId: history.length > 0 ? history[0].id : null,
          },
        }));
       
        const statusMap = {};
        history.forEach(msg => {
          if (msg.id && msg.status) {
            statusMap[msg.id] = {
              status: msg.status,
              time: msg.status_updated_at || msg.timestamp
            };
          }
        });
        setMessageStatus(prev => ({ ...prev, ...statusMap }));
       
        setTimeout(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            const unreadMessages = history.filter(msg =>
              msg.from_user !== userid &&
              msg.id &&
              (!msg.status || msg.status !== 'read')
            );
            unreadMessages.forEach(msg => {
              ws.current.send(JSON.stringify({
                type: "message_status",
                messageId: msg.id,
                status: "read",
                to_user: msg.from_user,
                from_user: userid,
                chatId: groupChatId,
                timestamp: new Date().toISOString()
              }));
            });
          }
        }, 500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveGroup = async (group) => {
    try {
      const res = await fetch(`${ipadr}/delete_group/${group._id}`, { method: "DELETE" });
      if (res.ok) {
        setGroups((prev) => prev.filter((g) => g._id !== group._id));
        toast.success("Group deleted successfully");
      } else {
        toast.error("Failed to delete group");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting group");
    }
    setShowDeleteGroupModal(false);
    setGroupToDelete(null);
  };

  // Send main message
  const sendMessage = async () => {
    const draft = newMessage[activeChat.chatId] || "";
    const trimmedMessage = draft.trim();
    if (!trimmedMessage) return;

    const attemptSend = async () => {
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
        setTimeout(attemptSend, 100);
        return;
      }

      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const messageData = {
        id: tempId,
        tempId,
        type: "message",
        from_user: userid,
        to_user: activeChat.type === "user" ? activeChat.id : undefined,
        text: trimmedMessage,
        timestamp: new Date().toISOString(),
        chatId: activeChat.chatId,
        reply_count: 0,
      };

      setMessages((prev) => {
        const chatData = prev[activeChat.chatId];
        const chatMessages = chatData?.messages || [];
        return {
          ...prev,
          [activeChat.chatId]: {
            messages: [...chatMessages, messageData],
            hasMore: chatData?.hasMore || false,
            loading: chatData?.loading || false,
            oldestId: chatData?.oldestId || null,
          },
        };
      });

      updateLastMessageTime(activeChat.chatId);
      setMessageStatus((prev) => ({ ...prev, [tempId]: { status: 'sent', time: new Date().toISOString() } }));

      ws.current.send(JSON.stringify(messageData));
      setNewMessage((prev) => ({ ...prev, [activeChat.chatId]: "" }));
    };

    attemptSend();
  };

  // Send thread message
  const sendThreadMessage = async () => {
    if (!selectedThread || !threadInput.trim()) return;

    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      toast.error("Socket not connected");
      return;
    }

    const tempId = `temp-${Date.now()}`;

    const payload = {
      type: "thread",
      id: tempId,
      tempId,
      from_user: userid,
      to_user:
      activeChat.type === "group"
        ? undefined
        : selectedThread.from_user === userid
        ? selectedThread.to_user
        : selectedThread.from_user,
      text: threadInput.trim(),
      rootId: selectedThread.id,
      chatId: activeChat.chatId,
      isThread: true,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => {
      const key = `thread:${payload.rootId}`;
      const arr = prev[key] || [];
      return { ...prev, [key]: [...arr, payload] };
    });

    ws.current.send(JSON.stringify(payload));
    setThreadInput("");
  };

  // Typing helpers
  const sendTypingStatus = (chatId, isTyping) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    const payload = {
      type: "typing",
      from_user: userid,
      chatId,
      isTyping,
      timestamp: new Date().toISOString(),
    };
    if (activeChat.type === "user" && activeChat.chatId === chatId) {
      payload.to_user = activeChat.id;
    }
    try {
      ws.current.send(JSON.stringify(payload));
    } catch (e) {
      // ignore send errors
    }
  };

  const scheduleTyping = (chatId) => {
    if (typingTimers.current[chatId]) {
      clearTimeout(typingTimers.current[chatId]);
    } else {
      sendTypingStatus(chatId, true);
    }
    typingTimers.current[chatId] = setTimeout(() => {
      sendTypingStatus(chatId, false);
      delete typingTimers.current[chatId];
    }, 2000);
  };

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0] || "")
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const activeMessages = Array.isArray(messages[activeChat.chatId]?.messages)
    ? messages[activeChat.chatId].messages
        .filter((m) => {
          if (m.type === "thread" || m.isThread) return false;
          const hasText = m.text && String(m.text).trim().length > 0;
          const hasFile = m.file || m.fileUrl;
          if (!hasText && !hasFile) return false;
          if (searchTerm && hasText) {
            return m.text.toLowerCase().includes(searchTerm.toLowerCase());
          }
          return true;
        })
    : [];

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedFilteredGroups = [...filteredGroups].sort((a, b) => {
    const timeA = lastMessageTime[a._id] || 0;
    const timeB = lastMessageTime[b._id] || 0;
    return timeB - timeA;
  });

  const sortedFilteredContacts = [...filteredContacts].sort((a, b) => {
    const chatIdA = buildChatId(userid, a.id);
    const chatIdB = buildChatId(userid, b.id);
    const timeA = lastMessageTime[chatIdA] || 0;
    const timeB = lastMessageTime[chatIdB] || 0;
    return timeB - timeA;
  });

  const validGroupUsers = [
    { id: userid, name: username, position: isTL || "User" },
    ...contacts,
  ];

  const getThreadCount = (msgId) => {
    return (messages[`thread:${msgId}`] || []).length;
  };

  const handleViewMembers = (group) => {
    setCurrentGroupMembers(group.members);
    setCurrentGroupName(group.name);
    setShowGroupMembers(true);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
{/* Sidebar */}
<div className="w-80 bg-blue-100 flex flex-col shadow-2xl border-r border-blue-100 overflow-hidden rounded-r-2xl">
  <div className="p-6 bg-blue-300 text-white">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
          <FiMessageSquare className="text-2xl text-gray-700" />
        </div>
        <div>
          <h2 className="font-bold text-xl text-gray-700">Messages</h2>
          <p className="text-xs text-blue-400">Stay connected</p>
        </div>
      </div>
      {(
        isTL?.toLowerCase() === "tl" ||
        isDepart?.toLowerCase() === "hr" ||
        isAdmin
      ) && (
        <button
          type="button"
          aria-label="Create group"
          className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-all backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          onClick={() => setShowGroupModal(true)}
          title="Create Group"
        >
          <FiPlus className="text-xl" />
        </button>
      )}
    </div>

    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/30 focus-within:bg-white/30 focus-within:ring-1 focus-within:ring-blue-200 transition-all">
      <FiSearch className="text-gray-800" />
      <input
        type="text"
        placeholder="Search messages..."
        aria-label="Search messages"
        className="w-full bg-transparent outline-none text-gray-700 placeholder-white/60 text-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  </div>

  <div role="list" aria-label="Chats and contacts" className="flex-1 overflow-y-auto px-4 py-3 space-y-1 custom-scrollbar">
    {sortedFilteredGroups.length > 0 && (
      <>
        <div className="px-2 py-3 flex items-center gap-2 text-xs text-blue-600 uppercase tracking-wider font-bold">
          <FiUsers size={14} />
          <span>Groups</span>
          <span className="ml-auto text-blue-400 bg-blue-100 px-2 py-0.5 rounded-full">{sortedFilteredGroups.length}</span>
        </div>

        {sortedFilteredGroups.map((group) => (
          <div
            key={group._id}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') handleGroupClick(group); }}
            className={`group px-3 py-3 rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
              activeChat.chatId === `group_${group._id}`
                ? "bg-blue-300 text-black shadow-lg scale-[1.02]"
                : "hover:bg-blue-200 hover:shadow-md"
            }`}
            onClick={() => handleGroupClick(group)}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-md flex-shrink-0 ${
                activeChat.chatId === `group_${group._id}`
                  ? "bg-blue-400"
                  : "bg-blue-300"
              }`}>
                {getInitials(group.name)}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className={`truncate font-semibold text-sm ${
                  activeChat.chatId === `group_${group._id}` ? "text-gray-500" : "text-gray-800"
                }`}>
                  {group.name}
                </span>
                <span className={`text-xs truncate flex items-center gap-1 ${
                  activeChat.chatId === `group_${group._id}` ? "text-blue-500" : "text-gray-500"
                }`}>
                  <FiUsers size={10} />
                  {typingUsers[`group_${group._id}`]
                    ? (() => {
                        const tId = typingUsers[`group_${group._id}`];
                        let tUser = contacts.find((c) => String(c.id) === String(tId));
                        if (!tUser && Array.isArray(group.members)) {
                          const member = group.members.find((m) => String(m) === String(tId));
                          if (member) {
                            tUser = contacts.find((c) => String(c.id) === String(member)) || { name: member };
                          }
                        }
                        const name = tUser ? tUser.name : tId;
                        return `${name} is typing...`;
                      })()
                    : `${group.members?.filter((m) => m !== userid).length} members`}
                </span>
              </div>
            </div>

            {unread[`group_${group._id}`] > 0 && (
              <div className="ml-2 flex-shrink-0">
                <span
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-md animate-pulse inline-flex items-center justify-center min-w-[28px]"
                  aria-label={`${unread[`group_${group._id}`]} unread message${unread[`group_${group._id}`] > 1 ? 's' : ''}`}
                  title={`${unread[`group_${group._id}`]} unread message${unread[`group_${group._id}`] > 1 ? 's' : ''}`}
                >
                  {unread[`group_${group._id}`] > 99 ? '99+' : unread[`group_${group._id}`]}
                </span>
              </div>
            )}

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {(
                isTL?.toLowerCase() === "tl" ||
                isDepart?.toLowerCase() === "hr" ||
                isAdmin
              ) && (
                <>
                  <button
                    type="button"
                    aria-label={`Edit group ${group.name}`}
                    className={`p-1.5 rounded-lg transition-all ${
                      activeChat.chatId === `group_${group._id}`
                        ? "hover:bg-white/50"
                        : "hover:bg-blue-100"
                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingGroup(group);
                      setGroupName(group.name);
                      setSelectedUsers(group.members || []);
                      setShowGroupModal(true);
                    }}
                    title="Edit Group"
                  >
                    <FiEdit2 size={14} />
                  </button>

                  <button
                    type="button"
                    aria-label={`Delete group ${group.name}`}
                    className={`p-1.5 rounded-lg transition-all ${
                      activeChat.chatId === `group_${group._id}`
                        ? "hover:bg-white/50"
                        : "hover:bg-red-100"
                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setGroupToDelete(group);
                      setShowDeleteGroupModal(true);
                    }}
                    title="Delete Group"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </>
              )}
              <button
                type="button"
                aria-label={`View members of ${group.name}`}
                className={`p-1.5 rounded-lg transition-all ${
                  activeChat.chatId === `group_${group._id}`
                    ? "hover:bg-white/20"
                    : "hover:bg-blue-100"
                } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewMembers(group);
                }}
                title="View Members"
              >
                <FiUsers size={14} />
              </button>
            </div>
          </div>
        ))}
      </>
    )}

    <div className="px-2 py-3 flex items-center gap-2 text-xs text-blue-600 uppercase tracking-wider font-bold mt-4">
      <FiMessageSquare size={14} />
      <span>Contacts</span>
      <span className="ml-auto text-blue-400 bg-blue-100 px-2 py-0.5 rounded-full">{sortedFilteredContacts.filter((contact) => contact.id !== userid).length}</span>
    </div>

    {sortedFilteredContacts.filter((contact) => contact.id !== userid).map((contact) => {
      const chatId = buildChatId(userid, contact.id);
      const isOnline = onlineUsers.includes(contact.id);
      return (
        <div
          key={contact.id}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') handleContactClick(contact); }}
          className={`group px-3 py-3 rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
            activeChat.chatId === chatId
              ? "bg-blue-400 text-white shadow-lg scale-[1.02]"
              : "hover:bg-blue-200 hover:shadow-md"
          }`}
          onClick={() => handleContactClick(contact)}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
                  activeChat.chatId === chatId
                    ? "bg-white/20"
                    : isOnline
                    ? "bg-gradient-to-br from-green-400 to-emerald-500"
                    : "bg-gradient-to-br from-gray-400 to-gray-500"
                }`}
              >
                {getInitials(contact.name)}
              </div>
              {isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white ring-2 ring-green-200 animate-pulse"></div>
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className={`truncate font-semibold text-sm ${
                activeChat.chatId === chatId ? "text-white" : "text-gray-800"
              }`}>
                {contact.name}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-xs truncate ${
                  activeChat.chatId === chatId ? "text-blue-100" : "text-gray-500"
                }`}>
                  {contact.position || "Employee"}
                </span>
              </div>

              {typingUsers[chatId] === contact.id && (
                <div className="text-xs italic text-blue-900 mt-1">
                  typing...
                </div>
              )}
            </div>
          </div>
          {unread[chatId] > 0 && (
            <div className="ml-2 flex-shrink-0">
              <span
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-md animate-pulse inline-flex items-center justify-center min-w-[28px]"
                aria-label={`${unread[chatId]} unread message${unread[chatId] > 1 ? 's' : ''}`}
                title={`${unread[chatId]} unread message${unread[chatId] > 1 ? 's' : ''}`}
              >
                {unread[chatId] > 99 ? '99+' : unread[chatId]}
              </span>
            </div>
          )}
        </div>
      );
    })}
  </div>
</div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            {activeChat.id ? (
              <>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md">
                  {getInitials(activeChat.name)}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    {activeChat.name}
                  </h1>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground"></div>
            )}
          </div>
        </div>
        {!activeChat.id && (
    <div className="flex-1 flex flex-col items-center justify-center bg-white text-center p-6">
      <FiMessageSquare className="text-7xl text-blue-200 mb-6 animate-pulse" />
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        Welcome to Chat
      </h2>
      <p className="text-gray-500">
        Select a contact or group from the left sidebar to start messaging.
      </p>
    </div>
  )}

<div className="flex flex-1 overflow-hidden">
  <div className="flex-1 flex flex-col">
  <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-white to-gray-50 relative">
    {showScrollToBottom && (
      <button
        className="fixed bottom-20 right-6 z-50 bg-blue-300 text-blue-700 px-2.5 py-1.5 rounded-full shadow-md hover:bg-blue-400 hover:text-white transition-all flex items-center gap-1 animate-in fade-in text-xs font-semibold"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
        onClick={() => {
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
        aria-label="Scroll to bottom"
        title="Go to latest messages"
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
        Latest
      </button>
    )}
    {activeMessages.length > 0 ? (
      <>
        {messages[activeChat.chatId]?.loading && (
          <div className="flex flex-col justify-center items-center py-4 mb-4">
            <div className="animate-spin mb-2">
              <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-500 rounded-full"></div>
            </div>
            <span className="text-sm text-blue-500 font-medium">Loading older messages...</span>
          </div>
        )}
        {messages[activeChat.chatId]?.hasMore && !messages[activeChat.chatId]?.loading && (
          <div className="flex justify-center items-center py-3 mb-4">
            <button
              className="px-6 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full hover:from-blue-100 hover:to-blue-200 transition-all font-medium shadow-sm hover:shadow-md"
              onClick={() => fetchOlderMessages(activeChat.chatId)}
            >
              ↑ Load earlier messages
            </button>
          </div>
        )}
        {Object.entries(groupMessagesByDate(activeMessages)).map(([dateKey, dayMessages]) => {
      const dateObj = new Date(dateKey);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const dateLabel =
        dateObj.toDateString() === today.toDateString()
          ? "Today"
          : dateObj.toDateString() === yesterday.toDateString()
          ? "Yesterday"
          : dateObj.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

      return (
        <div key={dateKey} className="space-y-3">
          <div className="flex justify-center my-4">
            <span className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full shadow-sm">
              {dateLabel}
            </span>
          </div>

          {dayMessages.map((m, i) => {
            const hasText = m.text && String(m.text).trim().length > 0;
            const hasFile = m.file || m.fileUrl;
            if (!hasText && !hasFile) return null;
            const isSender = m.from_user === userid;
            const msgId = m.id || m.tempId;
            const threadCount = m.reply_count !== undefined ? m.reply_count : getThreadCount(msgId);

            let displayName = "Unknown";
            if (isSender) {
              displayName = "You";
            } else {
              const contact = contacts.find((c) => c.id === m.from_user);
              displayName = contact ? contact.name : m.from_user;
            }

            const textHtml = (m.text || "").replace(
              /@(\w+)/g,
              '<span class="text-accent font-semibold">@$1</span>'
            );

            const prev = dayMessages[i - 1];
            const sameSenderAsPrev = prev && prev.from_user === m.from_user;

            const statusObj = messageStatus[msgId];
            const isUnread = !isSender && statusObj?.status !== 'read';
           
            const prevStatus = prev && messageStatus[prev.id || prev.tempId];
            const prevIsSender = prev && prev.from_user === userid;
            const prevIsUnread = prev && !prevIsSender && prevStatus?.status !== 'read';
            const isFirstUnreadInGroup = isUnread && !prevIsUnread;
           
            return (
              <>
                {isFirstUnreadInGroup && (
                  <div className="flex justify-center my-4 unread-divider">
                    <span className="unread-badge bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full shadow-sm font-semibold select-none">
                      📌 Unread Messages
                    </span>
                  </div>
                )}
                <div
                  key={msgId}
                  className={`flex animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                    isSender ? "justify-end" : "justify-start"
                  } ${sameSenderAsPrev ? "mb-1" : "mb-3"}`}
                >
                <div className="relative group max-w-xl message-menu-container">
                  <div
                    role="article"
                    tabIndex={0}
                    aria-label={`Message from ${displayName} at ${formatTime(m.timestamp)}`}
                    className={`p-4 rounded-2xl break-words shadow-md relative transition-all duration-300 hover:shadow-lg ${
                      isSender
                        ? "bg-[#6d9eeb7a] text-primary-foreground rounded-br-sm"
                        : `bg-blue-200 text-gray-800 rounded-bl-sm border border-gray-200`
                    }`}
                  >

                    <div className="flex items-center mb-2">
                      <span className="font-medium text-sm mr-3">{displayName}</span>
                      <span
                        className={`text-xs ${
                          isSender ? "text-primary-foreground/70" : "text-gray-400"
                        }`}
                        style={{ marginLeft: 'auto', letterSpacing: '0.5px' }}
                      >
                        {formatTime(m.timestamp)}
                      </span>
                    </div>

                    <div
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: textHtml }}
                    />

                    <div className="flex items-center gap-3 mt-3 pt-2 border-t border-current/10">
                      <button
                        type="button"
                        aria-label={`Reply to message from ${displayName}`}
                        onClick={() => setSelectedThread({ ...m, chatId: activeChat.chatId })}
                        className={`text-xs font-medium hover:underline transition-all flex items-center gap-1 ${
                          isSender
                            ? "text-primary-foreground/80 hover:text-primary-foreground"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <FiMessageSquare size={12} />
                        Reply
                      </button>

                      {threadCount > 0 && (
                        <div
                          className={`text-xs ml-auto ${
                            isSender ? "text-primary-foreground/70" : "text-gray-400"
                          }`}
                        >
                          {threadCount} {threadCount === 1 ? "reply" : "replies"}
                        </div>
                      )}
                     
                      {isSender && (() => {
                        const statusObj = messageStatus[msgId];
                        const status = statusObj?.status || 'sent';
                        let tooltip = "Sent";
                        let icon = null;
                       
                        if (status === "sent") {
                          tooltip = `Sent${statusObj?.time ? ` at ${formatTime(statusObj.time, true)}` : ""}`;
                          icon = <FiCheck className="text-gray-400" size={14} />;
                        } else if (status === "delivered") {
                          tooltip = `Delivered${statusObj?.time ? ` at ${formatTime(statusObj.time, true)}` : ""}`;
                          icon = (
                            <div className="flex items-center -space-x-1">
                              <FiCheck className="text-gray-400" size={14} />
                              <FiCheck className="text-gray-400" size={14} />
                            </div>
                          );
                        } else if (status === "read") {
                          tooltip = `Read${statusObj?.time ? ` at ${formatTime(statusObj.time, true)}` : ""}`;
                          icon = (
                            <div className="flex items-center -space-x-1">
                              <FiCheck className="text-blue-500" size={14} />
                              <FiCheck className="text-blue-500" size={14} />
                            </div>
                          );
                        } else if (status === "failed") {
                          tooltip = `Failed${statusObj?.time ? ` at ${formatTime(statusObj.time, true)}` : ""}`;
                          icon = <FiAlertCircle className="text-red-500" size={14} />;
                        }
                       
                        return (
                          <span className="ml-auto flex items-center gap-1 text-xs" title={tooltip} style={{ cursor: "pointer" }}>
                            {icon}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Delete menu button */}
                  <button
                    className={`absolute top-2 ${isSender ? 'right-2' : 'right-2'} opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg ${
                      isSender ? 'bg-blue-600/80 hover:bg-blue-700' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    onClick={() => setActiveMessageMenu(activeMessageMenu === msgId ? null : msgId)}
                  >
                    <FiMoreVertical size={16} className={isSender ? 'text-white' : 'text-gray-700'} />
                  </button>

                  {/* Delete dropdown menu */}
                  {activeMessageMenu === msgId && (
                    <div className={`absolute ${isSender ? 'right-0' : 'right-0'} top-12 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[180px]`}>
                      {isSender && (
                        <button
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 border-b border-gray-100"
                          onClick={() => openDeleteModal(m, false)}
                        >
                          <FiTrash2 size={14} />
                          Delete for everyone
                        </button>
                      )}
                      <button
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                        onClick={() => {
                          setMessageToDelete(m);
                          setShowDeleteModal(true);
                          // Mark that this is a 'for_me' delete request
                          m._deleteForMeOnly = true;
                        }}
                      >
                        <FiTrash2 size={14} />
                        Delete for me
                      </button>
                    </div>
                  )}
                </div>
              </div>
              </>
            );
          })}
        </div>
      );
    })}
    <div ref={chatEndRef}></div>
      </>
    ) : messages[activeChat.chatId]?.loading ? (
      <div className="flex flex-col justify-center items-center h-full">
        <div className="animate-spin mb-4">
          <div className="h-12 w-12 border-4 border-blue-200 border-t-blue-500 rounded-full"></div>
        </div>
        <p className="text-blue-600 font-medium">Loading messages...</p>
      </div>
    ) : (
       (activeChat.id ? (
       <div className="flex flex-col justify-center items-center h-full text-center">
        <FiMessageSquare className="text-5xl text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">No messages yet</p>
        <p className="text-gray-400 text-sm">Start the conversation!</p>
      </div>
       ) : null)
    )}
  </div>

            {activeChat.id && (
              <div className="border-t border-border bg-card p-4">
                {typingUsers[activeChat.chatId] && (
                  <div className="mb-2 px-2">
                    <div className="text-sm italic text-blue-400 font-medium">
                      {(() => {
                        const typingUserId = typingUsers[activeChat.chatId];
                        let tUser = contacts.find((c) => String(c.id) === String(typingUserId));

                        if (!tUser && activeChat.type === "group") {
                          const group = groups.find(
                            (g) => String(g._id) === String(activeChat.id) || String(g._id) === String(activeChat.chatId).replace(/^group_/, "")
                          );
                          if (group && Array.isArray(group.members)) {
                            const memberId = group.members.find((m) => String(m) === String(typingUserId));
                            if (memberId) {
                              tUser = contacts.find((c) => String(c.id) === String(memberId)) || { name: memberId };
                            }
                          }
                        }

                        const name = tUser ? tUser.name : typingUserId;
                        return `${name} is typing...`;
                      })()}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 relative">
                  <button
                    type="button"
                    aria-label="Toggle emoji picker"
                    className="p-2 rounded-full hover:bg-muted transition-all text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                  >
                    <FiSmile className="text-xl" />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-16 left-3 z-50 shadow-xl rounded-lg overflow-hidden">
                      <Picker
                        onEmojiClick={(e) => setNewMessage((prev) => ({ ...prev, [activeChat.chatId]: (prev[activeChat.chatId] || "") + e.emoji }))}
                        searchPlaceholder="Search emojis..."
                      />
                    </div>
                  )}
                  <input
                    ref={textareaRef}
                    className="flex-1 px-4 py-2.5 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-muted-foreground text-sm"
                    value={newMessage[activeChat.chatId] || ""}
                    onChange={(e) => {
                      setNewMessage((prev) => ({ ...prev, [activeChat.chatId]: e.target.value }));
                      scheduleTyping(activeChat.chatId);
                    }}
                    placeholder="Type a message..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if ((newMessage[activeChat.chatId] || "").trim() && isConnected) {
                          sendMessage();
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    aria-label="Send message"
                    onClick={sendMessage}
                    disabled={!(newMessage[activeChat.chatId] || "").trim() || !isConnected}
                    className={`p-3 rounded-full transition-all duration-300 ${
                      (newMessage[activeChat.chatId] || "").trim() && isConnected
                        ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:scale-105"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                  >
                    <FiSend className="text-lg" />
                  </button>
                </div>
              </div>
            )}
          </div>

{selectedThread && selectedThread.chatId === activeChat.chatId && (
  <div className="w-96 bg-gradient-to-b from-white to-gray-50 border-l border-gray-200 flex flex-col shadow-lg">
    <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50">
      <button
        className="p-2 rounded-lg hover:bg-gray-100 transition-all"
        onClick={() => setSelectedThread(null)}
      >
        <FiChevronLeft size={20} />
      </button>
      <div className="flex-1">
        <div className="font-semibold text-gray-800">Thread</div>
        <div className="text-xs text-gray-500">
          {selectedThread.from_user} • {formatTime(selectedThread.timestamp, true)}
        </div>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm">
        <div className="text-xs text-blue-400 mb-2">
          {(() => {
            const contact = contacts.find((c) => c.id === selectedThread.from_user);
            return contact ? contact.name : (selectedThread.from_user === userid ? "You" : selectedThread.from_user);
          })()} • {formatTime(selectedThread.timestamp, true)}
        </div>
        <div className="text-sm text-gray-800">{selectedThread.text}</div>
        <div className="text-xs text-blue-400 mt-2 font-medium">Original message</div>
      </div>

      {(messages[`thread:${selectedThread.id}`] || []).map((t) => (
        <div key={t.id || t.tempId} className="relative group message-menu-container">
          <div className="p-3 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="text-xs text-gray-400 mb-2">
              {(() => {
                const contact = contacts.find((c) => c.id === t.from_user);
                return contact ? contact.name : (t.from_user === userid ? "You" : t.from_user);
              })()} • {formatTime(t.timestamp, true)}
            </div>
            <div className="text-sm text-gray-800">{t.text}</div>
          </div>

          {/* Delete menu for thread messages */}
          <button
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-gray-300 hover:bg-gray-400"
            onClick={() => setActiveMessageMenu(activeMessageMenu === (t.id || t.tempId) ? null : (t.id || t.tempId))}
          >
            <FiMoreVertical size={14} className="text-gray-700" />
          </button>

          {activeMessageMenu === (t.id || t.tempId) && (
            <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[180px]">
              {t.from_user === userid && (
                <button
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 border-b border-gray-100"
                  onClick={() => openDeleteModal(t, true)}
                >
                  <FiTrash2 size={14} />
                  Delete for everyone
                </button>
              )}
              <button
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                onClick={() => handleDeleteThreadMessage(t, "for_me")}
              >
                <FiTrash2 size={14} />
                Delete for me
              </button>
            </div>
          )}
        </div>
      ))}
    </div>

    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 relative">
        <button
          type="button"
          aria-label="Toggle thread emoji picker"
          className="p-2 rounded-full hover:bg-gray-100 transition-all text-gray-400 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
          onClick={() => setShowThreadEmojiPicker((prev) => !prev)}
        >
          <FiSmile size={18} />
        </button>
        {showThreadEmojiPicker && (
          <div className="absolute bottom-16 left-0 z-50 shadow-xl rounded-lg overflow-hidden">
            <Picker
              onEmojiClick={(e) => setThreadInput((prev) => prev + e.emoji)}
              searchPlaceholder="Search emojis..."
            />
          </div>
        )}
        <input
          value={threadInput}
          onChange={(e) => setThreadInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (threadInput.trim() && isConnected) {
                sendThreadMessage();
              }
            }
          }}
          placeholder="Reply in thread..."
          className="flex-1 px-3 py-2 rounded-full border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm placeholder-gray-400"
        />
        <button
          type="button"
          aria-label="Send thread message"
          onClick={sendThreadMessage}
          disabled={!threadInput.trim() || !isConnected}
          className={`p-2.5 rounded-full transition-all ${
            threadInput.trim() && isConnected
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <FiSend size={16} />
        </button>
      </div>
    </div>
  </div>
)}

        </div>
      </div>

      {/* Group Modal */}
{showGroupModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex justify-center items-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-3 py-2 flex-shrink-0">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646M12 14H5.373A4.627 4.627 0 003 17.627V20a1 1 0 001 1h16a1 1 0 001-1v-2.373A4.627 4.627 0 0018.627 14H12z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {editingGroup ? "Edit Group" : "Create New Group"}
              </h2>
              <p className="text-[9px] text-blue-100">Organize your team collaboration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="p-6 space-y-6">
          {/* Group Name Input */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-800">
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-blue-600"></span>
                Group Name
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g., Marketing Team, Q4 Project, HR Department"
                className="w-full border border-gray-300 bg-white rounded px-2 py-1 focus:outline-none focus:ring-0 focus:border-blue-600 text-gray-800 placeholder-gray-400 transition-all duration-300 font-medium text-xs"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength={50}
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[9px] text-gray-400">
                {groupName.length}/50
              </span>
            </div>
          </div>

          {/* Members Selection Header */}
          <div className="flex justify-between items-center">
            <label className="block text-sm font-semibold text-gray-800">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Select Team Members
              </span>
            </label>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1.5 rounded-full border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
              <span className="text-xs font-semibold text-blue-700">
                {selectedUsers.length + 1} members
              </span>
            </div>
          </div>

          {/* Members Grid */}
          <div className="space-y-3">
            {/* Search/filter bar */}
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Search employees..."
                className="w-full px-3 py-2 rounded-lg border border-blue-100 bg-blue-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white transition"
                value={memberSearch || ''}
                onChange={e => setMemberSearch(e.target.value)}
              />
              <svg className="w-5 h-5 text-blue-300 -ml-8 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth="2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-3.5-3.5"/></svg>
            </div>
            <div className="border border-blue-100 rounded-xl overflow-hidden bg-gradient-to-r from-blue-50/60 to-white">
              <div className="divide-y divide-blue-50 max-h-64 overflow-y-auto scrollbar-thin">
                {/* Creator (no checkbox, always included) */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50/80 to-white">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center text-white font-bold text-base shadow-sm">
                    {username?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-blue-700">{username} <span className="text-xs text-blue-300 font-normal">(You)</span></p>
                    <p className="text-xs text-blue-300">{isTL || "Employee"}</p>
                  </div>
                  <span className="inline-block text-xs font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">Included</span>
                </div>
                {/* Other employees with checkboxes */}
                {contacts && contacts.length > 0 ? (
                  contacts.filter(user => user.id !== userid && (!memberSearch || user.name.toLowerCase().includes(memberSearch.toLowerCase()))).length > 0 ? (
                    contacts.filter(user => user.id !== userid && (!memberSearch || user.name.toLowerCase().includes(memberSearch.toLowerCase()))).map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center gap-3 cursor-pointer px-4 py-3 hover:bg-blue-100/60 transition-all duration-200 group"
                      >
                        <input
                          type="checkbox"
                          value={user.id}
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            const uid = e.target.value;
                            setSelectedUsers((prev) =>
                              prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
                            );
                          }}
                          className="w-5 h-5 text-blue-400 border-2 border-blue-200 rounded focus:ring-2 focus:ring-blue-200 focus:ring-offset-0 cursor-pointer accent-blue-400"
                        />
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center text-blue-700 font-semibold text-xs">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-900 truncate">{user.name}</p>
                          <p className="text-xs text-blue-300">{user.position || "Employee"}</p>
                        </div>
                        {selectedUsers.includes(user.id) && (
                          <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </label>
                    ))
                  ) : (
                    <div className="text-center py-8 text-blue-200">
                      <svg className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM9 20H4v-2a6 6 0 0112 0v2H9z" />
                      </svg>
                      <p className="text-sm font-medium">No matching team members</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8 text-blue-200">
                    <svg className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM9 20H4v-2a6 6 0 0112 0v2H9z" />
                    </svg>
                    <p className="text-sm font-medium">No team members available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Message */}
          <div className="relative bg-gradient-to-br from-green-50 to-green-50/50 border border-green-200 rounded p-1 flex gap-1 mt-2">
            <svg className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-[10px] font-semibold text-green-900 mb-0.5">Team Setup Complete</p>
              <p className="text-[9px] text-green-800 leading-relaxed">
                You're automatically added to this group. Selected members will be notified and can start collaborating.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Actions */}
      <div className="flex gap-2 p-2 bg-gradient-to-r from-gray-50 to-blue-50 border-t-2 border-gray-200 flex-shrink-0">
        <button
          className="flex-1 px-1.5 py-1.5 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded transition-all duration-200 text-xs"
          onClick={() => {
            setShowGroupModal(false);
            setGroupName("");
            setSelectedUsers([]);
            setEditingGroup(null);
          }}
        >
          Cancel
        </button>
        <button
          className="flex-1 px-1.5 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded transition-all duration-200 text-xs shadow-lg hover:shadow-xl flex items-center justify-center gap-1"
          onClick={async () => {
            const validMembers = Array.from(new Set([...selectedUsers.filter((id) => id), userid]));
            if (!groupName.trim() || validMembers.length === 0) {
              toast.error("Please enter a group name and select at least one member");
              return;
            }

            try {
              if (editingGroup) {
                const res = await fetch(`${ipadr}/update_group/${editingGroup._id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: groupName, members: validMembers }),
                });
                const data = await res.json();
                if (res.ok) {
                  setGroups((prev) =>
                    prev.map((g) => (g._id === editingGroup._id ? { ...g, name: groupName, members: validMembers } : g))
                  );
                  toast.success("Group updated successfully!");
                } else toast.error(data?.detail || "Failed to update group");
              } else {
                const res = await fetch(`${ipadr}/create_group`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: groupName, members: validMembers }),
                });
                const data = await res.json();
                if (res.ok || data.status === "success") {
                  setGroups((prev) => [...prev, { _id: data.group_id, name: groupName, members: validMembers }]);
                  toast.success("Group created successfully!");
                } else toast.error("Failed to create group");
              }

              setShowGroupModal(false);
              setGroupName("");
              setSelectedUsers([]);
              setEditingGroup(null);
            } catch (err) {
              console.error(err);
              toast.error("Error saving group");
            }
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {editingGroup ? "Save Changes" : "Create Group"}
        </button>
      </div>
    </div>
  </div>
)}

{showGroupMembers && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex justify-center items-center z-50 p-4">
    <div className="bg-blue-50 p-8 rounded-3xl w-full max-w-lg shadow-2xl border border-blue-200 animate-bounce-in">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {currentGroupName}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {currentGroupMembers.length} {currentGroupMembers.length === 1 ? 'member' : 'members'} in this group
          </p>
        </div>
        <button
          onClick={() => setShowGroupMembers(false)}
          className="p-2 hover:bg-red-100/50 rounded-full transition-all duration-200 text-gray-600 hover:text-red-600"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Members List */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {currentGroupMembers.length > 0 ? (
          currentGroupMembers.map((memberId) => {
            let user = contacts.find((u) => u.id === memberId) || validGroupUsers.find((u) => u.id === memberId);
            const isCurrentUser = memberId === userid;
            const displayName = user?.name?.trim() ? user.name : (isCurrentUser ? username : "Unknown User");
            const displayInitial = displayName[0]?.toUpperCase() || "?";
            const displayRole = user?.position || (isCurrentUser ? (isTL || isDepart || isAdmin ? (isTL || isDepart || "Admin") : "Employee") : "Employee");
            return (
              <div
                key={memberId}
                className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all duration-200 group"
                style={{ minHeight: 64 }}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow text-lg border-2 border-blue-200 ${
                    isCurrentUser
                      ? 'bg-blue-600'
                      : 'bg-blue-400'
                  }`}>
                    {displayInitial}
                  </div>
                </div>

                {/* Member Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-poppins font-semibold text-base text-gray-800 truncate">
                      {displayName}
                    </span>
                    {isCurrentUser && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-200 text-blue-900 border border-blue-300 ml-1">
                        You
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-blue-700 font-medium tracking-wide">
                    {displayRole}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20h12a6 6 0 00-6-6 6 6 0 00-6 6z" />
            </svg>
            <p className="text-gray-500 font-medium">No members to display</p>
          </div>
        )}
      </div>
    </div>
  </div>
)}

{showDeleteGroupModal && groupToDelete && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs text-center">
      <h2 className="text-lg font-semibold mb-2">Delete Group</h2>
      <p className="mb-4">Are you sure you want to delete <span className="font-bold">{groupToDelete.name}</span>?</p>
      <div className="flex gap-3 justify-center">
        <button
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
          onClick={() => { setShowDeleteGroupModal(false); setGroupToDelete(null); }}
        >Cancel</button>
        <button
          className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium"
          onClick={() => handleRemoveGroup(groupToDelete)}
        >Delete</button>
      </div>
    </div>
  </div>
)}

{/* Delete Confirmation Modal */}
{showDeleteModal && messageToDelete && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-2xl w-96 shadow-2xl border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-red-100 rounded-full">
          <FiTrash2 className="text-red-600 text-xl" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Delete Message</h2>
          <p className="text-sm text-gray-500">This action cannot be undone</p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700 line-clamp-3">
          {messageToDelete.text}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          onClick={() => {
            setShowDeleteModal(false);
            setMessageToDelete(null);
          }}
        >
          Cancel
        </button>
       
        {/* Only show one delete button, label/action based on intended delete type */}
        <button
          className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md font-medium"
          onClick={() => {
            if (messageToDelete._deleteForMeOnly) {
              messageToDelete.isThread
                ? handleDeleteThreadMessage(messageToDelete, "for_me")
                : handleDeleteMessage(messageToDelete, "for_me");
            } else {
              messageToDelete.isThread
                ? handleDeleteThreadMessage(messageToDelete, "for_everyone")
                : handleDeleteMessage(messageToDelete, "for_everyone");
            }
          }}
        >
          {messageToDelete._deleteForMeOnly ? 'Delete for Me' : 'Delete for Everyone'}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}