
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

type OnboardingStep = {
  id: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
};

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: "Welcome to Saaslyzer",
    description: "Let's set up your analytics dashboard in just a few steps.",
    icon: <Check className="h-5 w-5" />,
  },
  {
    id: 2,
    title: "Connect your data",
    description: "Link your Stripe account to start tracking your subscription metrics.",
    icon: <Check className="h-5 w-5" />,
  },
  {
    id: 3,
    title: "Customize your dashboard",
    description: "Choose which metrics matter most to your business.",
    icon: <Check className="h-5 w-5" />,
  },
  {
    id: 4,
    title: "Ready to go!",
    description: "Your SaaS analytics dashboard is now ready to use.",
    icon: <Check className="h-5 w-5" />,
  },
];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const navigate = useNavigate();

  const handleNextStep = () => {
    // Add current step to completed array
    setCompleted((prev) => [...prev, currentStep]);

    // Move to next step or finish onboarding
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Onboarding completed, redirect to dashboard
      navigate("/dashboard");
    }
  };

  const handleSkip = () => {
    // Skip onboarding and redirect to dashboard
    navigate("/dashboard");
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-100 to-indigo-200 flex flex-col">
      {/* Onboarding Header */}
      <header className="px-6 py-4 border-b border-purple-100 bg-white/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-lg px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-700 text-white text-xl font-extrabold tracking-tight shadow-md">
            Saaslyzer
          </span>
        </div>
        <Button variant="outline" className="text-purple-700" onClick={handleSkip}>
          Skip setup
        </Button>
      </header>

      {/* Progress Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="w-full bg-white/50 rounded-full h-2.5 mb-6">
          <div 
            className="bg-gradient-to-r from-indigo-600 to-purple-700 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mb-10">
          {ONBOARDING_STEPS.map((step, index) => (
            <div 
              key={step.id} 
              className={`flex flex-col items-center ${index <= currentStep ? "text-purple-700 font-medium" : ""}`}
            >
              <div 
                className={`w-6 h-6 rounded-full mb-2 flex items-center justify-center
                  ${completed.includes(index) 
                    ? "bg-green-500 text-white" 
                    : index === currentStep 
                    ? "bg-purple-600 text-white" 
                    : "bg-gray-200"}`}
              >
                {completed.includes(index) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="hidden sm:block">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="flex-1 container mx-auto px-4 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
          <h2 className="text-2xl font-bold text-purple-800 mb-4">{currentStepData.title}</h2>
          <p className="text-gray-600 mb-8">{currentStepData.description}</p>
          
          {/* Content will vary based on step */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <p>Welcome to Saaslyzer! We're excited to help you gain insights into your SaaS business.</p>
              <p>This quick setup will guide you through connecting your data sources and customizing your analytics dashboard.</p>
            </div>
          )}
          
          {currentStep === 1 && (
            <div className="space-y-4">
              <p>Connect your Stripe account to automatically import all your subscription data.</p>
              <div className="flex items-center p-3 border rounded-lg border-purple-200 bg-purple-50">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 12H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8L8 12L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="ml-3 font-medium">Connect Stripe Account</span>
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="space-y-4">
              <p>Customize which metrics are displayed prominently on your dashboard:</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="border rounded-md p-3 flex items-start space-x-2">
                  <input type="checkbox" id="mrr" className="mt-1" defaultChecked />
                  <label htmlFor="mrr">
                    <div className="font-medium">Monthly Recurring Revenue</div>
                    <div className="text-sm text-gray-500">Track your MRR growth</div>
                  </label>
                </div>
                <div className="border rounded-md p-3 flex items-start space-x-2">
                  <input type="checkbox" id="churn" className="mt-1" defaultChecked />
                  <label htmlFor="churn">
                    <div className="font-medium">Customer Churn</div>
                    <div className="text-sm text-gray-500">Monitor customer retention</div>
                  </label>
                </div>
                <div className="border rounded-md p-3 flex items-start space-x-2">
                  <input type="checkbox" id="ltv" className="mt-1" defaultChecked />
                  <label htmlFor="ltv">
                    <div className="font-medium">Customer Lifetime Value</div>
                    <div className="text-sm text-gray-500">Calculate LTV metrics</div>
                  </label>
                </div>
                <div className="border rounded-md p-3 flex items-start space-x-2">
                  <input type="checkbox" id="growth" className="mt-1" defaultChecked />
                  <label htmlFor="growth">
                    <div className="font-medium">Growth Rate</div>
                    <div className="text-sm text-gray-500">Track acquisition trends</div>
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="space-y-4">
              <p>Congratulations! Your SaaS analytics dashboard is ready.</p>
              <p>You can now access all your key metrics and start making data-driven decisions.</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 flex items-center">
                <Check className="h-5 w-5 mr-2 text-green-500" />
                <span>Setup completed successfully!</span>
              </div>
            </div>
          )}
          
          <div className="mt-12 flex justify-between">
            <Button
              variant={currentStep === 0 ? "ghost" : "outline"}
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="text-purple-700"
            >
              {currentStep === 0 ? "" : "Back"}
            </Button>
            <Button
              onClick={handleNextStep}
              className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-md"
            >
              {currentStep < ONBOARDING_STEPS.length - 1 ? (
                <>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                "Get Started"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
