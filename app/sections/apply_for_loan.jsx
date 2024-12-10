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