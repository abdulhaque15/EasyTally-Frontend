import React, { useEffect, useRef, useState } from "react";
import { FaComments, FaTimes } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { MentionsInput, Mention } from "react-mentions";
import uvCapitalApi from "../api/uvCapitalApi";
import { useAuthWrapper } from "../helper/AuthWrapper";
import socket from "../config/socket.config";

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { user, userList } = useAuthWrapper();
  const messagesEndRef = useRef(null);

  console.log('user' , user)

  useEffect(() => {
    if (isOpen) {
      // fetchUsers();
      fetchChatMessages();
    }
  }, [isOpen]);

  const fetchChatMessages = async () => {
    try {
      const res = await uvCapitalApi.getInternalChat(user.id);
      if (res.success) setChatMessages(res.data);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedUserId) {
      alert("Please mention a valid user using @Full Name or @username");
      return;
    }
    const payload = {
      receiver_id: selectedUserId,
      message: message,
    };

    let response = await uvCapitalApi.getNotificationOfChatterMessages(
      "internal chat",
      selectedUserId
    );
    try {
      const res = await uvCapitalApi.createInternalChat(payload);

      if (res.success) {
        setChatMessages((prev) => [...prev, res.data]);
        setMessage("");
        const existingNotification = response?.data[0];

        if (!existingNotification) {
          const notificationPayload = {
            name: "internal chat",
            description: "You have a new Notification",
            user_id: selectedUserId,
            type: "unread",
            status: "active",
            record_id: null,
          };
          await uvCapitalApi.createNotifications(notificationPayload);
        } else if (response?.data[0]?.type === "read") {
          await uvCapitalApi.updateNotification(existingNotification.id, {
            ...existingNotification,
            type: "unread",
          });
        }
      }
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  useEffect(() => {
    if (!user?.id || !selectedUserId) return;
    socket.connect();
    socket.on("connect", () => {
      socket.emit("register_user", user.id);
    });

    socket.on("receive_message", (messageData) => {
      const isReceiver = messageData.receiver_id === user.id;
      const isCurrentChat =
        messageData.sender_id === selectedUserId ||
        messageData.receiver_id === selectedUserId;

      if (isReceiver && isCurrentChat) {
        fetchChatMessages();
        setChatMessages((prev) => {
          const updated = [...prev, messageData];
          setTimeout(scrollToBottom, 100);
          return updated;
        });
      }
    });
    return () => {
      socket.off("receive_message");
      socket.disconnect();
    };
  }, [user?.id, selectedUserId]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderWithMentions = (text) => {
    return text.replace(/@\[\$(.*?)\]\(\$(.*?)\)/g, (_, name) => {
      return `<span class="mention-pill">@${name}</span>`;
    });
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  return (
    <>
      <div className="chat-toggle-button" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes size={24} /> : <FaComments size={24} />}
      </div>

      {isOpen && (
        <div className="chat-box">
          <div className="chat-header">Internal Chat</div>
          <div className="chat-messages">
            {chatMessages?.map((msg, index) => {
              const sender = userList.find((u) => u.id === msg.sender_id);
              return (
                <div
                  key={index}
                  className="chat-message d-flex align-items-start gap-2 mb-2"
                >
                  <img
                    src={sender?.file_name}
                    alt="avatar"
                    className="chat-head rounded-circle"
                    width={30}
                    height={30}
                    title={sender?.name}
                  />
                  <div>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: renderWithMentions(msg.message),
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <MentionsInput
              className="chat-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              markup="@[$__display__]($__id__)"
              style={{
                control: { fontSize: 14 },
                highlighter: { overflow: "hidden" },
                input: { margin: 0 },
                suggestions: {
                  list: {
                    backgroundColor: "white",
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: 14,
                  },
                  item: {
                    padding: "5px 15px",
                    borderBottom: "1px solid #ddd",
                    "&focused": { backgroundColor: "#e6f3ff" },
                  },
                },
                mention: {
                  backgroundColor: "#CBD5E1",
                  padding: "2px 6px",
                  borderRadius: "12px",
                  fontWeight: "500",
                  color: "#1a202c",
                  margin: "0 2px",
                },
              }}
            >
              <Mention
                trigger="@"
                markup="@[$__display__]($__id__)"
                data={userList
                  ?.filter((u) => u.id !== user?.id)
                  .map((u) => ({
                    id: u.id,
                    display: u.name,
                  }))
                }
                displayTransform={(id, display) => `@${display}`}
                onAdd={(id) => setSelectedUserId(id)}
              />

            </MentionsInput>

            <button
              className="chat-send-button"
              onClick={handleSendMessage}
              disabled={message.trim() === ""}
            >
              <IoMdSend size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
