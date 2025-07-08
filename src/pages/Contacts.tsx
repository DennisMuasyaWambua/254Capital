
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

const Contacts = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you shortly.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-[#15133F] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            We're here to help with any questions about our financial services. Reach out to us today.
          </p>
        </div>
      </div>

      {/* Contact Information & Form Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-[#15133F] mb-6">Get In Touch</h2>
              <p className="text-gray-600 mb-8">
                Have questions about our financial solutions? Need help with your application? 
                Our team is ready to assist you with any inquiries.
              </p>
            </div>

            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start space-x-4">
                <div className="bg-[#48A7A7]/10 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-[#48A7A7]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#15133F]">Our Office</h3>
                  <p className="text-gray-600 mt-1">IPS Building, 7th Floor<br />Nairobi, Kenya</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-4">
                <div className="bg-[#48A7A7]/10 p-3 rounded-full">
                  <Phone className="h-6 w-6 text-[#48A7A7]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#15133F]">Phone</h3>
                  <p className="text-gray-600 mt-1">
                    <a href="tel:+254742064270" className="hover:text-[#48A7A7] transition-colors">+254 742 064 270</a>
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4">
                <div className="bg-[#48A7A7]/10 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-[#48A7A7]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#15133F]">Email</h3>
                  <p className="text-gray-600 mt-1">
                    <a href="mailto:info@254-capital.com" className="hover:text-[#48A7A7] transition-colors">info@254-capital.com</a>
                  </p>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex items-start space-x-4">
                <div className="bg-[#48A7A7]/10 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-[#48A7A7]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#15133F]">Business Hours</h3>
                  <p className="text-gray-600 mt-1">Monday - Friday: 8:00 AM - 5:00 PM<br />Saturday: 9:00 AM - 1:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[#15133F] mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                ></textarea>
              </div>
              
              <Button 
                type="submit"
                className="bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white rounded-md px-4 py-2 text-sm flex items-center gap-2"
              >
                Send Message
                <Send size={18} />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Google Maps Section */}
      <div className="w-full h-[400px] mt-12">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8172218365144!2d36.81664999999999!3d-1.2833300000000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d0f5ffa3e7%3A0x71f9c5a7c03e3d1e!2sIPS%20Building%2C%20Kimathi%20St%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1746959600000!5m2!1sen!2ske" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen={true} 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          title="254 Capital Office Location"
        ></iframe>
      </div>
    </Layout>
  );
};

export default Contacts;
