import React from "react";
import { useNavigate } from "react-router-dom";
import "./TermsOfService.css";
import { ArrowLeft } from "lucide-react";
import SEO from "../../components/SEO";
import { getBreadcrumbSchema } from "../../utils/structuredData";

function TermsOfService() {
  const navigate = useNavigate();
  
  const breadcrumbs = [
    { name: 'Home', url: 'https://giftygen.com' },
    { name: 'Terms of Service', url: 'https://giftygen.com/terms-of-service' }
  ];
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbs);

  return (
    <div className="terms-of-service">
      <SEO
        title="Terms of Service - GiftyGen"
        description="Read GiftyGen's terms and conditions to understand the rules and guidelines for using our digital gift card platform and services."
        keywords="terms of service, terms and conditions, user agreement, GiftyGen terms"
        url="https://giftygen.com/terms-of-service"
        structuredData={breadcrumbSchema}
      />
      <div className="terms-of-service__container">
        <button className="terms-of-service__back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>

        <header className="terms-of-service__header">
          <h1>TERMS &amp; CONDITIONS — Giftygen</h1>
          <p className="terms-of-service__last-updated">
            Last Updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </header>

        <div className="terms-of-service__content">
          <section className="terms-of-service__section">
            <p>
              These Terms explain how you may use{" "}
              <a
                href="https://giftygen.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://giftygen.com
              </a>{" "}
              and the services provided. By using the website, you agree to
              these Terms.
            </p>
          </section>

          <section className="terms-of-service__section">
            <h2>1. Eligibility</h2>
            <p>You must be at least 18 years old to use our services.</p>
          </section>

          <section className="terms-of-service__section">
            <h2>2. Accounts</h2>
            <div className="terms-of-service__subsection">
              <h3>Restaurant Accounts</h3>
              <p>Restaurants must provide correct business and contact information.</p>
              <p>You are responsible for:</p>
              <ul>
                <li>Keeping your login details private</li>
                <li>All actions taken under your account</li>
              </ul>
            </div>
          </section>

          <section className="terms-of-service__section">
            <h2>3. Gift Card Purchases</h2>
            <p>When buying a gift card:</p>
            <ul>
              <li>
                You confirm that the information provided (recipient details,
                message, amount) is accurate
              </li>
              <li>A unique gift code and balance will be generated</li>
              <li>Gift cards may have usage rules set by the restaurant</li>
            </ul>
          </section>

          <section className="terms-of-service__section">
            <h2>4. Subscriptions</h2>
            <p>For paid restaurant plans:</p>
            <ul>
              <li>The selected plan will begin after payment</li>
              <li>Services may pause if payment is not completed</li>
              <li>Renewal is optional unless otherwise stated</li>
            </ul>
          </section>

          <section className="terms-of-service__section">
            <h2>5. Refunds</h2>
            <p>Refunds depend on:</p>
            <ul>
              <li>Restaurant policies</li>
              <li>Whether the gift card is used or partly used</li>
              <li>Timing of the request</li>
            </ul>
            <p>We do not guarantee refunds for:</p>
            <ul>
              <li>Wrong recipient information</li>
              <li>Expired gift cards</li>
              <li>Partially used gift cards</li>
            </ul>
          </section>

          <section className="terms-of-service__section">
            <h2>6. Acceptable Use</h2>
            <p>You must not:</p>
            <ul>
              <li>Attempt to misuse gift codes</li>
              <li>Try to access areas not meant for you</li>
              <li>Manipulate balances or transaction details</li>
              <li>Engage in any fraudulent activity</li>
            </ul>
          </section>

          <section className="terms-of-service__section">
            <h2>7. Ownership</h2>
            <p>
              All content on the platform — logos, text, design, features —
              belongs to Giftygen. You may not copy or reuse without written
              permission.
            </p>
          </section>

          <section className="terms-of-service__section">
            <h2>8. Limitation of Liability</h2>
            <p>Giftygen is not responsible for losses or issues caused by:</p>
            <ul>
              <li>Incorrect details entered by users</li>
              <li>Problems with payment partners</li>
              <li>Service interruptions</li>
              <li>Restaurant-specific policies</li>
            </ul>
          </section>

          <section className="terms-of-service__section">
            <h2>9. Suspension or Termination</h2>
            <p>We may suspend or close accounts for:</p>
            <ul>
              <li>Fraud</li>
              <li>Violation of these Terms</li>
              <li>Misuse of gift cards</li>
              <li>Non-payment of plans</li>
            </ul>
          </section>

          <section className="terms-of-service__section">
            <h2>10. Governing Law</h2>
            <p>These Terms are governed by the laws of India.</p>
          </section>

          <section className="terms-of-service__section">
            <h2>11. Contact</h2>
            <p>For questions or support:</p>
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

export default TermsOfService;

