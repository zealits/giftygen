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
          <h1>Privacy Policy</h1>
          <p className="privacy-policy__last-updated">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </header>

        <div className="privacy-policy__content">
          <section className="privacy-policy__section">
            <h2>1. Information Collection</h2>
            <div className="privacy-policy__subsection">
              <h3>What Data We Collect</h3>
              <p>We collect the following types of information:</p>
              <ul>
                <li><strong>Phone Numbers:</strong> Collected when you interact with our WhatsApp Business API for customer communication and order processing</li>
                <li><strong>Messages:</strong> WhatsApp messages sent and received through our platform for customer support and order management</li>
                <li><strong>User Data:</strong> Information provided during registration, including name, email address, business details, and contact information</li>
                <li><strong>Transaction Data:</strong> Order details, payment information, gift card purchases, and redemption history</li>
              </ul>
            </div>
            <div className="privacy-policy__subsection">
              <h3>How We Collect Information</h3>
              <ul>
                <li><strong>WhatsApp API:</strong> Data collected through WhatsApp Business API when you send or receive messages</li>
                <li><strong>Webhooks:</strong> Automated data collection through webhook integrations for order processing and notifications</li>
                <li><strong>User Input:</strong> Information you provide directly through our website, registration forms, and customer support interactions</li>
                <li><strong>Cookies and Local Storage:</strong> We use cookies and browser local storage to maintain your session, remember your preferences (such as language and theme settings), and improve your experience</li>
                <li><strong>Automatically Collected Data:</strong> Device information, IP address, browser type, and usage patterns when you interact with our website</li>
              </ul>
            </div>
            <div className="privacy-policy__subsection">
              <h3>Purpose of Collection</h3>
              <ul>
                <li>Facilitating customer communication via WhatsApp</li>
                <li>Processing and managing gift card orders and transactions</li>
                <li>Providing customer support and responding to inquiries</li>
                <li>Improving our services and user experience</li>
                <li>Compliance with legal and regulatory requirements</li>
              </ul>
            </div>
          </section>

          <section className="privacy-policy__section">
            <h2>2. How We Use Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul>
              <li><strong>Sending/Receiving WhatsApp Messages:</strong> To communicate with customers regarding orders, gift card deliveries, and support inquiries</li>
              <li><strong>Processing Orders/Transactions:</strong> To process gift card purchases, manage payments, and handle order fulfillment</li>
              <li><strong>Customer Support:</strong> To respond to customer inquiries, resolve issues, and provide assistance</li>
              <li><strong>Business Operations:</strong> To manage our platform, improve services, and conduct business analytics</li>
              <li><strong>Compliance with Legal Obligations:</strong> To meet legal requirements, respond to legal processes, and protect our rights</li>
            </ul>
          </section>

          <section className="privacy-policy__section">
            <h2>3. Data Sharing</h2>
            <div className="privacy-policy__subsection">
              <h3>Third-Party Service Providers</h3>
              <p>We may share data with third parties in the following circumstances:</p>
              <ul>
                <li><strong>Meta/Facebook:</strong> As part of using WhatsApp Business API, certain data is processed by Meta/Facebook in accordance with their privacy policy</li>
                <li><strong>Service Providers:</strong> We may share data with trusted service providers who assist us in operating our platform, processing payments, and providing customer support</li>
                <li><strong>Payment Processors:</strong> Transaction data may be shared with payment processing partners to facilitate secure payments</li>
              </ul>
            </div>
            <div className="privacy-policy__subsection">
              <h3>Business Transfers</h3>
              <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</p>
            </div>
            <div className="privacy-policy__subsection">
              <h3>Legal Requirements</h3>
              <p>We may disclose your information if required by law, court order, or governmental authority, or to protect our rights, property, or safety.</p>
            </div>
          </section>

          <section className="privacy-policy__section">
            <h2>4. Data Storage and Security</h2>
            <div className="privacy-policy__subsection">
              <h3>Where Data is Stored</h3>
              <p>Your data is stored on secure servers located in data centers that comply with industry-standard security protocols. Some data may be processed and stored by third-party service providers, including Meta/Facebook for WhatsApp-related data.</p>
            </div>
            <div className="privacy-policy__subsection">
              <h3>Security Measures</h3>
              <p>We implement appropriate technical and organizational security measures to protect your data, including:</p>
              <ul>
                <li>Encryption of data in transit and at rest</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Regular security assessments and updates</li>
                <li>Secure API integrations</li>
              </ul>
            </div>
            <div className="privacy-policy__subsection">
              <h3>Retention Periods</h3>
              <p>We retain your personal data for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. Transaction and order data may be retained for accounting and legal compliance purposes as required by law.</p>
            </div>
          </section>

          <section className="privacy-policy__section">
            <h2>5. Cookies and Tracking Technologies</h2>
            <div className="privacy-policy__subsection">
              <h3>Types of Cookies and Storage We Use</h3>
              <p>We use the following technologies to enhance your experience:</p>
              <ul>
                <li><strong>Authentication Cookies:</strong> Essential cookies used to maintain your login session and authenticate your identity</li>
                <li><strong>Preference Storage:</strong> Local storage to remember your language preferences, theme settings, and other user preferences</li>
                <li><strong>Session Storage:</strong> Temporary storage used during your browsing session to improve functionality</li>
              </ul>
            </div>
            <div className="privacy-policy__subsection">
              <h3>Managing Cookies and Storage</h3>
              <p>You can control cookies and local storage through your browser settings. However, disabling certain cookies may affect the functionality of our website. Most browsers allow you to:</p>
              <ul>
                <li>View and delete cookies and stored data</li>
                <li>Block cookies from specific sites</li>
                <li>Block all cookies</li>
                <li>Delete all cookies when you close your browser</li>
              </ul>
            </div>
          </section>

          <section className="privacy-policy__section">
            <h2>6. Legal Basis for Processing (GDPR)</h2>
            <p>For users in the European Economic Area (EEA), we process your personal data based on the following legal grounds:</p>
            <ul>
              <li><strong>Contractual Necessity:</strong> Processing necessary to fulfill our contract with you (e.g., processing orders, providing services)</li>
              <li><strong>Legitimate Interests:</strong> Processing for our legitimate business interests, such as improving our services, security, and fraud prevention</li>
              <li><strong>Consent:</strong> Processing based on your explicit consent, which you can withdraw at any time</li>
              <li><strong>Legal Obligations:</strong> Processing required to comply with applicable laws and regulations</li>
            </ul>
          </section>

          <section className="privacy-policy__section">
            <h2>7. User Rights (GDPR/CCPA)</h2>
            <p>Depending on your location, you may have the following rights regarding your personal data:</p>
            <div className="privacy-policy__subsection">
              <h3>Access</h3>
              <p>You have the right to request access to the personal data we hold about you.</p>
            </div>
            <div className="privacy-policy__subsection">
              <h3>Correction</h3>
              <p>You have the right to request correction of inaccurate or incomplete personal data.</p>
            </div>
            <div className="privacy-policy__subsection">
              <h3>Deletion</h3>
              <p>You have the right to request deletion of your personal data, subject to certain legal exceptions.</p>
            </div>
            <div className="privacy-policy__subsection">
              <h3>Right to Object</h3>
              <p>You have the right to object to processing of your personal data for direct marketing purposes or based on legitimate interests.</p>
            </div>
            <div className="privacy-policy__subsection">
              <h3>Right to Restrict Processing</h3>
              <p>You have the right to request restriction of processing your personal data in certain circumstances.</p>
            </div>
            <div className="privacy-policy__subsection">
              <h3>Right to Withdraw Consent</h3>
              <p>Where processing is based on consent, you have the right to withdraw your consent at any time without affecting the lawfulness of processing based on consent before its withdrawal.</p>
            </div>
            <div className="privacy-policy__subsection">
              <h3>Opt-Out</h3>
              <p>You can opt-out of receiving marketing communications and WhatsApp messages by contacting us or using the opt-out mechanisms provided.</p>
            </div>
            <div className="privacy-policy__subsection">
              <h3>Data Portability</h3>
              <p>You have the right to receive your personal data in a structured, commonly used format and to transmit that data to another service provider.</p>
            </div>
            <div className="privacy-policy__subsection">
              <h3>Right to Lodge a Complaint</h3>
              <p>If you are located in the EEA, you have the right to lodge a complaint with your local data protection authority if you believe we have violated your data protection rights.</p>
            </div>
            <div className="privacy-policy__subsection">
              <h3>How to Exercise Your Rights</h3>
              <p>To exercise any of these rights, please contact us using the contact information provided in Section 9. We will respond to your request within a reasonable timeframe (typically within 30 days) and in accordance with applicable laws.</p>
            </div>
          </section>

          <section className="privacy-policy__section">
            <h2>8. WhatsApp-Specific Information</h2>
            <div className="privacy-policy__subsection">
              <h3>Use of WhatsApp Business API</h3>
              <p>Our platform uses WhatsApp Business API to facilitate customer communication. When you interact with us through WhatsApp, your messages and phone number are processed through Meta's infrastructure.</p>
            </div>
            <div className="privacy-policy__subsection">
              <h3>Data Processed by Meta/Facebook</h3>
              <p>When using WhatsApp Business API, Meta/Facebook processes certain data including your phone number, message content, and metadata. This processing is subject to Meta's Privacy Policy. We recommend reviewing <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Meta's Privacy Policy</a> to understand how they handle your data.</p>
            </div>
            <div className="privacy-policy__subsection">
              <h3>Opt-In/Opt-Out for Messages</h3>
              <p>By providing your phone number and initiating communication, you consent to receive WhatsApp messages from us. You can opt-out at any time by:</p>
              <ul>
                <li>Replying "STOP" to any WhatsApp message from us</li>
                <li>Contacting us directly to request removal from our messaging list</li>
                <li>Using the unsubscribe options provided in our messages</li>
              </ul>
            </div>
          </section>

          <section className="privacy-policy__section">
            <h2>9. International Data Transfers</h2>
            <p>Your personal data may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. When we transfer your data internationally, we ensure appropriate safeguards are in place, including:</p>
            <ul>
              <li>Standard contractual clauses approved by relevant data protection authorities</li>
              <li>Ensuring third-party service providers comply with applicable data protection laws</li>
              <li>Implementing appropriate security measures to protect your data during transfer</li>
            </ul>
            <p>By using our services, you consent to the transfer of your data to countries outside your country of residence.</p>
          </section>

          <section className="privacy-policy__section">
            <h2>10. Data Breach Notification</h2>
            <p>In the event of a data breach that may affect your personal data, we will:</p>
            <ul>
              <li>Investigate the breach promptly and take steps to mitigate any harm</li>
              <li>Notify relevant supervisory authorities as required by applicable law (typically within 72 hours for GDPR)</li>
              <li>Notify affected users without undue delay if the breach poses a high risk to their rights and freedoms</li>
              <li>Provide information about the nature of the breach, likely consequences, and measures taken to address it</li>
            </ul>
          </section>

          <section className="privacy-policy__section">
            <h2>11. Children's Privacy</h2>
            <p>Our services are not intended for individuals under the age of 18 (or the age of majority in your jurisdiction). We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. If we become aware that we have collected personal information from a child without parental consent, we will take steps to delete such information promptly.</p>
          </section>

          <section className="privacy-policy__section">
            <h2>12. Third-Party Links</h2>
            <p>Our website may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these third-party sites. We encourage you to review the privacy policies of any third-party sites you visit. This Privacy Policy applies only to information collected by our platform.</p>
          </section>

          <section className="privacy-policy__section">
            <h2>13. Contact Information</h2>
            <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
            <div className="privacy-policy__contact">
              <p><strong>Email:</strong> <a href="mailto:privacy@giftygen.com">privacy@giftygen.com</a></p>
              <p><strong>Website:</strong> <a href="https://giftygen.com" target="_blank" rel="noopener noreferrer">https://giftygen.com</a></p>
            </div>
            <p>We will respond to your privacy inquiries within a reasonable timeframe (typically within 30 days) and in accordance with applicable data protection laws.</p>
          </section>

          <section className="privacy-policy__section">
            <h2>Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on our website and updating the "Last Updated" date. We encourage you to review this policy periodically.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;

