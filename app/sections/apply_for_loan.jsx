"use client";

import Image from "next/image";
import React, { useState } from "react";

const ApplyForLoan = () => {
  const [formData, setFormData] = useState({
    name: "",
    idNumber: "",
    email: "",
    loanType: "",
    amount: "",
    securityType: "",
  });

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
      const FORM_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT_APPLY_LOAN;

      if (!FORM_ENDPOINT) {
        throw new Error(
          "Formspree endpoint for apply loan is not set in the environment variables."
        );
      }

      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          recipient: "muasyathegreat4@gmail.com", // Updated recipient email
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
    <div
      style={{
        display: "flex",
        maxWidth: "1000px",
        margin: "0 auto",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ flex: 1 }}>
        <Image
          src="/africanGenz.jpeg"
          alt="Group of people looking at a laptop"
          width={150}
          height={150}
        />
      </div>
      <div style={{ flex: 1, padding: "20px" }}>
        <h1 style={{ color: "#008080", marginBottom: "20px" }}>
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
            <option value="personal">Personal Loan</option>
            <option value="business">Business Loan</option>
            <option value="mortgage">Mortgage Loan</option>
            <option value="education">Education Loan</option>
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
          <button
            type="submit"
            className="w-full p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Apply Now"}
          </button>
        </form>
        {responseMessage && (
          <p style={{ marginTop: "20px", color: "#008080" }}>{responseMessage}</p>
        )}
      </div>
    </div>
  );
};

export default ApplyForLoan;
