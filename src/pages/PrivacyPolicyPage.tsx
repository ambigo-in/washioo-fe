import { Link } from "react-router-dom";
import Header from "../components/Header";
import "./TermsAndConditionsPage.css";

const privacySections = [
  {
    title: "1. Information We Collect",
    clauses: [
      "We collect account details such as name, phone number, email address, roles, OTP authentication events, and profile details needed to operate Washioo.",
      "For bookings, we collect vehicle details, service address, GPS coordinates, scheduling information, payment status, ratings, support messages, and operational notes.",
      "For detailers, we may collect KYC and identity-verification details such as Aadhaar number, driving license information, service area, availability, job history, and payout-related records.",
    ],
  },
  {
    title: "2. How We Use Information",
    clauses: [
      "We use personal data to authenticate users, manage bookings, assign detailers, navigate to service locations, process service updates, support customers, prevent fraud, and keep the platform safe.",
      "We may use aggregated operational data to improve pricing, availability, service coverage, quality checks, and platform performance.",
      "We use contact details to send OTPs, booking updates, service notifications, account alerts, policy updates, and support communications.",
    ],
  },
  {
    title: "3. Sharing & Retention",
    clauses: [
      "Customer contact and location details are shared with the assigned detailer only as needed to complete the booking.",
      "We may share data with service providers that help us deliver OTPs, notifications, hosting, analytics, customer support, compliance, and fraud prevention.",
      "We retain records as needed for support, accounting, safety, audit, legal compliance, dispute handling, and legitimate business operations.",
    ],
  },
  {
    title: "4. User Choices",
    clauses: [
      "Users may update profile details through the platform where available or contact support for correction requests.",
      "Users can control device-level location permissions, but disabling location may reduce booking accuracy or service availability.",
      "Users may contact Washioo support for privacy questions, access requests, correction requests, or account-related concerns.",
    ],
  },
  {
    title: "5. Legal Review",
    clauses: [
      "[LEGAL REVIEW REQUIRED] This privacy policy is a working draft and should be finalized against Washioo's actual entity details, data processors, retention schedule, grievance officer details, DPDP Act readiness, and applicable Indian law.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="terms-page">
      <Header />
      <main className="terms-shell">
        <section className="terms-hero">
          <Link to="/" className="terms-back-link">
            Back to home
          </Link>
          <p className="terms-kicker">Washioo Legal</p>
          <h1>Privacy Policy</h1>
          <div className="terms-meta">
            <span>Effective date: [Insert effective date]</span>
            <span>Last updated: [Insert last updated date]</span>
          </div>
          <p>
            This policy explains how Washioo collects, uses, shares, and retains
            personal data for vehicle washing and detailing services in India.
          </p>
        </section>

        <section className="terms-review-note">
          <strong>Important:</strong> This page is a working draft and should be
          reviewed by qualified legal counsel before publication.
        </section>

        <div className="terms-content">
          {privacySections.map((section) => (
            <section key={section.title} className="terms-card">
              <h2>{section.title}</h2>
              <ol>
                {section.clauses.map((clause) => (
                  <li
                    key={clause}
                    className={
                      clause.includes("[LEGAL REVIEW REQUIRED]")
                        ? "legal-review-required"
                        : undefined
                    }
                  >
                    {clause}
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <footer className="terms-footer">(c) Washioo. All rights reserved.</footer>
      </main>
    </div>
  );
}
