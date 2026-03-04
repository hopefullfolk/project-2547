import React, { useState, Children, useRef, useLayoutEffect } from 'react'
import type { HTMLAttributes, ReactNode } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  backButtonText?: string;
  nextButtonText?: string;
  disableStepIndicators?: boolean;
  /** Async validation — return true to allow step change, false to block */
  validateStep?: (nextStep: number, currentStep: number) => Promise<boolean>;
  isSubmitting?: boolean;
}

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  backButtonText = 'Back',
  nextButtonText = 'Continue',
  disableStepIndicators = false,
  validateStep,
  isSubmitting = false,
  ...rest
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [direction, setDirection] = useState<number>(0);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep);
    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  const handleNext = async () => {
    if (validateStep) {
      const allowed = await validateStep(currentStep + 1, currentStep);
      if (!allowed) return;
    }
    setDirection(1);
    updateStep(currentStep + 1);
  };

  const handleComplete = async () => {
    if (validateStep) {
      const allowed = await validateStep(totalSteps + 1, currentStep);
      if (!allowed) return;
    }
    setDirection(1);
    updateStep(totalSteps + 1);
  };

  return (
    <div
      className="w-full rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl border border-border/50 overflow-hidden"
      {...rest}
    >
      {/* ── Step Indicators ── */}
      <div className="flex items-center px-6 sm:px-10 lg:px-14 py-6 sm:py-8 border-b border-border/30">
        {stepsArray.map((_, index) => {
          const stepNumber = index + 1;
          const isNotLastStep = index < totalSteps - 1;
          return (
            <React.Fragment key={stepNumber}>
              <StepIndicator
                step={stepNumber}
                currentStep={currentStep}
                disabled={disableStepIndicators}
                onClickStep={async (clicked) => {
                  if (validateStep && clicked > currentStep) {
                    const allowed = await validateStep(clicked, currentStep);
                    if (!allowed) return;
                  }
                  setDirection(clicked > currentStep ? 1 : -1);
                  updateStep(clicked);
                }}
              />
              {isNotLastStep && <StepConnector isComplete={currentStep > stepNumber} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Step Content ── */}
      <StepContentWrapper
        isCompleted={isCompleted}
        currentStep={currentStep}
        direction={direction}
      >
        {stepsArray[currentStep - 1]}
      </StepContentWrapper>

      {/* ── Footer ── */}
      {!isCompleted && (
        <div className="px-6 sm:px-10 lg:px-14 pb-8 sm:pb-10 pt-4">
          <div className={`flex ${currentStep > 1 ? 'justify-between' : 'justify-end'}`}>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="rounded-lg px-4 sm:px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all disabled:opacity-50"
              >
                {backButtonText}
              </button>
            )}
            <button
              type={isLastStep ? 'submit' : 'button'}
              onClick={isLastStep ? handleComplete : handleNext}
              disabled={isSubmitting}
              className="rounded-lg bg-accent px-6 sm:px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-accent/90 hover:shadow-md active:bg-accent/80 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && isLastStep ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : isLastStep ? (
                'Submit Request'
              ) : (
                nextButtonText
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Animated Content Wrapper ─── */

function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  children,
}: {
  isCompleted: boolean;
  currentStep: number;
  direction: number;
  children: ReactNode;
}) {
  const [height, setHeight] = useState<number>(0);

  return (
    <motion.div
      className="relative overflow-hidden"
      animate={{ height: isCompleted ? 0 : height }}
      transition={{ type: 'spring', duration: 0.4 }}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition
            key={currentStep}
            direction={direction}
            onHeightReady={h => setHeight(h)}
          >
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SlideTransition({
  children,
  direction,
  onHeightReady,
}: {
  children: ReactNode;
  direction: number;
  onHeightReady: (h: number) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (ref.current) onHeightReady(ref.current.offsetHeight);
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={ref}
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35 }}
      style={{ position: 'absolute', left: 0, right: 0, top: 0 }}
    >
      {/* Padding INSIDE the absolutely-positioned slide */}
      <div className="px-6 sm:px-10 lg:px-14 pt-8 sm:pt-10 pb-6">
        {children}
      </div>
    </motion.div>
  );
}

const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir >= 0 ? '-100%' : '100%', opacity: 0 }),
  center: { x: '0%', opacity: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? '50%' : '-50%', opacity: 0 }),
};

/* ─── Step Indicator ─── */

function StepIndicator({
  step,
  currentStep,
  onClickStep,
  disabled,
}: {
  step: number;
  currentStep: number;
  onClickStep: (s: number) => void;
  disabled: boolean;
}) {
  const status: 'active' | 'complete' | 'inactive' =
    currentStep === step ? 'active' : currentStep > step ? 'complete' : 'inactive';

  return (
    <motion.button
      type="button"
      onClick={() => !disabled && step !== currentStep && onClickStep(step)}
      className="relative flex-shrink-0 outline-none focus:outline-none"
      animate={status}
      initial={false}
    >
      <motion.div
        variants={{
          inactive: { scale: 1, backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' },
          active:   { scale: 1, backgroundColor: 'hsl(var(--accent))', color: '#fff' },
          complete: { scale: 1, backgroundColor: 'hsl(var(--accent))', color: '#fff' },
        }}
        transition={{ duration: 0.25 }}
        className="flex h-9 w-9 sm:h-10 sm:w-10 cursor-pointer items-center justify-center rounded-full text-xs sm:text-sm font-semibold"
      >
        {status === 'complete' ? (
          <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : status === 'active' ? (
          <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-white" />
        ) : (
          <span>{step}</span>
        )}
      </motion.div>
    </motion.button>
  );
}

/* ─── Connector Line ─── */

function StepConnector({ isComplete }: { isComplete: boolean }) {
  return (
    <div className="relative mx-1.5 sm:mx-3 h-[2px] flex-1 rounded-full bg-border/60">
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full bg-accent"
        initial={false}
        animate={{ width: isComplete ? '100%' : '0%' }}
        transition={{ duration: 0.35 }}
      />
    </div>
  );
}

/* ─── Check Icon ─── */

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.1, type: 'tween', ease: 'easeOut', duration: 0.3 }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

/* ─── Step Wrapper (required export) ─── */

export function Step({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}