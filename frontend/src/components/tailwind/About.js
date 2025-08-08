import React from 'react';

const About = () => {
  return (
    <div className="tw-container tw-mx-auto tw-px-4 tw-py-8 tw-mt-16">
      <div className="tw-max-w-4xl tw-mx-auto">
        <h1 className="tw-text-3xl tw-font-bold tw-text-center tw-mb-8 tw-text-gray-800">
          Welcome to MYPropertyWise
        </h1>
        
        <div className="tw-bg-white tw-rounded-lg tw-shadow-lg tw-p-6 tw-mb-8">
          <h2 className="tw-text-2xl tw-font-semibold tw-mb-4 tw-text-gray-700">
            Intelligent Property Solutions
          </h2>
          <p className="tw-text-gray-600 tw-leading-relaxed">
            MYPropertyWise leverages cutting-edge AI technology to revolutionize your property search experience.
            Our platform combines traditional property listings with intelligent analysis tools to help you make
            informed decisions about your next property investment in Johor, Malaysia.
          </p>
        </div>

        <div className="tw-grid md:tw-grid-cols-3 tw-gap-6">
          <div className="tw-bg-white tw-rounded-lg tw-shadow-lg tw-p-6 hover:tw-shadow-xl tw-transition-shadow tw-duration-300">
            <h3 className="tw-text-xl tw-font-semibold tw-mb-4 tw-text-gray-700">
              AI-Powered Analysis
            </h3>
            <ul className="tw-text-gray-600 tw-space-y-2">
              <li className="tw-flex tw-items-center">
                <span className="tw-text-green-500 tw-mr-2">✓</span> Smart Property Comparisons
              </li>
              <li className="tw-flex tw-items-center">
                <span className="tw-text-green-500 tw-mr-2">✓</span> Market Value Assessment
              </li>
              <li className="tw-flex tw-items-center">
                <span className="tw-text-green-500 tw-mr-2">✓</span> Investment Potential Insights
              </li>
              <li className="tw-flex tw-items-center">
                <span className="tw-text-green-500 tw-mr-2">✓</span> Neighborhood Analytics
              </li>
            </ul>
          </div>

          <div className="tw-bg-white tw-rounded-lg tw-shadow-lg tw-p-6 hover:tw-shadow-xl tw-transition-shadow tw-duration-300">
            <h3 className="tw-text-xl tw-font-semibold tw-mb-4 tw-text-gray-700">
              Smart Features
            </h3>
            <ul className="tw-text-gray-600 tw-space-y-2">
              <li className="tw-flex tw-items-center">
                <span className="tw-text-green-500 tw-mr-2">✓</span> AI Property Assistant
              </li>
              <li className="tw-flex tw-items-center">
                <span className="tw-text-green-500 tw-mr-2">✓</span> Advanced Property Search
              </li>
              <li className="tw-flex tw-items-center">
                <span className="tw-text-green-500 tw-mr-2">✓</span> Real-time Property Listings
              </li>
              <li className="tw-flex tw-items-center">
                <span className="tw-text-green-500 tw-mr-2">✓</span> Personalized Recommendations
              </li>
            </ul>
          </div>

          <div className="tw-bg-white tw-rounded-lg tw-shadow-lg tw-p-6 hover:tw-shadow-xl tw-transition-shadow tw-duration-300">
            <h3 className="tw-text-xl tw-font-semibold tw-mb-4 tw-text-gray-700">
              24/7 Support
            </h3>
            <ul className="tw-text-gray-600 tw-space-y-2">
              <li className="tw-flex tw-items-center">
                <span className="tw-text-green-500 tw-mr-2">✓</span> AI Chatbot Assistant
              </li>
              <li className="tw-flex tw-items-center">
                <span className="tw-text-green-500 tw-mr-2">✓</span> Expert Property Advice
              </li>
              <li className="tw-flex tw-items-center">
                <span className="tw-text-green-500 tw-mr-2">✓</span> Quick Response Time
              </li>
              <li className="tw-flex tw-items-center">
                <span className="tw-text-green-500 tw-mr-2">✓</span> Dedicated Support Team
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 