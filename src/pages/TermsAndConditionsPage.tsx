import { Link } from "react-router-dom";
import Header from "../components/Header";
import "./TermsAndConditionsPage.css";

export const termsSections = [
  {
    title: "1. Introduction & Acceptance",
    clauses: [
      "Washioo is an on-demand vehicle washing and detailing service marketplace operating through web and mobile interfaces in India. The platform connects customers who require vehicle wash/detailing services with independent detailers who perform those services.",
      "These Terms and Conditions apply to all customers, detailers, admins, visitors, and any person using the Washioo platform.",
      "By accessing, registering on, booking through, accepting assignments on, or otherwise using Washioo, you agree to be bound by these Terms, the Privacy Policy, and any operating instructions displayed on the platform.",
      "You must be at least 18 years old to use Washioo independently. If you are under 18, you may use the platform only with consent and supervision of a parent or legal guardian.",
      "Washioo may update these Terms from time to time. Material changes will be communicated through the platform, website, email, SMS, WhatsApp, or any other reasonable mode. Continued use after such notice means you accept the updated Terms.",
      "[LEGAL REVIEW REQUIRED] The legal name, registered address, GSTIN, and operating entity details of Washioo must be inserted before publication.",
    ],
  },
  {
    title: "2. Definitions",
    clauses: [
      '"Platform" means the Washioo website, mobile application, admin dashboard, APIs, and related technology systems.',
      '"Customer" means a person who books or receives a vehicle washing/detailing service through Washioo.',
      '"Detailer" means an independent gig-based field service provider approved by Washioo to perform services for customers.',
      '"Admin" means Washioo or its authorized personnel who manage bookings, assignments, service categories, payments, user accounts, quality checks, and platform operations.',
      '"Booking" means a service request placed by a customer through the platform and accepted, confirmed, assigned, completed, cancelled, or otherwise processed by Washioo.',
      '"Service" means a vehicle wash/detailing service listed on Washioo, including Bike Wash and Car Wash, or any other service added later.',
      '"Payment" means the amount payable by the customer for a service, currently collected directly by the assigned detailer in cash or UPI.',
    ],
  },
  {
    title: "3. User Accounts & Registration",
    clauses: [
      "Users must provide true, accurate, current, and complete information during registration, booking, profile updates, and KYC/document verification.",
      "Customers may be required to provide name, phone number, email address, vehicle details, service address, GPS location, and booking-related information.",
      "Detailers may be required to provide name, phone number, email address, Aadhaar details, driving license details, service area, identity documents, and other KYC information.",
      "Users are responsible for keeping their OTPs, login credentials, devices, and account access secure. Washioo will not be responsible for unauthorized use caused by user negligence.",
      "Washioo may suspend, restrict, or terminate any account if the user provides false information, violates these Terms, misuses the platform, behaves unlawfully, harms platform trust, or creates safety or payment risks.",
    ],
  },
  {
    title: "4. Booking & Service Terms",
    clauses: [
      "Customers may place bookings by selecting the service, date, time, address, and other required details. A booking is confirmed only when accepted by the platform and/or assigned to a detailer.",
      "Washioo may assign, reassign, delay, reschedule, or cancel a booking depending on detailer availability, customer location, weather, operational limits, safety concerns, or other practical conditions.",
      "Customers must provide safe and lawful access to the vehicle, accurate location details, parking/access permission, and a safe place for the detailer to perform the service.",
      "Customers must ensure that the vehicle is legally parked and that service activity is permitted at the chosen location. Any society, building, parking, or local permission issues are the customer's responsibility.",
      "Detailers must arrive on time as far as reasonably possible, behave professionally, follow Washioo service standards, avoid misuse of customer data, and perform the assigned service with reasonable skill and care.",
      "Detailers must not demand extra charges outside the listed service price unless Washioo has clearly approved and communicated such charge to the customer.",
      "Customers may cancel bookings through the platform or support before service starts, subject to any cancellation rules displayed at the time of booking.",
      "Washioo may cancel bookings for unavailable detailers, unsafe locations, incorrect customer information, non-serviceable areas, suspected fraud, weather conditions, or force majeure events.",
      "If a customer is unavailable, does not provide vehicle access, refuses payment after completion, or cannot be contacted within a reasonable time, the booking may be marked as no-show or cancelled.",
      "If a detailer fails to arrive without valid reason, Washioo may reassign the booking, take account action, or apply internal penalties as per platform policy.",
      "[LEGAL REVIEW REQUIRED] Cancellation fees, waiting charges, no-show charges, and time windows should be finalized before publishing.",
    ],
  },
  {
    title: "5. Payment Terms",
    clauses: [
      "The current fixed service prices are Bike Wash at Rs. 59 and Car Wash at Rs. 199, unless changed and displayed by Washioo before booking confirmation.",
      "There are no hidden charges for standard listed services. Any additional service, special request, parking fee, access fee, or exceptional charge must be clearly communicated before being charged.",
      "The customer currently pays the assigned detailer directly at the time of service by cash or UPI. Washioo does not currently use a payment gateway for customer payments.",
      "Because payment is collected directly by the detailer, Washioo does not hold customer funds and does not guarantee physical cash or UPI collection by the detailer.",
      "The detailer is responsible for correctly recording collected payment and remitting Washioo's platform share/commission to the Admin as communicated by Washioo.",
      "The detailer acknowledges that failure to remit the platform share may result in suspension, recovery action, adjustment against future earnings, legal notice, or removal from the platform.",
      "GST, if applicable, will be charged, disclosed, and invoiced in accordance with Indian GST law and Washioo's registration status.",
      "Refunds may be considered where a service was not provided, a duplicate payment was proven, or a serious service failure is verified by Washioo. Refund approval is discretionary and subject to investigation.",
      "Refunds are not guaranteed for subjective dissatisfaction where the service was substantially performed, unless Washioo determines otherwise based on evidence.",
      "[LEGAL REVIEW REQUIRED] GST treatment, invoicing party, commission invoice flow, and whether Washioo acts as e-commerce operator under GST must be reviewed by a CA before publication.",
    ],
  },
  {
    title: "6. Detailer (Gig Worker) Terms",
    clauses: [
      "Detailers are independent contractors/gig workers and are not employees, agents, partners, or representatives of Washioo.",
      "Nothing in these Terms creates an employer-employee relationship, partnership, joint venture, agency, or guarantee of work between Washioo and any detailer.",
      "Detailers are not entitled to salary, provident fund, ESI, bonus, gratuity, paid leave, employment insurance, worker compensation, or employee benefits from Washioo unless required by applicable law.",
      "Detailers are responsible for their own income tax filings, tax payments, records, expenses, tools, travel, and compliance related to their gig work income.",
      "Detailer onboarding may require KYC, identity verification, document checks, training, service standards review, and approval by Washioo.",
      "Washioo may reject, suspend, or remove a detailer for poor service quality, misconduct, fraud, abusive behavior, unsafe conduct, data misuse, repeated cancellations, non-remittance of platform share, or legal/policy violations.",
      "Detailers must maintain professional conduct, respect customers, avoid harassment, protect customer privacy, and use customer location/contact information only for completing the assigned service.",
      "Detailers agree to the earnings split and platform commission structure communicated by Admin through dashboard, message, written policy, or other platform-approved channel.",
      "[LEGAL REVIEW REQUIRED] Gig-worker classification should be reviewed against current central/state labor and social security laws before launch in each operating state.",
    ],
  },
  {
    title: "7. Ratings & Reviews",
    clauses: [
      "After completion of a booking, customers may rate detailers and detailers may rate customers.",
      "Ratings and reviews help Washioo maintain safety, quality, reliability, and trust on the platform.",
      "Users must not post false, abusive, discriminatory, threatening, defamatory, obscene, irrelevant, or malicious reviews.",
      "Washioo may moderate, hide, remove, or restrict reviews that violate platform guidelines, applicable law, or the rights of another person.",
      "Repeated poor ratings, manipulated reviews, or malicious review behavior may result in warning, suspension, reduced visibility, or account termination.",
    ],
  },
  {
    title: "8. Location Data & Privacy",
    clauses: [
      "Washioo collects GPS location, address, latitude/longitude, and related service-location details only for service delivery, assignment, navigation, safety, fraud prevention, support, and operational purposes.",
      "Customer location may be shared with the assigned detailer only to help the detailer reach the service location and complete the booking.",
      "Washioo does not sell user location data to third parties.",
      "Users may withdraw location consent through device settings or by not sharing location; however, this may affect booking accuracy, assignment feasibility, navigation, and service availability.",
      "Washioo may retain user and booking data as required for support, accounting, safety, fraud prevention, statutory compliance, and lawful requests.",
      "Use of personal data is further governed by Washioo's Privacy Policy, which should be read together with these Terms.",
      "[LEGAL REVIEW REQUIRED] A separate Privacy Policy should be finalized under the IT Act, SPDI Rules, DPDP Act compliance requirements, and current data-retention practices.",
    ],
  },
  {
    title: "9. Liability & Disclaimers",
    clauses: [
      "Washioo operates as a service marketplace and technology platform connecting customers with independent detailers. Washioo does not itself perform the physical vehicle wash unless expressly stated.",
      "Service quality, punctuality, conduct, and physical performance are primarily the responsibility of the assigned detailer, subject to Washioo's platform controls and support process.",
      "Any vehicle damage, loss of vehicle items, personal injury, property issue, or misconduct claim must be reported immediately with evidence. The detailer may be responsible for damage directly caused by their negligence or misconduct.",
      "Washioo will reasonably assist with investigation and dispute resolution but does not admit automatic liability for acts, omissions, negligence, or misconduct of independent detailers.",
      "Washioo is not liable for delays or failures caused by weather, natural events, traffic, strikes, government restrictions, internet failures, payment app failures, illness, accidents, safety issues, or other events beyond reasonable control.",
      "To the maximum extent permitted by law, Washioo's total liability for any claim relating to a booking is limited to the service fee paid for that booking.",
      "Nothing in these Terms excludes liability that cannot be excluded under applicable Indian law.",
      "[LEGAL REVIEW REQUIRED] Liability cap and vehicle-damage disclaimer should be reviewed for enforceability under consumer protection law.",
    ],
  },
  {
    title: "10. Intellectual Property",
    clauses: [
      "The Washioo name, logo, brand assets, website/app design, content, text, graphics, software, workflows, and platform materials are owned by or licensed to Washioo.",
      "Users may not copy, reproduce, modify, sell, exploit, reverse engineer, misuse, or create confusingly similar branding or platform content without written permission.",
      "Users grant Washioo a limited right to use booking information, ratings, reviews, and service-related content for operating, improving, supporting, and promoting the platform, subject to the Privacy Policy and applicable law.",
    ],
  },
  {
    title: "11. Dispute Resolution",
    clauses: [
      "Users should first raise complaints through Washioo support so the issue can be reviewed and resolved informally.",
      "If a dispute is not resolved informally within a reasonable period, it may be referred to arbitration under the Arbitration and Conciliation Act, 1996.",
      "The arbitration will be conducted by a sole arbitrator appointed in accordance with applicable law. The language of arbitration will be English, unless otherwise agreed.",
      "The seat and venue of arbitration shall be [City], India.",
      "Courts at [City], India shall have jurisdiction for interim relief, enforcement, and matters not subject to arbitration.",
      "[LEGAL REVIEW REQUIRED] City, arbitrator appointment method, seat, venue, and consumer-dispute carve-outs must be finalized by a lawyer.",
    ],
  },
  {
    title: "12. Governing Law",
    clauses: [
      "These Terms are governed by and interpreted according to the laws of India.",
      "Applicable laws may include the Indian Contract Act, 1872, Information Technology Act, 2000 and rules made under it, Consumer Protection Act, 2019, GST laws, Arbitration and Conciliation Act, 1996, and applicable labor/social security laws.",
      "If any clause is found invalid or unenforceable, the remaining clauses will continue to apply.",
    ],
  },
  {
    title: "13. Contact Information",
    clauses: [
      "Support email: [support@washioo.in]",
      "Support phone/WhatsApp: [+91-XXXXXXXXXX]",
      "Registered office: [Insert registered office address]",
      "Grievance Officer: [Name of Grievance Officer]",
      "Grievance Officer email: [grievance@washioo.in]",
      "Grievance Officer address: [Insert grievance officer contact address]",
      "Users may contact the Grievance Officer for complaints relating to platform use, content, data, account access, privacy, or legal notices.",
      "[LEGAL REVIEW REQUIRED] Grievance officer details, response timelines, and legal notices process must be completed before publishing.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <div className="terms-page">
      <Header />
      <main className="terms-shell">
        <section className="terms-hero">
          <Link to="/" className="terms-back-link">
            Back to home
          </Link>
          <p className="terms-kicker">Washioo Legal</p>
          <h1>Terms and Conditions</h1>
          <div className="terms-meta">
            <span>Effective date: [Insert effective date]</span>
            <span>Last updated: [Insert last updated date]</span>
          </div>
          <p>
            This document is written for Washioo, an India-based vehicle washing
            and detailing platform connecting customers with independent
            detailers.
          </p>
        </section>

        <section className="terms-review-note">
          <strong>Important:</strong> This page is a strong working draft.
          Clauses marked [LEGAL REVIEW REQUIRED] must be verified by a qualified
          lawyer/CA using Washioo's actual entity details, GST status, city of
          registration, operational policies, and state-wise labor compliance.
        </section>

        <div className="terms-content">
          {termsSections.map((section) => (
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

        <footer className="terms-footer">© Washioo. All rights reserved.</footer>
      </main>
    </div>
  );
}
