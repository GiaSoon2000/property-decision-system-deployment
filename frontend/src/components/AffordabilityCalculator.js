import React, { useState, useEffect, useCallback } from 'react';
import { useSpring, animated } from 'react-spring';
import { useNavigate } from 'react-router-dom';
import '../styles/AffordabilityCalculator.css';
import FeaturedLoans from './tailwind/FeaturedLoans';
import CalculatorInfoPanel from './tailwind/CalculatorInfoPanel';

const AnimatedValue = ({ value }) => {
  const props = useSpring({ value });
  return <animated.span>{props.value.to(val => Math.round(val).toLocaleString())}</animated.span>;
};

const AffordabilityCalculator = () => {
  const navigate = useNavigate();

    // Loan Eligibility State
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [monthlyDebts, setMonthlyDebts] = useState(1000);
  const [maxLoanEligibility, setMaxLoanEligibility] = useState(0);
  const [dsrPercentage, setDsrPercentage] = useState(0);
  const [isEligible, setIsEligible] = useState(false);

  // Mortgage Calculator State
  const [homePrice, setHomePrice] = useState(1000000);
  const [downPayment, setDownPayment] = useState(10000);
  const [loanTerm, setLoanTerm] = useState(35);
  const [interestRate, setInterestRate] = useState(4.5);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [loanAmount, setLoanAmount] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  // Add these new state variables with the other state declarations
  const [householdIncome, setHouseholdIncome] = useState(3000);
  const [selectedLoanYear, setSelectedLoanYear] = useState(35);
  const [householdLoanAmount, setHouseholdLoanAmount] = useState(0);

  const calculateLoanEligibility = useCallback(() => {
    // Calculate monthly installment for the potential loan
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    // Calculate maximum loan amount based on DSR threshold (60%)
    const maxDSR = 0.60; // 60% threshold
    const totalAllowableCommitments = monthlyIncome * maxDSR;
    const availableForLoan = totalAllowableCommitments - monthlyDebts;

    // Calculate maximum loan amount using the mortgage payment formula
    const maxLoanAmount = availableForLoan * 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1) / 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));

    // Calculate current DSR
    const currentDSR = (monthlyDebts / monthlyIncome) * 100;
    
    setMaxLoanEligibility(Math.max(Math.round(maxLoanAmount), 0));
    setDsrPercentage(Math.round(currentDSR));
    setIsEligible(currentDSR <= 60);
  }, [monthlyIncome, monthlyDebts, interestRate, loanTerm]);

  const calculateMortgage = useCallback(() => {
    const principal = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    const monthlyPayment = 
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalPaid = monthlyPayment * numberOfPayments;
    const totalInterest = totalPaid - principal;

    setMonthlyPayment(Math.round(monthlyPayment));
    setLoanAmount(principal);
    setTotalInterest(Math.round(totalInterest));
  }, [homePrice, downPayment, loanTerm, interestRate]);

  // Add new calculation function
  const calculateHouseholdLoanAmount = useCallback(() => {
    const annualIncome = householdIncome * 12;
    const thirtyPercentAnnual = annualIncome * 0.3;
    
    let multiplier;
    switch (selectedLoanYear) {
      case 30:
        multiplier = 16.2889;
        break;
      case 35:
        multiplier = 17.4610;
        break;
      default: // 25 years
        multiplier = 14.8282;
        break;
    }
    
    const maxLoanAmount = thirtyPercentAnnual * multiplier;
    setHouseholdLoanAmount(Math.round(maxLoanAmount));
  }, [householdIncome, selectedLoanYear]);

   // Add handler for suggest button
   const handleSuggestProperties = () => {
      // Include required parameters with default values
      const searchParams = new URLSearchParams({
        maxPrice: maxLoanEligibility.toString(),
        area: '', // Add empty area parameter
        propertyType: '', // Add empty property type
        bedrooms: '', // Add empty bedrooms
        bathrooms: '', // Add empty bathrooms
        formOfInterest: '', // Add empty form of interest
      });

      // Navigate to search page with the parameters
      navigate(`/search-results?${searchParams.toString()}`);
    };

  // Add handler for household-based suggest button
  const handleHouseholdSuggestProperties = () => {
    const searchParams = new URLSearchParams({
        maxPrice: householdLoanAmount.toString()
    });
    navigate(`/search-results?${searchParams.toString()}`);
  };


  useEffect(() => {
    calculateLoanEligibility();
    calculateMortgage();
    calculateHouseholdLoanAmount();
  }, [calculateLoanEligibility, calculateMortgage, calculateHouseholdLoanAmount]);

  return (
    <div className="affordability-calculator">
      <h1 className="calculator-title">Mortgage Affordability Calculator</h1>
      <CalculatorInfoPanel />
      
      {/* Loan Eligibility Section */}
      <div className="calculator-section">
        <h2>Loan Eligibility (DSR Method)</h2>
        <div className="loan-input-group">
          <label>Monthly Net Income</label>
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(Number(e.target.value))}
          />
        </div>
        <div className="loan-input-group">
          <label>Monthly Debts</label>
          <input
            type="number"
            value={monthlyDebts}
            onChange={(e) => setMonthlyDebts(Number(e.target.value))}
          />
        </div>
        <div className="result-row">
          <span>Current DSR:</span>
          <span><AnimatedValue value={dsrPercentage} />%</span>
        </div>
        <div className="result-row">
          <span>Maximum Loan Eligibility:</span>
          <span>RM <AnimatedValue value={maxLoanEligibility} /></span>
        </div>
        <div className="result-row eligibility-status">
          <span>Status:</span>
          <span className={isEligible ? 'eligible' : 'not-eligible'}>
            {isEligible ? 'Eligible for Loan' : 'Not Eligible for Loan'}
          </span>
        </div>

         {/* Add Suggest Me button */}
         <div className="suggest-button-container">
              <button 
                  className="suggest-me-button"
                  onClick={handleSuggestProperties}
                  disabled={!isEligible || maxLoanEligibility <= 0}
              >
                  Suggest Properties Based on DSR
              </button>
          </div>
      </div>

    {/* Add new section after the existing calculator-grid div and before FeaturedLoans */}
      
    <h2>Household Income-Based Loan Calculator</h2>
      <div className="calculator-grid household-calculator-grid">
        <div className="input-section household-input-section">
          <div className="input-group household-input-group">
            <div className="input-label-wrapper household-input-label-wrapper">
              <label>Household Income (Monthly)</label>
              <input
                type="number"
                value={householdIncome}
                onChange={(e) => setHouseholdIncome(Number(e.target.value))}
              />
            </div>
            <input
              type="range"
              min="1000"
              max="50000"
              step="100"
              value={householdIncome}
              onChange={(e) => setHouseholdIncome(Number(e.target.value))}
            />
            <div className="range-labels">
              <span>RM 1,000</span>
              <span>RM 50,000</span>
            </div>
            <p className="input-description">Enter your monthly household income.</p>
          </div>

          <div className="input-group household-input-group">
            <label>Loan Term (Years)</label>
            <select 
              value={selectedLoanYear}
              onChange={(e) => setSelectedLoanYear(Number(e.target.value))}
              className="form-select"
            >
              <option value={25}>25 Years</option>
              <option value={30}>30 Years</option>
              <option value={35}>35 Years</option>
            </select>
            <p className="input-description">Select your preferred loan term.</p>
          </div>
        </div>

        <div className="result-section household-result-section">
          <h2>Maximum Loan Amount</h2>
          <div className="monthly-payment household-monthly-payment">
            RM <AnimatedValue value={householdLoanAmount} />
          </div>
          <div className="result-details household-result-details">
            <div className="result-row">
              <span>Annual Income:</span>
              <span>RM <AnimatedValue value={householdIncome * 12} /></span>
            </div>
            <div className="result-row">
              <span>30% of Annual Income:</span>
              <span>RM <AnimatedValue value={householdIncome * 12 * 0.3} /></span>
            </div>
            <p className="result-description household-result-description">
              This calculation is based on 30% of your annual household income
              with a multiplier factor (based on 4.5% interest rate) depending on the loan term:
              <br />
              25 years: 14.8282x
              <br />
              30 years: 16.2889x
              <br />
              35 years: 17.4610x
            </p>
          </div>
          
          {/* Add new suggest button for household calculator */}
          <div className="suggest-button-container household-suggest-button">
            <button 
                className="suggest-me-button"
                onClick={handleHouseholdSuggestProperties}
                disabled={householdLoanAmount <= 0}
            >
                Suggest Properties Based on Household Income
            </button>
          </div>
        </div>
      </div>

      {/* Mortgage Calculator Section */}
      <h2 className="calculator-title">Mortgage Calculator</h2>
      <div className="calculator-grid">
        <div className="input-section">
          <div className="input-group">
          <div className="input-label-wrapper">
              <label>Home Price</label>
              <input
                type="number"
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
              />
            </div>
            <input
              type="range"
              min="50000"
              max="2000000"
              step="1000"
              value={homePrice}
              onChange={(e) => setHomePrice(Number(e.target.value))}
            />
            <div className="range-labels">
              <span>RM 50,000</span>
              <span>RM 2,000,000</span>
            </div>
            <p className="input-description">Enter the price of the home you want to buy.</p>
          </div>
          <div className="input-group">
            <div className="input-label-wrapper">
              <label>Down Payment</label>
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
              />
            </div>
            <input
              type="range"
              min="0"
              max="1000000"
              step="1000"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
            />
            <div className="range-labels">
              <span>RM 0</span>
              <span>RM 1,000,000</span>
            </div>
            <p className="input-description">Enter the amount you plan to put down initially.</p>
          </div>
          <div className="input-group">
            <label>Loan Term</label>
            <input
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
            />
            <p className="input-description">Enter the number of years you plan to pay off the mortgage.</p>
          </div>
          <div className="input-group">
            <label>Interest Rate (%)</label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              step="0.1"
            />
            <p className="input-description">Enter the annual interest rate of the mortgage.</p>
          </div>
        </div>
        <div className="result-section">
          <h2>Monthly Mortgage Payment</h2>
          <div className="monthly-payment">
            RM <AnimatedValue value={monthlyPayment} />
          </div>
          <p className="payment-note">Estimated monthly payment</p>
          <div className="result-details">
            <div className="result-row">
              <span>Loan Amount</span>
              <span>
                RM <AnimatedValue value={loanAmount} />
              </span>
            </div>
            <p className="result-description">Principal amount</p>
            <div className="result-row">
              <span>Total Interest Paid</span>
              <span>
                RM <AnimatedValue value={totalInterest} />
              </span>
            </div>
            <p className="result-description">Total interest</p>
          </div>
          <div className="next-step-section">
            <h3>Take The Next Step Towards Your Dream Home</h3>
            <p>Contact us today to get pre-approved for a mortgage and start your journey to homeownership.</p>
            <button className="get-approved-button">Get Pre-Approved</button>
          </div>          
        </div>
      </div>

      
      <FeaturedLoans />
    </div>
  );
};

export default AffordabilityCalculator;