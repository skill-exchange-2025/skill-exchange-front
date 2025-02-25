import * as React from "react";
import { Check, Circle, Dot } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const StepperContext = React.createContext<{
  index: number;
  onIndexChange: (index: number) => void;
}>({
  index: 0,
  onIndexChange: () => {},
});

export function Stepper({
  index,
  onIndexChange,
  children,
  className,
}: {
  index: number;
  onIndexChange: (index: number) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <StepperContext.Provider value={{ index, onIndexChange }}>
      <div className={cn("space-y-4", className)}>{children}</div>
    </StepperContext.Provider>
  );
}

export function StepperHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const steps = React.Children.toArray(children);
  const { index, onIndexChange } = React.useContext(StepperContext);

  return (
    <div className={cn("flex items-center", className)}>
      {steps.map((step, stepIndex) => (
        <React.Fragment key={stepIndex}>
          <div className="flex items-center gap-2">
            <StepIcon
              stepIndex={stepIndex}
              currentIndex={index}
              onClick={() => onIndexChange(stepIndex)}
              isClickable={true}
            />
            {step}
          </div>
          {stepIndex < steps.length - 1 && (
            <div className="flex-1 mx-2 h-0.5 bg-muted" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export function StepIcon({
  stepIndex,
  currentIndex,
  onClick,
  isClickable,
}: {
  stepIndex: number;
  currentIndex: number;
  onClick: () => void;
  isClickable: boolean;
}) {
  const status =
    stepIndex < currentIndex
      ? "completed"
      : stepIndex === currentIndex
      ? "current"
      : "upcoming";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      className={cn(
        "relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
        status === "completed" &&
          "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
        status === "current" && "border-primary",
        status === "upcoming" && "border-muted",
        isClickable && "cursor-pointer",
        !isClickable && "cursor-not-allowed opacity-50"
      )}
    >
      {status === "completed" && <Check className="h-4 w-4" />}
      {status === "current" && <Circle className="h-4 w-4" />}
      {status === "upcoming" && <Dot className="h-4 w-4" />}
    </button>
  );
}

export function Step({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col", className)}>{children}</div>;
}

export function StepperTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("font-medium", className)}>{children}</div>;
}

export function StepperDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </div>
  );
}

export function StepperContent({
  value,
  children,
  className,
}: {
  value: number;
  children: React.ReactNode;
  className?: string;
}) {
  const { index } = React.useContext(StepperContext);

  if (value !== index) {
    return null;
  }

  return <div className={className}>{children}</div>;
}

export function StepperFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between mt-8", className)}>
      {children}
    </div>
  );
}

export function StepperNext({
  onClick,
  disabled,
}: {
  onClick?: () => void;
  disabled?: boolean;
}) {
  const { index, onIndexChange } = React.useContext(StepperContext);
  return (
    <Button
      type="button"
      onClick={onClick || (() => onIndexChange(index + 1))}
      disabled={disabled}
    >
      Next
    </Button>
  );
}

export function StepperPrevious() {
  const { index, onIndexChange } = React.useContext(StepperContext);
  return (
    <Button
      variant="outline"
      type="button"
      onClick={() => onIndexChange(index - 1)}
      disabled={index === 0}
    >
      Previous
    </Button>
  );
}
