import React from "react";
import { useNavigate } from "react-router-dom";
import "./TermsOfService.css";
import { ArrowLeft } from "lucide-react";

function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="terms-of-service">
      <div className="terms-of-service__container">
        <button className="terms-of-service__back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>

        <header className="terms-of-service__header">
          <h1>Terms of Service</h1>
          <p className="terms-of-service__last-updated">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </header>

        <div className="terms-of-service__content">
          <section className="terms-of-service__section">
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using the GiftyGen service, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must not use our service.</p>
            <div className="terms-of-service__subsection">
              <h3>Agreement to Terms by Using the Service</h3>
              <p>Your use of our service constitutes your acceptance of these terms and conditions. This agreement applies to all users of the service, including visitors, registered users, and administrators.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Age Requirements</h3>
              <p>You must be at least 18 years old to use this service. By using the service, you represent and warrant that you are of legal age to form a binding contract.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Legal Capacity</h3>
              <p>You must have the legal capacity to enter into this agreement. If you are using the service on behalf of a business, you represent that you have the authority to bind that business to these terms.</p>
            </div>
          </section>

          <section className="terms-of-service__section">
            <h2>2. Service Description</h2>
            <div className="terms-of-service__subsection">
              <h3>What the Service Does</h3>
              <p>GiftyGen provides a platform for managing gift cards, processing orders, and facilitating customer communication through WhatsApp messaging. Our service enables businesses to create, manage, and distribute digital gift cards to their customers.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Features and Limitations</h3>
              <p>Our service includes features such as:</p>
              <ul>
                <li>WhatsApp messaging integration for customer communication</li>
                <li>Order management and processing</li>
                <li>Gift card creation and distribution</li>
                <li>Payment processing</li>
                <li>Customer relationship management</li>
              </ul>
              <p>We reserve the right to modify, suspend, or discontinue any feature of the service at any time without prior notice.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Availability and Uptime</h3>
              <p>While we strive to maintain high availability, we do not guarantee uninterrupted access to the service. The service may be temporarily unavailable due to maintenance, updates, or unforeseen circumstances. We are not liable for any downtime or service interruptions.</p>
            </div>
          </section>

          <section className="terms-of-service__section">
            <h2>3. User Obligations</h2>
            <div className="terms-of-service__subsection">
              <h3>Accurate Information</h3>
              <p>You agree to provide accurate, current, and complete information when registering for and using the service. You are responsible for maintaining the accuracy of your account information.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Prohibited Uses</h3>
              <p>You agree not to use the service for any unlawful or prohibited purpose, including but not limited to:</p>
              <ul>
                <li>Sending spam, unsolicited messages, or engaging in harassment</li>
                <li>Any illegal activity or violation of applicable laws</li>
                <li>Transmitting malicious code, viruses, or harmful content</li>
                <li>Attempting to gain unauthorized access to the service or other users' accounts</li>
                <li>Interfering with or disrupting the service or servers</li>
              </ul>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Compliance with WhatsApp Business Policy</h3>
              <p>You must comply with all applicable WhatsApp Business Policy requirements when using our WhatsApp messaging features. This includes obtaining proper consent from recipients and following messaging guidelines.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Account Security</h3>
              <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>
            </div>
          </section>

          <section className="terms-of-service__section">
            <h2>4. WhatsApp Messaging Terms</h2>
            <div className="terms-of-service__subsection">
              <h3>Opt-In Requirement</h3>
              <p>You must obtain explicit opt-in consent from recipients before sending WhatsApp messages through our service. Recipients must have provided their phone number and consented to receive messages from you.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>24-Hour Messaging Window</h3>
              <p>After a customer initiates a conversation or responds to your message, you may send messages within a 24-hour window. Outside this window, you must use approved template messages that comply with WhatsApp Business Policy.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Template Message Usage</h3>
              <p>Template messages must be pre-approved by WhatsApp and can only be used for specific purposes such as order confirmations, delivery updates, and transactional notifications. You are responsible for ensuring your template messages comply with WhatsApp's requirements.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Compliance with WhatsApp Business Policy</h3>
              <p>You must comply with all WhatsApp Business Policy requirements, including but not limited to message content guidelines, opt-in requirements, and opt-out mechanisms. Violation of WhatsApp policies may result in suspension or termination of your access to WhatsApp messaging features.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>User Opt-Out Rights</h3>
              <p>Recipients have the right to opt-out of receiving messages at any time. You must honor opt-out requests immediately and remove recipients from your messaging list upon request. Recipients can opt-out by replying "STOP" or by contacting you directly.</p>
            </div>
          </section>

          <section className="terms-of-service__section">
            <h2>5. Intellectual Property</h2>
            <div className="terms-of-service__subsection">
              <h3>Ownership of Content</h3>
              <p>You retain ownership of any content you create, upload, or transmit through the service. However, by using the service, you grant us a license to use, store, and process your content as necessary to provide the service.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>License to Use Your Service</h3>
              <p>We grant you a limited, non-exclusive, non-transferable license to access and use the service in accordance with these terms. This license does not include the right to resell, redistribute, or create derivative works based on the service.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Trademarks and Copyrights</h3>
              <p>All trademarks, service marks, logos, and copyrights displayed on the service are the property of their respective owners. You may not use our trademarks or intellectual property without our prior written consent.</p>
            </div>
          </section>

          <section className="terms-of-service__section">
            <h2>6. Payment Terms and Fees</h2>
            <div className="terms-of-service__subsection">
              <h3>Subscription Fees</h3>
              <p>Access to certain features of the service may require a paid subscription. Subscription fees are charged according to the plan you select. All fees are stated in the currency specified at the time of purchase and are exclusive of applicable taxes.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Payment Processing</h3>
              <p>Payments are processed through third-party payment processors. By making a payment, you agree to the terms and conditions of the payment processor. We are not responsible for any errors or issues that occur during the payment process.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Refund Policy</h3>
              <p>Subscription fees are generally non-refundable. However, refunds may be considered on a case-by-case basis at our sole discretion. If you believe you are entitled to a refund, please contact us within 30 days of the payment date.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Automatic Renewal</h3>
              <p>Unless you cancel your subscription, it will automatically renew at the end of each billing period. You authorize us to charge the applicable subscription fee to your payment method on file.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Price Changes</h3>
              <p>We reserve the right to modify subscription fees at any time. We will provide at least 30 days' notice of any price changes. Continued use of the service after the price change constitutes acceptance of the new pricing.</p>
            </div>
          </section>

          <section className="terms-of-service__section">
            <h2>7. Gift Card Terms</h2>
            <div className="terms-of-service__subsection">
              <h3>Gift Card Issuance</h3>
              <p>Gift cards are issued by the businesses using our platform. GiftyGen facilitates the creation and distribution of gift cards but is not the issuer. The terms and conditions of each gift card are determined by the issuing business.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Gift Card Redemption</h3>
              <p>Gift cards can only be redeemed at the issuing business according to their terms. Gift cards are non-transferable unless otherwise stated by the issuing business. Each gift card has a unique identifier and cannot be duplicated or counterfeited.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Expiration and Validity</h3>
              <p>Gift cards may have expiration dates as determined by the issuing business. It is your responsibility to check the expiration date and terms of each gift card. Expired gift cards cannot be redeemed.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Gift Card Refunds</h3>
              <p>Refund policies for gift cards are determined by the issuing business. GiftyGen is not responsible for refunds of gift card purchases. All refund requests must be directed to the issuing business.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Lost or Stolen Gift Cards</h3>
              <p>You are responsible for safeguarding your gift card information. GiftyGen and the issuing business are not responsible for lost, stolen, or unauthorized use of gift cards. Report lost or stolen gift cards immediately to the issuing business.</p>
            </div>
          </section>

          <section className="terms-of-service__section">
            <h2>8. Subscription Terms</h2>
            <div className="terms-of-service__subsection">
              <h3>Subscription Plans</h3>
              <p>We offer various subscription plans with different features and pricing. Details of each plan, including features, pricing, and billing cycles, are available on our website. You may upgrade or downgrade your subscription plan at any time.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Billing and Renewal</h3>
              <p>Subscriptions are billed in advance on a recurring basis (monthly, quarterly, or annually as selected). Your subscription will automatically renew at the end of each billing period unless you cancel it before the renewal date.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Cancellation</h3>
              <p>You may cancel your subscription at any time through your account settings or by contacting us. Cancellation will take effect at the end of your current billing period. You will continue to have access to the service until the end of the paid period.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Non-Payment</h3>
              <p>If payment fails or your subscription is not renewed, we may suspend or terminate your access to paid features. We will attempt to notify you of payment failures, but it is your responsibility to ensure your payment method is valid and up to date.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>No Refunds for Partial Periods</h3>
              <p>If you cancel your subscription, you will not receive a refund for any unused portion of the current billing period. Your access will continue until the end of the period for which you have paid.</p>
            </div>
          </section>

          <section className="terms-of-service__section">
            <h2>9. Limitation of Liability</h2>
            <div className="terms-of-service__subsection">
              <h3>Service Provided "As Is"</h3>
              <p>The service is provided on an "as is" and "as available" basis. We make no representations or warranties of any kind, express or implied, regarding the service's operation or availability.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>No Warranties</h3>
              <p>We disclaim all warranties, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the service will be uninterrupted, secure, or error-free.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Limitation of Damages</h3>
              <p>To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the service.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Indemnification</h3>
              <p>You agree to indemnify, defend, and hold harmless GiftyGen and its officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of the service, violation of these terms, or infringement of any rights of another party.</p>
            </div>
          </section>

          <section className="terms-of-service__section">
            <h2>10. Third-Party Services</h2>
            <div className="terms-of-service__subsection">
              <h3>Integration with Third-Party Services</h3>
              <p>Our service integrates with third-party services including but not limited to WhatsApp Business API, payment processors (such as Razorpay), and other service providers. Your use of these third-party services is subject to their respective terms and conditions.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Third-Party Responsibility</h3>
              <p>We are not responsible for the availability, accuracy, or reliability of third-party services. Any issues with third-party services should be directed to the respective service provider. We do not warrant or guarantee the performance of third-party services.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Data Sharing with Third Parties</h3>
              <p>By using our service, you acknowledge that certain data may be shared with third-party service providers as necessary to provide the service. This data sharing is subject to our Privacy Policy.</p>
            </div>
          </section>

          <section className="terms-of-service__section">
            <h2>11. Termination</h2>
            <div className="terms-of-service__subsection">
              <h3>How Accounts Can Be Terminated</h3>
              <p>You may terminate your account at any time by contacting us or using the account deletion features provided in the service. We reserve the right to suspend or terminate your account immediately, without prior notice, if you violate these terms or engage in any prohibited activities.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>What Happens to Data Upon Termination</h3>
              <p>Upon termination of your account, we may delete or retain your data in accordance with our Privacy Policy and applicable legal requirements. You are responsible for backing up any data you wish to retain before terminating your account.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Your Right to Suspend/Terminate</h3>
              <p>We reserve the right to suspend or terminate your access to the service at any time, with or without cause, and with or without notice, for any reason including but not limited to violation of these terms, illegal activity, or non-payment of fees.</p>
            </div>
          </section>

          <section className="terms-of-service__section">
            <h2>12. Changes to Terms</h2>
            <div className="terms-of-service__subsection">
              <h3>Right to Modify Terms</h3>
              <p>We reserve the right to modify these Terms of Service at any time. We will make reasonable efforts to notify users of material changes to these terms.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Notification of Changes</h3>
              <p>We may notify you of changes to these terms by posting the updated terms on our website, sending an email to your registered email address, or through other reasonable means. The "Last Updated" date at the top of this page indicates when these terms were last revised.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Continued Use as Acceptance</h3>
              <p>Your continued use of the service after changes to these terms constitutes your acceptance of the modified terms. If you do not agree to the modified terms, you must stop using the service and terminate your account.</p>
            </div>
          </section>

          <section className="terms-of-service__section">
            <h2>13. Privacy and Data Protection</h2>
            <div className="terms-of-service__subsection">
              <h3>Privacy Policy</h3>
              <p>Your use of the service is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal information. By using the service, you consent to the collection and use of your information as described in our Privacy Policy.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Data Security</h3>
              <p>We implement reasonable security measures to protect your data. However, no method of transmission over the internet or electronic storage is 100% secure. You acknowledge that we cannot guarantee absolute security of your data.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Data Retention</h3>
              <p>We retain your data for as long as necessary to provide the service and comply with legal obligations. Upon termination of your account, we may delete your data in accordance with our Privacy Policy and applicable laws.</p>
            </div>
          </section>

          <section className="terms-of-service__section">
            <h2>14. Governing Law</h2>
            <div className="terms-of-service__subsection">
              <h3>Applicable Jurisdiction</h3>
              <p>These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which GiftyGen operates, without regard to its conflict of law provisions.</p>
            </div>
            <div className="terms-of-service__subsection">
              <h3>Dispute Resolution</h3>
              <p>Any disputes arising out of or relating to these terms or the service shall be resolved through good faith negotiations. If a dispute cannot be resolved through negotiations, it shall be subject to the exclusive jurisdiction of the courts in the applicable jurisdiction.</p>
            </div>
          </section>

          <section className="terms-of-service__section">
            <h2>15. Force Majeure</h2>
            <p>We shall not be liable for any failure or delay in performance under these terms that is due to causes beyond our reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, labor disputes, internet or telecommunications failures, or government actions.</p>
          </section>

          <section className="terms-of-service__section">
            <h2>16. Severability</h2>
            <p>If any provision of these Terms of Service is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be replaced with a valid provision that most closely approximates the intent of the original provision.</p>
          </section>

          <section className="terms-of-service__section">
            <h2>17. Entire Agreement</h2>
            <p>These Terms of Service, together with our Privacy Policy, constitute the entire agreement between you and GiftyGen regarding the use of the service and supersede all prior agreements and understandings, whether written or oral.</p>
          </section>

          <section className="terms-of-service__section">
            <h2>18. Contact Information</h2>
            <p>If you have any questions, concerns, or requests regarding these Terms of Service, please contact us:</p>
            <div className="terms-of-service__contact">
              <p><strong>Email:</strong> <a href="mailto:support@giftygen.com">support@giftygen.com</a></p>
              <p><strong>Website:</strong> <a href="https://giftygen.com" target="_blank" rel="noopener noreferrer">https://giftygen.com</a></p>
            </div>
            <p>We will respond to your inquiries within a reasonable timeframe.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;

