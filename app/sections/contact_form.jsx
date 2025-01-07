"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Facebook, Instagram, MessageCircle, Twitter } from "lucide-react";
import Image from "next/image";

export default function ContactForm() {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use the Formspree endpoint from environment variables
      const FORM_ENDPOINT = "http://254capitalemailserver-production.up.railway.app/mail/contact/";

      if (!FORM_ENDPOINT) {
        throw new Error("Formspree endpoint is not set in the environment variables.");
      }

      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
       
        headers: {
        "Content-Type": "application/json",
        
        },
      
        body: JSON.stringify({
          ...formData, // The email recipient
        }),
      });

      if (response.ok) {
        setResponseMessage("Your message has been sent successfully!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setResponseMessage("Failed to send the message. Please try again.");
      }
    } catch (error) {
      setResponseMessage("An error occurred. Please try again later.");
      console.error("Formspree Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div id="contactform" className="container mx-auto px-4 py-8">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side - Image */}
            <div className="relative h-64 md:h-auto">
              <Image
                src="/manufacturing.jpg"
                alt="Car Assembly Line"
                className="object-cover rounded-t-lg md:rounded-none md:rounded-l-lg"
                fill
                priority
              />
            </div>

            {/* Right side - Form */}
            <div className="p-6">

              <h2 className="text-xl md:text-2xl font-semibold text-teal-600 mb-4 md:mb-6">

                Contact us
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Name"
                    className="w-full"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Textarea
                    name="message"
                    placeholder="Message"
                    className="w-full min-h-[120px]"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send"}
                </Button>

                {/* Response Message */}
                {responseMessage && (
                  <p className="text-center mt-4 text-teal-600">
                    {responseMessage}
                  </p>
                )}

                {/* Social Media Icons */}
                <div className="flex justify-center gap-4 mt-6">
                  
                  <a href="#" className="text-green-500 hover:text-green-600">
                    <MessageCircle className="h-6 w-6" />
                  </a>
                  <p>
                    email us at: info@254-capital.com
                  </p>
                 
                </div>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
