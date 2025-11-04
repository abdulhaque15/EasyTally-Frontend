import React, { useEffect, useState } from 'react';
import { FaBell, FaTimes } from 'react-icons/fa';
import { Badge, ListGroup, Overlay } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import uvCapitalApi from '../api/uvCapitalApi';
import { useNavigate } from 'react-router-dom';
import { HiOutlineMail, HiOutlineMailOpen } from "react-icons/hi";
import socket from '../config/socket.config';
import { useAuthWrapper } from '../helper/AuthWrapper';

const NotificationBox = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [target, setTarget] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuthWrapper();
  const userId = user?.id;

  const fetchNotifications = async () => {
    try {
      let response = await uvCapitalApi.getNotificationsList();
      if (response.success && Array.isArray(response.data)) {
        const formatted = response.data.map((item) => ({
          id: item.id,
          name: item.name,
          record_id: item.record_id,
          description: item.description,
          status: item.status,
          type: item.type,
          user_id: item.user_id,
          message: item.description || item.name,
          read: item.type === 'read',
          time: new Date(item.createddate).toLocaleString(),
        }));
        setNotifications(formatted);
      } else {
        console.warn("No notifications found");
      }
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

    useEffect(() => {
    if (!userId) return;

    socket.connect();

    socket.on("connect", () => { 
      socket.emit("register_user", userId);
    });

    socket.on("receive_notification", (payload) => { 
      fetchNotifications();
    });

    return () => {
      socket.off("receive_notification");
      socket.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleClick = (event) => {
    setShow(!show);
    setTarget(event.target);
  };

//   useEffect(() => {
//   const fetchNotifications = async () => {
//     try {
//       let response = await uvCapitalApi.getNotificationsList();
//       if (response.success && Array.isArray(response.data)) {
//         const formatted = response.data.map((item) => ({
//           id: item.id,
//           name: item.name,
//           record_id: item.record_id,
//           description: item.description,
//           status: item.status,
//           type: item.type,
//           user_id : item.user_id,
//           message: item.description || item.name,
//           read: item.type === 'read',
//           time: new Date(item.createddate).toLocaleString(),
//         }));

//         setNotifications(formatted);
//       } else {
//         console.warn("No notifications found");
//       }
//     } catch (err) {
//       console.error("Error fetching notifications", err);
//     }
//   };

//   fetchNotifications();
// }, []);


const unreadCount = notifications?.filter(n => !n.read).length;

const handleNotificationClick = async (notification) => {
  try {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, type: "read", read: true } : n
      )
    );
    await uvCapitalApi.updateNotification(notification.id, {
      ...notification,
      type: "read",
    });
    const name = notification.name?.toLowerCase();
    const id = notification.record_id;
    if (name?.includes("lead")) {
      navigate(`/leads/view/${id}`);
    } else {
      console.warn("Unknown notification type");
    }
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
  }
};


  return (
    <div className="position-relative d-inline-block ms-3">
      <div 
        className="position-relative icon-default"
        onClick={handleClick}
      >
        <FaBell size={20} className="text-dark" />
        {unreadCount > 0 && (
          <Badge 
            pill 
            className="position-absolute bg-dark top-0 start-100 translate-middle"
            style={{ fontSize: '0.6rem' }}
          >
            {unreadCount}
          </Badge>
        )}
      </div>

      <Overlay
        show={show}
        target={target}
        placement="bottom-end"
        rootClose
        onHide={() => setShow(false)}
        style={{ width: '300px' }}
      >
        {({ placement, arrowProps, show: _show, popper, ...props }) => (
          <div
            {...props}
            style={{
              ...props.style,
              width: '300px',
              maxWidth: '100vw',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
              zIndex: 1000,
            }}
          >
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h6 className="mb-0 fw-bold">Notifications</h6>
              <button 
                onClick={() => setShow(false)} 
                className="btn btn-sm p-0"
                aria-label="Close"
              >
                <FaTimes className="text-muted" />
              </button>
            </div>

            <ListGroup variant="flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {notifications.length > 0 ? (
                notifications?.map(notification => (
                  <ListGroup.Item 
                    key={notification.id}
                    action
                    onClick={() => handleNotificationClick(notification)}
                    className={`py-3 ${notification.read ? '' : 'bg-light'}`}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="col">
                        <p
                          className={`mb-1 ${notification.read ? "text-muted" : "fw-bold"}`}
                          dangerouslySetInnerHTML={{ __html: notification.message }}
                        />
                        <small className="text-muted">{notification.time}</small>
                      </div>
                      <div className="col-auto d-flex align-items-center">
                        {notification.read ? (
                          <HiOutlineMailOpen className="fs-5" />  
                        ) : (
                          <HiOutlineMail className="fs-5" />
                        )}
                      </div>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item className="text-center py-4 text-muted">
                  No new notifications
                </ListGroup.Item>
              )}
            </ListGroup>
          </div>
        )}
      </Overlay>
    </div>
  );
};

export default NotificationBox;