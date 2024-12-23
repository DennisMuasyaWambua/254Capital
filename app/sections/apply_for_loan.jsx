"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Upload } from 'lucide-react'

const ApplyForLoan = () => {
  const [formData, setFormData] = useState({
    name: "",
    idNumber: "",
    email: "",
    loanType: "",
    amount: "",
    securityType: "",
    attachment:[],
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData(prev => ({
      ...prev,
      attachment: files
    }))
  }

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const FORM_ENDPOINT = "https://api.254-capital.com/mail/loan-applications/";

      if (!FORM_ENDPOINT) {
        throw new Error(
          "Formspree endpoint for apply loan is not set in the environment variables."
        );
      }
      // Create a FormData object to properly handle file uploads
      const formDataToSend = new FormData();
      
      // Append all text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'attachment') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append files
      if (formData.attachment && formData.attachment.length > 0) {
        formData.attachment.forEach((file, index) => {
          formDataToSend.append(`attachment`, file);
        });
      }

      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        mode:"no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formDataToSend, // Updated recipient email
        }),
      });

      if (response.ok) {
        setResponseMessage("Your loan application has been submitted successfully!");
        setFormData({
          name: "",
          idNumber: "",
          email: "",
          loanType: "",
          amount: "",
          securityType: "",
          attachment:[],
        });
      } else {
        setResponseMessage("Failed to submit your loan application. Please try again.");
      }
    } catch (error) {
      setResponseMessage("An error occurred. Please try again later.");
      console.error("Formspree Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="applyforloan" className="flex flex-col md:flex-row max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
    {/* Left - Image Section */}
    <div className="flex-shrink-0">
      <Image
        src="/Money.png"
        alt="Group of people looking at a laptop"
        width={400}
        height={400}
        className="w-full h-full object-cover md:h-auto"
      />
    </div>

    {/* Right - Form Section */}
    <div className="flex flex-col justify-center p-6 w-full">
      <h1 className="text-2xl font-semibold text-teal-700 mb-6">
        Apply For a Loan Now
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-teal-500"
          required
        />
        <input
          type="text"
          name="idNumber"
          value={formData.idNumber}
          onChange={handleChange}
          placeholder="ID number"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-teal-500"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-teal-500"
          required
        />
        <select
          name="loanType"
          value={formData.loanType}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-teal-500"
          required
        >
          <option value="">Select loan type</option>
          <option value="topup">Topup Loan</option>
          <option value="Saccolendingloan">Sacco lending Loan</option>
          <option value="supplychainfinancing">Supply chain financing Loan</option>
          <option value="salarycheckoffloans">salary check off Loans</option>
          <option value="lpofinancing">LPO financing Loans</option>
          <option value="invoicediscounting">Invoice discounting loans</option>
          <option value="logbookloans">logbook loans</option>
          <option value="bridgingloans">Bridging loans</option>
          <option value="bidbondloans">Bid bonds loans</option>
        </select>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Amount"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-teal-500"
          required
        />
        <select
          name="securityType"
          value={formData.securityType}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-teal-500"
          required
        >
          <option value="">Select security type</option>
          <option value="collateral">Collateral</option>
          <option value="guarantor">Guarantor</option>
          <option value="salary">Salary Assignment</option>
          <option value="property">Property</option>
        </select>

        <div className="space-y-2">
          <Label htmlFor="document">Supporting Document</Label>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label 
              htmlFor="document" 
              className="flex items-center gap-2 h-10 px-3 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-md"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Document</span>
            </Label>
            <Input 
              id="document"
              name="attachment"
              onChange = {handleFileChange}
              type="file" 
              className="hidden"
              accept=".pdf,.doc,.docx"
            />
            <p className="text-sm text-muted-foreground">
              Accepted formats: PDF, DOC, DOCX (Max 5MB)
            </p>
          </div>
        </div>
        <button
          type="submit"
          className="w-full p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          Apply Now
        </button>
        <p>
            need a custom loan? email us at: loans@254-capital.com
        </p>
      </form>
    </div>
  </div>
  );
};

export default ApplyForLoan;
// loans@254-capital.com