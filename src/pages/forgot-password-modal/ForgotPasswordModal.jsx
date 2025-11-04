import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { FaAngleLeft, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { sendResetEmail, verifyOtp, resetPassword } from "../../api/authApi";

const ForgotPasswordModal = ({ show, handleClose, setShow }) => {
  const navigate = useNavigate();

  // Steps: 'email', 'otp', 'confirm', 'newpass', 'success'
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(5).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const closeAll = () => {
    handleClose();
    setShow(false);
    setStep("email");
    setEmail("");
    setOtp(Array(5).fill(""));
    setPassword("");
    setConfirmPassword("");
  };
const sendOtp= async (email)=>{
    try {
      await sendResetEmail(email);
      setStep("otp");
    } catch (err) {
      alert("Failed to send email: " + err?.message);
    }
}
const emailverifyOtp = async () => {
    try {
      const otpCode = otp.join('');
      await verifyOtp(email, otpCode);
      setStep("confirm");
    } catch (err) {
      console.log('error ->',err);
      
      alert(err?.message);
    }
  }
  const updatepassword = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      await resetPassword({ email, password });
      setStep("success");
    } catch (err) {
      alert("Reset failed: "+err?.message);
    }
  }
  const renderBody = () => {
    switch (step) {
      case "email":
        return (
          <>
            <h4>Forgot Password</h4>
            <p className="fs-5">Please enter your email to reset the password</p>
            <Form.Label className="h6">Your Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="yourname@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button className="mt-3 w-100 custom-btn-secondary-login rounded-4" onClick={()=>{sendOtp(email)}}>
              Reset Password
            </Button>
          </>
        );

      case "otp":
        return (
          <>
            <h5>Check your email</h5>
            <p className="text-muted mb-4 fs-6">
              We sent a reset link to <b>{email || "contact@yourdomain.com"}</b>
              <br />
              Enter the 5-digit code from the email.
            </p>
            <div className="d-flex justify-content-center gap-2 mb-4">
              {otp.map((val, idx) => (
                <Form.Control
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={val}
                  onChange={(e) => {
                    const newOtp = [...otp];
                    newOtp[idx] = e.target.value;
                    setOtp(newOtp);
                    if (e.target.value && idx < 4) {
                      document.getElementById(`otp-${idx + 1}`)?.focus();
                    }
                  }}
                  className="text-center border rounded"
                  style={{ width: "70px", height: "70px", fontSize: "1.5rem" }}
                />
              ))}
            </div>
            <div className="d-flex justify-content-center">

            <Button className="w-100 mb-3 p-3 custom-btn-secondary-login rounded-4" onClick={emailverifyOtp}>
              Verify Code
            </Button>
            </div>
            <div className="d-flex justify-content-center">
              <span className="text-muted">Haven’t got the email yet? </span>
              <a href="#" onClick={(e) => e.preventDefault()}>
                Resend email
              </a>
            </div>
          </>
        );

      case "confirm":
        return (
          <>
            <h5>Password reset</h5>
            <p className="text-muted mb-4 fs-5">
              Your password has been successfully verified. Click confirm to set a new one.
            </p>
            <Button className="w-100 mb-3 p-3 custom-btn-secondary-login rounded-4" onClick={() => setStep("newpass")}>
              Confirm
            </Button>
            <div className="text-center">
              <span className="text-muted">Haven’t got the email yet? </span>
              <a href="#" onClick={(e) => e.preventDefault()}>
                Resend email
              </a>
            </div>
          </>
        );

      case "newpass":
        return (
          <>
            <h5>Set a new password</h5>
            <p className="text-muted mb-4 fs-5">
              Create a new password. Ensure it differs from previous ones.
            </p>
            <Form.Group className="mb-3" controlId="formNewPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-4" controlId="formConfirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>
            <Button
              className="w-100 p-3 custom-btn-secondary-login rounded-4"
              
              onClick={updatepassword}
            >
              Update Password
            </Button>
          </>
        );

      case "success":
        return (
          <>
            <div className="d-flex justify-content-center mb-4">
              <div
                style={{
                  width: "165px",
                  height: "165px",
                  backgroundColor: "rgb(212 179 124)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="70"
                  height="70"
                  fill="#fff"
                  className="bi bi-check"
                  viewBox="0 0 16 16"
                >
                  <path d="M13.485 1.929a.75.75 0 011.06 1.06l-8.25 8.25a.75.75 0 01-1.06 0L1.454 7.06a.75.75 0 111.06-1.06l3.46 3.46 7.51-7.53z" />
                </svg>
              </div>
            </div>
            <h2 className="fw-bold text-dark">Password Reset Successful</h2>
            <p className="text-muted mb-4 fs-5">
              Congratulation! Your password has been changed. Click continue to login.
            </p>
            <div className="text-center">
            <Button
              className="w-75 fw-bold custom-btn-secondary-login rounded-4"
              //style={{ backgroundColor: "rgb(212 179 124)", borderColor: "rgb(212 179 124)" }}
              onClick={() => {
                closeAll();
                navigate("/login");
              }}
            >
              Log in
            </Button>
            
</div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      size="md"
      centered
      show={show}
      onHide={closeAll}
      aria-labelledby="contained-modal-title-vcenter"
    >
      <Modal.Header className="d-flex justify-content-between align-items-center custom-btn-secondary-login text-white">
        <div className="d-flex align-items-center gap-2">
          {step !== "email" && step !== "success" && (
            <FaAngleLeft
              onClick={() => {
                if (step === "otp") setStep("email");
                else if (step === "confirm") setStep("otp");
                else if (step === "newpass") setStep("confirm");
              }}
              className="bg-light text-dark rounded p-1"
              style={{ cursor: "pointer", fontSize: "1.2rem" }}
            />
          )}
          <Modal.Title>Forgot Password</Modal.Title>
        </div>
        <FaTimes
          onClick={closeAll}
          className="bg-light text-dark rounded p-1"
          style={{ cursor: "pointer", fontSize: "1.2rem" }}
        />
      </Modal.Header>

      <Modal.Body className="p-5 text-left">{renderBody()}</Modal.Body>
    </Modal>
  );
};

export default ForgotPasswordModal;
