// src/pages/ContactPage.jsx
import { useState } from 'react';
import './ContactPage.css'; // Import the new CSS

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    email: '',
    phone: '',
    message: '',
    agreed: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would handle form submission here (e.g., send to an API)
    alert('Thank you for your message! (Form submission is not implemented)');
    console.log(formData);
  };

  return (
    <div>
      <h2 className="page-title">Contact Us</h2>
      <div className="contact-page-container">
        {/* Left Info Panel */}
        <div className="contact-info-panel">
          <h3>Get in touch</h3>

          <div className="contact-info-section">
            <h4>Visit us</h4>
            <p>Come say hello at our office HQ.</p>
            <p>67 Wisteria Way Croydon South VIC 3136 AU</p>
          </div>

          <div className="contact-info-section">
            <h4>Chat to us</h4>
            <p>Our friendly team is here to help.</p>
            <a href="mailto:support@photoshare.com">support@photoshare.com</a>
          </div>

          <div className="contact-info-section">
            <h4>Call us</h4>
            <p>Mon-Fri from 8am to 5pm</p>
            <a href="tel:+995555555555">(+995) 555-55-55-55</a>
          </div>

          <div className="contact-info-section">
            <h4>Social media</h4>
            <div className="social-media-links">
              {/* Replace # with your actual links */}
              <a href="#">f</a>
              <a href="#">in</a>
              <a href="#">D</a>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="contact-form-panel">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="firstName">First Name</label>
                <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="lastName">Last Name</label>
                <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group full-width">
                <label className="form-label" htmlFor="company">Address</label>
                <input type="text" name="company" id="company" value={formData.company} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group full-width">
                <label className="form-label" htmlFor="email">Email</label>
                <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group full-width">
                <label className="form-label" htmlFor="phone">Phone Number</label>
                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group full-width">
                <label className="form-label" htmlFor="message">Message</label>
                <textarea name="message" id="message" value={formData.message} onChange={handleChange} className="form-input form-textarea" required />
              </div>
            </div>
            <div className="checkbox-group">
              <input type="checkbox" name="agreed" id="agreed" checked={formData.agreed} onChange={handleChange} required />
              <label htmlFor="agreed">
                I'd like to receive more information about company. I understand and agree to the <a href="#">Privacy Policy</a>
              </label>
            </div>
            <button type="submit" className="btn">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}