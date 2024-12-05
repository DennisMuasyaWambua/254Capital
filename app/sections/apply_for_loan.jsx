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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="flex flex-col md:flex-row max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
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
          >
            Apply Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyForLoan;
