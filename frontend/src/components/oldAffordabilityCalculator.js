import React, { useState, useEffect, useCallback } from 'react';
import { useSpring, animated } from 'react-spring';
import '../styles/oldAffordabilityCalculator.css';

const AnimatedValue = ({ value }) => {
  const props = useSpring({ value });
  return <animated.span>{props.value.to(val => Math.round(val).toLocaleString())}</animated.span>;
};

const AffordabilityCalculator = () => {
  // Loan Eligibility State
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [monthlyDebts, setMonthlyDebts] = useState(1000);
  const [maxLoanEligibility, setMaxLoanEligibility] = useState(0);

  // Mortgage Calculator State
  const [homePrice, setHomePrice] = useState(300000);
  const [downPayment, setDownPayment] = useState(30000);
  const [loanTerm, setLoanTerm] = useState(35);
  const [interestRate, setInterestRate] = useState(3.5);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [loanAmount, setLoanAmount] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  const calculateLoanEligibility = useCallback(() => {
    // Basic calculation: (Monthly Income - Monthly Debts) * 4 * 12
    // This is a simple example; actual calculations may be more complex
    const eligibility = (monthlyIncome - monthlyDebts) * 4 * 12;
    setMaxLoanEligibility(Math.max(eligibility, 0));
  }, [monthlyIncome, monthlyDebts]);

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

  useEffect(() => {
    calculateLoanEligibility();
    calculateMortgage();
  }, [calculateLoanEligibility, calculateMortgage]);

  return (
    <div className="affordability-calculator">
      <h1 className="calculator-title">Mortgage Affordability Calculator</h1>
      
      {/* Loan Eligibility Section */}
      <div className="calculator-section">
        <h2>Loan Eligibility</h2>
        <div className="input-group">
          <label>Monthly Income</label>
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(Number(e.target.value))}
          />
        </div>
        <div className="input-group">
          <label>Monthly Debts</label>
          <input
            type="number"
            value={monthlyDebts}
            onChange={(e) => setMonthlyDebts(Number(e.target.value))}
          />
        </div>
        <div className="result-row">
          <span>Maximum Loan Eligibility:</span>
          <span>RM <AnimatedValue value={maxLoanEligibility} /></span>
        </div>
      </div>

      {/* Mortgage Calculator Section */}
      <div className="calculator-grid">
        <div className="input-section">
          <div className="input-group">
            <label>Home Price</label>
            <input
              type="range"
              min="50000"
              max="2000000"
              step="1000"
              value={homePrice}
              onChange={(e) => setHomePrice(Number(e.target.value))}
            />
            <input
              type="number"
              value={homePrice}
              onChange={(e) => setHomePrice(Number(e.target.value))}
            />
          </div>
          <div className="input-group">
            <label>Down Payment</label>
            <input
              type="range"
              min="0"
              max={homePrice}
              step="1000"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
            />
            <input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
            />
          </div>
          <div className="input-group">
            <label>Loan Term (years)</label>
            <input
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
            />
          </div>
          <div className="input-group">
            <label>Interest Rate (%)</label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              step="0.1"
            />
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
              <span>RM <AnimatedValue value={loanAmount} /></span>
            </div>
            <div className="result-row">
              <span>Total Interest Paid</span>
              <span>RM <AnimatedValue value={totalInterest} /></span>
            </div>
          </div>
          <button className="get-approved-button">Get Pre-Approved</button>
        </div>
      </div>
    </div>
  );
};

export default AffordabilityCalculator;