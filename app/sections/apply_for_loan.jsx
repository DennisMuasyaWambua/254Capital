"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Upload } from 'lucide-react'

const ApplyForLoan = () => {
  const [formData, setFormData] = useState({
    name: "",
    id_number: "",
    email: "",
    loan_type: "",
    amount: "",
    security_type: "",
  });
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

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
    setResponseMessage("");

    try {
      const FORM_ENDPOINT = "http://api.254-capital.com/mail/loan-applications/";

      if (!FORM_ENDPOINT) {
        throw new Error("Form endpoint is not set.");
      }

      const formDataToSend = new FormData();

      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Append files with specific field name expected by the server
      selectedFiles.forEach((file, index) => {
        formDataToSend.append(`attachments`, file); // Changed from 'attachment' to 'attachments'
      });

      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: formDataToSend,
        headers: {
          // Don't set Content-Type header - let the browser set it with boundary
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorData}`);
      }

      setResponseMessage("Your loan application has been submitted successfully!");
      // Reset form
      setFormData({
        name: "",
        id_number: "",
        email: "",
        loan_type: "",
        amount: "",
        security_type: "",
      });
      setSelectedFiles([]);
      
      // Reset file input
      const fileInput = document.getElementById('document');
      if (fileInput) {
        fileInput.value = '';
      }

    } catch (error) {
      console.error("Submission error:", error);
      setResponseMessage(`Failed to submit: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="applyforloan" className="flex flex-col md:flex-row max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="flex-shrink-0">
        <Image
          src="/Money.png"
          alt="Group of people looking at a laptop"
          width={400}
          height={400}
          className="w-full h-full object-cover md:h-auto"
        />
      </div>

      <div className="flex flex-col justify-center p-6 w-full">
        <h1 className="text-2xl font-semibold text-teal-700 mb-6">
          Apply For a Loan Now
        </h1>
        
        {responseMessage && (
          <div className={`p-4 mb-4 rounded ${
            responseMessage.includes("success") 
              ? "bg-green-100 text-green-700" 
              : "bg-red-100 text-red-700"
          }`}>
            {responseMessage}
          </div>
        )}

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
            name="id_number"
            value={formData.id_number}
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
            name="loan_type"
            value={formData.loan_type}
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
            name="security_type"
            value={formData.security_type}
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
                name="attachments"
                onChange={handleFileChange}
                type="file" 
                className="hidden"
                accept=".pdf,.doc,.docx"
                multiple
              />
              {selectedFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Selected files:</p>
                  <ul className="list-disc list-inside">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="text-sm text-gray-600">{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Accepted formats: PDF, DOC, DOCX (Max 5MB)
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full p-3 bg-teal-600 text-white rounded-lg ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Apply Now'}
          </button>

          <p className="text-sm text-gray-600 text-center">
            Need a custom loan? Email us at: loans@254-capital.com
          </p>
        </form>
      </div>
    </div>
  );
};

export default ApplyForLoan;