import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { loginUser, clearErrors } from "../../services/Actions/authActions";
import { useLoading } from "../../context/LoadingContext";
import "./Login.css";

const FallingGifts = () => {
  useEffect(() => {
    const createGift = () => {
      const gift = document.createElement("div");
      gift.className = "falling-gift";

      // Create bow element
      const bow = document.createElement("div");
      bow.className = "bow";
      gift.appendChild(bow);

      // Random position across entire viewport width
      const left = Math.random() * window.innerWidth;
      const duration = 6 + Math.random() * 6;
      const delay = -Math.random() * 20;
      const scale = 0.7 + Math.random() * 0.6;
      const rotation = Math.random() * 360;

      gift.style.left = `${left}px`;
      gift.style.animation = `fallAndRotate ${duration}s linear ${delay}s infinite`;
      gift.style.transform = `scale(${scale}) rotate(${rotation}deg)`;

      return gift;
    };

    const container = document.createElement("div");
    container.className = "falling-gifts";
    document.querySelector(".auth-wrapper").appendChild(container);

    const giftCount = 20; // Increased count for fuller effect
    for (let i = 0; i < giftCount; i++) {
      container.appendChild(createGift());
    }

    // Update positions on window resize
    const handleResize = () => {
      container.innerHTML = "";
      for (let i = 0; i < giftCount; i++) {
        container.appendChild(createGift());
      }
    };

    window.addEventListener("resize", handleResize);

    // Periodically add new gifts
    const intervalId = setInterval(() => {
      if (container.children.length < giftCount) {
        container.appendChild(createGift());
      }
    }, 2000);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("resize", handleResize);
      container.remove();
    };
  }, []);

  return null;
};

const GiftCardLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formTouched, setFormTouched] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCredentialsMessage] = useState(() => searchParams.get("registered") === "1");
  const dispatch = useDispatch();
  const { error } = useSelector((state) => state.auth);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const { setIsLoading } = useLoading();

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");

  useEffect(() => {
    if (error && error !== null) {
      setShowModal(true);
    }
  }, [error]);

  // Clear any existing errors when component mounts
  useEffect(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  // Remove ?registered=1 from URL (keeps URL clean, message stays via state)
  useEffect(() => {
    if (showCredentialsMessage) {
      setSearchParams({}, { replace: true });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark form as touched to show validation styling
    if (!formTouched) {
      setFormTouched(true);
    }

    // Basic validation
    if (!email || !password) {
      return; // Don't submit if fields are empty
    }

    setIsLoading(true);
    try {
      await dispatch(loginUser(email, password, navigate));
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGiftAnimation = () => {
    setIsGiftOpen(!isGiftOpen);
  };

  const handleInputChange = (e, setter) => {
    if (!formTouched) {
      setFormTouched(true);
    }
    setter(e.target.value);
  };

  const handleInputFocus = () => {
    if (!formTouched) {
      setFormTouched(true);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotMessage("");
    try {
      const res = await axios.post("/api/v1/admin/password-reset", { email: forgotEmail });
      setForgotMessage(res.data.message || "If an account exists for this email, you will receive a password reset link shortly.");
      setForgotEmail("");
    } catch (err) {
      setForgotMessage(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <FallingGifts />
      <div className="auth-container">
        <div className="logo-section">
          <div className="gift-wrapper">
            <div className="gift-box">
              {/* Ribbon */}
              <div className="ribbon-wrap">
                <div className="ribbon-vertical"></div>
                <div className="ribbon-horizontal"></div>
                <div className="bow">
                  <div className="bow-circle left"></div>
                  <div className="bow-circle right"></div>
                  <div className="bow-knot"></div>
                </div>
              </div>

              {/* Box Lid */}
              <div className="box-lid">
                <div className="lid-top"></div>
                <div className="lid-front"></div>
              </div>

              {/* Box Base */}
              <div className="box-base">
                <div className="box-front"></div>
                <div className="box-back"></div>
                <div className="box-left"></div>
                <div className="box-right"></div>
                <div className="box-bottom"></div>
                {/* Sparkles */}
                <div className="sparkles">
                  <div className="sparkle s1"></div>
                  <div className="sparkle s2"></div>
                  <div className="sparkle s3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h1 className="title">Login to Giftcard Vault</h1>
          <p className="subtitle">
            {showCredentialsMessage
              ? "Your login credentials have been sent to your email. Please check your inbox and sign in."
              : "Please sign in to continue"}
          </p>

          <form onSubmit={handleSubmit} className={`login-form ${formTouched ? "touched" : ""}`}>
            <div className="login-input-group">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => handleInputChange(e, setEmail)}
                onFocus={handleInputFocus}
                required
                className="login-input-field"
              />
            </div>

            <div className="login-input-group">
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => handleInputChange(e, setPassword)}
                  onFocus={handleInputFocus}
                  required
                  className="login-input-field"
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <button
                type="button"
                className="forgot-password-link"
                onClick={() => setShowForgotModal(true)}
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="submit-button">
              Sign In
            </button>

            {/* <div className="register-prompt">
              Don't have an account? <a href="#" className="signup-link">Sign Up</a>
            </div> */}
          </form>
        </div>
      </div>

      {showModal && (
        <div className="login-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
            <p>{error}</p>
            <button className="login-modal-close" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {showForgotModal && (
        <div className="login-modal-overlay" onClick={() => { setShowForgotModal(false); setForgotMessage(""); }}>
          <div className="login-modal-content forgot-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Forgot Password</h3>
            <p className="forgot-subtitle">Enter your registered email and we&apos;ll send you a reset link.</p>
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="login-input-field forgot-input"
                required
              />
              {forgotMessage && <p className="forgot-message">{forgotMessage}</p>}
              <div className="forgot-buttons">
                <button type="submit" className="submit-button forgot-submit" disabled={forgotLoading}>
                  {forgotLoading ? "Sending..." : "Send Reset Link"}
                </button>
                <button type="button" className="login-modal-close forgot-cancel" onClick={() => { setShowForgotModal(false); setForgotMessage(""); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftCardLogin;
