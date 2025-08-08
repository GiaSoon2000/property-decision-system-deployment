import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";

const FeaturedLoans = () => {
  const conventionalLoans = [
    {
      name: "Mortgage One Housing Loan",
      bank: "Standard Chartered",
      rate: "3.85%",
      baseRate: "SBR + 0.85%",
      lockInPeriod: "None",
      benefits: [
        "With MFTA/MFTT bundle",
        "Deposit offset on loan outstanding balance for more interest savings",
        "Full flexibility to access your SIF1 loan and deposit account anytime, anywhere"
      ],
      logo: "StandardChartered.png"
    },
    {
      name: "Home Loan",
      bank: "OCBC",
      rate: "3.85%",
      baseRate: "SBR + 0.85%",
      lockInPeriod: "3 Years",
      benefits: [
        "Flexible choice of facility as a term loan, overdraft or a combination of both",
        "Ability to redraw funds that have been repaid"
      ],
      logo: "OCBC.png"
    },
    {
      name: "My1 Full Flexi Home Loan",
      bank: "RHB",
      rate: "3.90%",
      baseRate: "SBR + 0.90%",
      lockInPeriod: "3 Years",
      benefits: [
        "Full flexi allows for pre-payment and withdrawal",
        "Welcome Gift with full documents"
      ],
      logo: "RHB.png"
    }
  ];

  const islamicLoans = [
    {
      name: "Islamic Home Financing",
      bank: "OCBC Al-Amin",
      rate: "3.80%",
      baseRate: "SBR + 0.8%",
      lockInPeriod: "None",
      benefits: [
        "No penalty for early settlement",
        "Ability to redraw funds for capital payment made"
      ],
      logo: "ocbc al amin.png"
    },
    {
      name: "Saadiq MyHome-i",
      bank: "Standard Chartered Saadiq Islamic",
      rate: "3.85%",
      baseRate: "SBR + 0.9%",
      lockInPeriod: "None",
      benefits: [
        "With MRTA/MRTT bundle",
        "Deposit offset on loan outstanding balance for more interest savings",
        "Full flexibility to access your 2in1 loan and deposit account anytime, anywhere"
      ],
      logo: "standard chartered saadiq islamic.png"
    }
  ];

  const LoanCard = ({ loan }) => (
    <div className="tw-bg-white tw-p-6 tw-flex tw-flex-col tw-h-full tw-border-solid tw-border-black">
      <div className="tw-bg-slate-100 tw-flex tw-h-20">
        <h3 className="tw-font-medium tw-mb-1 tw-w-1/2">{loan.name}</h3>
        <img src={loan.logo} alt={loan.bank} className="tw-h-full tw-w-1/2"/>
      </div>

      <div className="tw-flex tw-justify-between tw-my-6">
        <div>
          <div className="tw-text-2xl tw-font-bold">{loan.rate}</div>
          <div className="tw-text-gray-600">{loan.baseRate}</div>
        </div>
        <div>
          <div className="tw-text-2xl tw-font-bold">{loan.lockInPeriod}</div>
          <div className="tw-text-gray-600">Lock-in</div>
        </div>
      </div>

      <div className="tw-flex-grow">
        <h4 className="tw-font-medium tw-mb-3 tw-text-left">Package Benefits</h4>
        <ul className="tw-space-y-2 tw-text-left">
          {loan.benefits.map((benefit, idx) => (
            <li key={idx} className="tw-flex tw-items-start tw-gap-2 tw-w-full">
              <span className="tw-text-green-500 tw-mt-1">✓</span>
              <span className="tw-text-sm">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <button className="tw-mt-6 tw-w-full tw-text-red-500 tw-border tw-border-red-500 tw-rounded tw-py-2">
        Enquire Now
      </button>
    </div>
  );

  return (
    <div className="tw-mt-12 tw-w-full tw-pb-14">
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
        <h2 className="tw-text-2xl tw-font-semibold tw-text-gray-900">Today's Featured Home Loans</h2>
        <span className="tw-flex tw-items-center tw-gap-2 tw-text-sm">
          Current SBR is 3.00% p.a.
          <span className="tw-inline-flex tw-items-center tw-justify-center tw-w-4 tw-h-4 tw-rounded-full tw-border tw-border-gray-400 tw-text-gray-400 tw-text-xs">?</span>
        </span>
      </div>

      <Tabs defaultValue="conventional" className="tw-w-full">
        <TabsList className="tw-mb-6">
          <TabsTrigger value="conventional">Conventional</TabsTrigger>
          <TabsTrigger value="islamic">Islamic</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="conventional">
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6">
            {conventionalLoans.map((loan, index) => (
              <LoanCard key={index} loan={loan} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="islamic">
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6">
            {islamicLoans.map((loan, index) => (
              <LoanCard key={index} loan={loan} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-y-16 tw-gap-x-6">
            {[...conventionalLoans, ...islamicLoans].map((loan, index) => (
              <LoanCard key={index} loan={loan} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeaturedLoans;