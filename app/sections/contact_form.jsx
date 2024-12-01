"use client";

import { useState } from "react";
import emailjs from "emailjs-com";
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
      const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
        throw new Error("Environment variables for EmailJS are not set.");
      }

      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
        },
        PUBLIC_KEY
      );

      setResponseMessage("Your message has been sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setResponseMessage("Failed to send the message. Please try again.");
      console.error("EmailJS Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left side - Image */}
            <div className="relative h-[300px] md:h-auto">
              <Image
                src="/manufacturing.jpg"
                alt="Car Assembly Line"
                className="object-cover"
                fill
                priority
              />
            </div>

            {/* Right side - Form */}
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-teal-600 mb-6">
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
                  <a href="#" className="text-facebook hover:text-facebook/80">
                    <Facebook className="h-6 w-6" />
                  </a>
                  <a href="#" className="text-green-500 hover:text-green-600">
                    <MessageCircle className="h-6 w-6" />
                  </a>
                  <a href="#" className="text-twitter hover:text-twitter/80">
                    <Twitter className="h-6 w-6" />
                  </a>
                  <a href="#" className="text-pink-500 hover:text-pink-600">
                    <Instagram className="h-6 w-6" />
                  </a>
                </div>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
