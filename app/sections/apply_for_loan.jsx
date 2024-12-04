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

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  };

  const inputStyle = {
    padding: "8px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  };

  const selectStyle = {
    ...inputStyle,
    appearance: "none",
    backgroundImage:
      'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.7em top 50%",
    backgroundSize: "0.65em auto",
  };

  const buttonStyle = {
    padding: "10px 15px",
    fontSize: "18px",
    backgroundColor: "#008080",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
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
        <form onSubmit={handleSubmit} style={formStyle}>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            style={inputStyle}
            required
          />
          <input
            type="text"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleChange}
            placeholder="ID number"
            style={inputStyle}
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            style={inputStyle}
            required
          />
          <select
            name="loanType"
            value={formData.loanType}
            onChange={handleChange}
            style={selectStyle}
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
            style={inputStyle}
            required
          />
          <select
            name="securityType"
            value={formData.securityType}
            onChange={handleChange}
            style={selectStyle}
            required
          >
            <option value="">Select security type</option>
            <option value="collateral">Collateral</option>
            <option value="guarantor">Guarantor</option>
            <option value="salary">Salary Assignment</option>
            <option value="property">Property</option>
          </select>
          <button type="submit" style={buttonStyle} disabled={isSubmitting}>
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
