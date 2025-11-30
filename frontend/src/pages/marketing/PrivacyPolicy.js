import React from "react";
import { useNavigate } from "react-router-dom";
import "./PrivacyPolicy.css";
import { ArrowLeft } from "lucide-react";

function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="privacy-policy">
      <div className="privacy-policy__container">
        <button className="privacy-policy__back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>

        <header className="privacy-policy__header">
          <h1>PRIVACY POLICY — Giftygen</h1>
          <p className="privacy-policy__last-updated">
            Last Updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </header>

        <div className="privacy-policy__content">
          <section className="privacy-policy__section">
            <p>
              Giftygen (“we”, “our”, “us”) operates{" "}
              <a
                href="https://giftygen.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://giftygen.com
              </a>
              .
            </p>
            <p>
              This Privacy Policy explains how we collect, use, and protect your
              information when you use our website and services.
            </p>
          </section>

          <section className="privacy-policy__section">
            <h2>1. Information We Collect</h2>
            <div className="privacy-policy__subsection">
              <h3>1.1 When a Restaurant Creates an Account</h3>
              <p>We collect business and contact details such as:</p>
              <ul>
                <li>Name</li>
                <li>Email</li>
                <li>Phone number</li>
                <li>Restaurant name</li>
                <li>Business address</li>
                <li>Login details (secured)</li>
                <li>Verification information</li>
              </ul>
            </div>

            <div className="privacy-policy__subsection">
              <h3>1.2 When You Submit a Registration or Inquiry Form</h3>
              <p>We may collect:</p>
              <ul>
                <li>Name</li>
                <li>Email</li>
                <li>Phone number</li>
                <li>Business information</li>
                <li>Address details</li>
                <li>Any additional details you choose to share</li>
              </ul>
            </div>

            <div className="privacy-policy__subsection">
              <h3>1.3 When You Buy a Gift Card</h3>
              <p>We collect:</p>
              <ul>
                <li>Buyer’s name, email, phone</li>
                <li>Recipient’s name, email, message</li>
                <li>Sender information</li>
                <li>
                  Gift card details such as unique codes, balance, usage
                  history
                </li>
                <li>
                  Payment-related information provided during checkout
                  (transaction ID, status, amount, etc.)
                </li>
              </ul>
            </div>

            <div className="privacy-policy__subsection">
              <h3>1.4 Subscriptions &amp; Billing</h3>
              <p>If a restaurant subscribes to a plan, we collect:</p>
              <ul>
                <li>Plan type</li>
                <li>Payment amount</li>
                <li>Status</li>
                <li>Billing history</li>
              </ul>
            </div>

            <div className="privacy-policy__subsection">
              <h3>1.5 Website Usage Information</h3>
              <p>We may collect basic details about how you use the website, such as:</p>
              <ul>
                <li>Pages visited</li>
                <li>Time spent on each page</li>
                <li>Your device and browser type</li>
                <li>General location (city/state level)</li>
              </ul>
              <p>Cookies may be used to improve your experience.</p>
            </div>
          </section>

          <section className="privacy-policy__section">
            <h2>2. How We Use Your Information</h2>
            <p>We use the information to:</p>
            <ul>
              <li>Create and manage accounts</li>
              <li>Process orders and payments</li>
              <li>Provide gift cards and track their usage</li>
              <li>Communicate updates or confirmations</li>
              <li>Improve our website and services</li>
              <li>Prevent fraud and maintain safety</li>
              <li>Provide customer support</li>
            </ul>
          </section>

          <section className="privacy-policy__section">
            <h2>3. Sharing Your Information</h2>
            <p>We only share information with:</p>
            <ul>
              <li>Trusted payment partners</li>
              <li>Communication service providers</li>
              <li>Hosting and storage providers</li>
              <li>Authorities if required by law</li>
            </ul>
            <p>We never sell your personal information.</p>
          </section>

          <section className="privacy-policy__section">
            <h2>4. Data Security</h2>
            <p>
              We use protective measures to keep your data safe, including
              secured passwords, encrypted sensitive data, and restricted access
              based on roles.
            </p>
          </section>

          <section className="privacy-policy__section">
            <h2>5. Data Retention</h2>
            <p>We keep information only as long as needed for:</p>
            <ul>
              <li>Legal and financial compliance</li>
              <li>Business requirements</li>
              <li>Security and fraud prevention</li>
            </ul>
          </section>

          <section className="privacy-policy__section">
            <h2>6. Your Rights</h2>
            <p>You may request:</p>
            <ul>
              <li>Access to your data</li>
              <li>Correction of inaccurate information</li>
              <li>Removal of your information (where legally allowed)</li>
              <li>Stopping certain types of communication</li>
            </ul>
          </section>

          <section className="privacy-policy__section">
            <h2>7. Cookies</h2>
            <p>We may use cookies for:</p>
            <ul>
              <li>Remembering your preferences</li>
              <li>Improving website performance</li>
              <li>Understanding usage patterns</li>
            </ul>
            <p>You can disable cookies through your browser settings.</p>
          </section>

          <section className="privacy-policy__section">
            <h2>8. Updates to This Policy</h2>
            <p>We may update this policy when necessary.</p>
            <p>Changes will be posted on this page.</p>
          </section>

          <section className="privacy-policy__section">
            <h2>9. Contact Us</h2>
            <p>For any questions:</p>
            <ul>
              <li>
                Email:{" "}
                <a href="mailto:support@giftygen.com">support@giftygen.com</a>
              </li>
              <li>
                Website:{" "}
                <a
                  href="https://giftygen.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://giftygen.com
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;

