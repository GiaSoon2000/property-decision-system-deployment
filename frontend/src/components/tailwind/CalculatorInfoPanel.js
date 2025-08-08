import React from 'react';
import { Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';

const CalculatorInfoPanel = () => {
  return (
    <div className="tw-space-y-4 tw-my-6">
      <div className="tw-grid md:tw-grid-cols-2 tw-gap-4">
        <Alert className="tw-border-blue-200 tw-bg-blue-50">
          <div className="tw-flex tw-items-center tw-gap-2">
            <Info className="tw-h-4 tw-w-4 tw-text-blue-500" />
            <AlertTitle className="tw-text-blue-700 tw-font-bold tw-my-0 tw-leading-none tw-translate-y-[3px]">Debt Service Ratio (DSR Method)</AlertTitle>
          </div>
          <AlertDescription className="tw-text-blue-600">
            <ul className="tw-list-disc tw-pl-4 tw-mt-2 tw-space-y-2">
              <li>Focuses on monthly debt servicing ability</li>
              <li>Used by banks for loan approval assessment</li>
              <li>Considers current monthly income and existing debts</li>
              <li>May show higher loan amounts based on monthly affordability</li>
            </ul>
            <div className="tw-mt-4">
              <p className="tw-font-semibold">Suitable For:</p>
              <ul className="tw-list-disc tw-pl-4 tw-mt-1 tw-space-y-1">
                <li>Buyers with stable and high monthly incomes</li>
                <li>Buyers looking for higher loan amounts</li>
                <li>Buyers with minimal existing debts</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        <Alert className="tw-border-green-200 tw-bg-green-50">
          <div className="tw-flex tw-items-center tw-gap-2">
            <Info className="tw-h-4 tw-w-4 tw-text-green-500" />
            <AlertTitle className="tw-text-green-700 tw-font-bold tw-my-0 tw-leading-none tw-translate-y-[3px]">Household Income-Based Method</AlertTitle>
          </div>
          <AlertDescription className="tw-text-green-600">
            <ul className="tw-list-disc tw-pl-4 tw-mt-2 tw-space-y-2">
              <li>Takes a more conservative, long-term approach</li>
              <li>Considers overall household financial health</li>
              <li>Ensures buffer for living expenses and savings</li>
              <li>Provides more sustainable loan amount recommendations</li>
            </ul>
            <div className="tw-mt-4">
              <p className="tw-font-semibold">Suitable For:</p>
              <ul className="tw-list-disc tw-pl-4 tw-mt-1 tw-space-y-1">
                <li>Buyers with family or long-term financial commitments</li>
                <li>Risk-averse buyers prioritizing financial stability</li>
                <li>First-time homebuyers</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </div>

      <Alert className="tw-border-purple-200 tw-bg-purple-50">
        <div className="tw-flex tw-items-center tw-gap-2">
          <Info className="tw-h-4 tw-w-4 tw-text-purple-500" />
          <AlertTitle className="tw-text-purple-700 tw-font-bold tw-my-0 tw-leading-none tw-translate-y-[1px]">Which Method Should You Use?</AlertTitle>
        </div>
        <AlertDescription className="tw-text-purple-600">
          While the DSR method shows your maximum theoretical loan eligibility, the Household Income-Based calculator provides a more conservative estimate that considers long-term financial sustainability. We recommend using both calculators - DSR to understand your maximum eligibility, and Household Income-Based to determine a comfortable, sustainable loan amount.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default CalculatorInfoPanel;