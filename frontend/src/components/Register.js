import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP Verification, Step 3: Registration Form
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    phone: "",
    restaurantName: "",
    restaurantAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const navigate = useNavigate(); // Initialize the navigation hook

  const sendOtp = async () => {
    try {
      await axios.post("/api/v1/admin/send-otp", { email });
      alert("OTP sent to your email.");
      setStep(2);
    } catch (err) {
      console.log(err);
      alert("Error sending OTP. Try again.");
    }
  };

  const verifyOtp = async () => {
    try {
      await axios.post("/api/v1/admin/verify-otp", { email, otp });
      alert("OTP verified successfully.");
      setStep(3);
    } catch (err) {
      alert("Invalid OTP. Please try again.");
    }
  };

  const registerUser = async () => {
    try {
      const data = { ...formData, email, otp };
      await axios.put("/api/v1/admin/register", data);
      alert("Registration successful!");
      navigate("/dashboard"); // Redirect to login page
    } catch (err) {
      alert("Error during registration. Check OTP or details.");
    }
  };

  return (
    <div className="register-container">
      {step === 1 && (
        <div className="register-email-step">
          <h2 className="register-email-heading">Email Verification</h2>
          <input
            className="register-email-input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="register-send-otp-button" onClick={sendOtp}>
            Send OTP
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="register-otp-step">
          <h2 className="register-otp-heading">Verify OTP</h2>
          <input
            className="register-otp-input"
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button className="register-verify-otp-button" onClick={verifyOtp}>
            Verify OTP
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="register-details-step">
          <h2 className="register-details-heading">Register</h2>
          <input
            className="register-name-input"
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            className="register-password-input"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <input
            className="register-phone-input"
            type="tel"
            placeholder="(123) 456-7890"
            pattern="[\\(][0-9]{3}[\\)]\\s[0-9]{3}-[0-9]{4}"
            title="Please enter a valid US phone number like (555) 123-4567"
            value={formData.phone}
            onChange={(e) => {
              // Format phone number as user types
              const value = e.target.value;
              const digits = value.replace(/\D/g, "").slice(0, 10);
              let formatted = "";

              if (digits.length > 0) {
                if (digits.length < 4) {
                  formatted = `(${digits}`;
                } else if (digits.length < 7) {
                  formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
                } else {
                  formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
                }
              }

              setFormData({ ...formData, phone: formatted });
            }}
          />
          <small className="form-hint">Format: (XXX) XXX-XXXX</small>
          <input
            className="register-restaurant-name-input"
            type="text"
            placeholder="Restaurant Name"
            value={formData.restaurantName}
            onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
          />
          <input
            className="register-street-input"
            type="text"
            placeholder="Street"
            value={formData.restaurantAddress.street}
            onChange={(e) =>
              setFormData({
                ...formData,
                restaurantAddress: {
                  ...formData.restaurantAddress,
                  street: e.target.value,
                },
              })
            }
          />
          <input
            className="register-city-input"
            type="text"
            placeholder="City"
            value={formData.restaurantAddress.city}
            onChange={(e) =>
              setFormData({
                ...formData,
                restaurantAddress: {
                  ...formData.restaurantAddress,
                  city: e.target.value,
                },
              })
            }
          />
          <input
            className="register-state-input"
            type="text"
            placeholder="State"
            value={formData.restaurantAddress.state}
            onChange={(e) =>
              setFormData({
                ...formData,
                restaurantAddress: {
                  ...formData.restaurantAddress,
                  state: e.target.value,
                },
              })
            }
          />
          <input
            className="register-zip-code-input"
            type="text"
            placeholder="Zip Code"
            value={formData.restaurantAddress.zipCode}
            onChange={(e) =>
              setFormData({
                ...formData,
                restaurantAddress: {
                  ...formData.restaurantAddress,
                  zipCode: e.target.value,
                },
              })
            }
          />
          <button className="register-submit-button" onClick={registerUser}>
            Register
          </button>
        </div>
      )}
    </div>
  );
}

export default Register;
