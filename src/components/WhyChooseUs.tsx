import React from "react";
import "../styles/WhyChooseUs.css";

const steps = [
  {
    number: "01",
    title: "Choose Service",
    description:
      "Select premium car or bike wash packages tailored to your vehicle needs.",
    icon: "🚗",
  },
  {
    number: "02",
    title: "Pick Time & Location",
    description:
      "Book instantly with your preferred schedule and doorstep location.",
    icon: "📍",
  },
  {
    number: "03",
    title: "We Wash & Shine",
    description:
      "Our professionals arrive on time and deliver spotless vehicle care.",
    icon: "✨",
  },
];

const testimonials = [
  {
    quote: "Super fast and incredibly convenient!",
    name: "Rahul S.",
  },
  {
    quote: "My bike looks showroom new again.",
    name: "Priya K.",
  },
  {
    quote: "Best doorstep washing experience ever!",
    name: "Arjun M.",
  },
];

const WhyChooseUs: React.FC = () => {

  return (
    <section className="why-section">
      <div className="why-container">
        {/* How It Works */}
        <div className="section-heading">
          <span>PROCESS</span>
          <h2>How Washioo Works</h2>
          <p>Premium vehicle care in just 3 effortless steps</p>
        </div>

        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <div className="step-top">
                <span className="step-icon">{step.icon}</span>
                <span className="step-number">{step.number}</span>
              </div>

              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>

        {/* Why Us */}
        <div className="why-highlight">
          <h2>Why Choose Washioo?</h2>

          <div className="benefits-grid">
            <div>⚡ Instant Booking</div>
            <div>🏠 Doorstep Convenience</div>
            <div>🌱 Eco-Friendly Methods</div>
            <div>💎 Transparent Pricing</div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="section-heading testimonial-heading">
          <span>REVIEWS</span>
          <h2>What Customers Say</h2>
        </div>

        <div className="testimonial-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <p>"{testimonial.quote}"</p>
              <div className="stars" aria-label="5 out of 5 stars">
                ★★★★★
              </div>
              <span>{testimonial.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
