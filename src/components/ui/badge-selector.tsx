import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, Star, Sparkles, GraduationCap } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { motion, AnimatePresence } from "framer-motion";

export interface SelectedSkill {
  name: string;
  proficiencyLevel?: string;
  desiredProficiencyLevel?: string;
}

interface BadgeSelectorProps {
  options: string[];
  selected: SelectedSkill[];
  onChange: (selected: SelectedSkill[]) => void;
  maxSelections?: number;
  type: "skill" | "desiredSkill";
}

const PROFICIENCY_LEVELS = [
  {
    value: "Beginner",
    label: "Beginner",
    icon: GraduationCap,
    color: "text-blue-500",
  },
  {
    value: "Intermediate",
    label: "Intermediate",
    icon: Star,
    color: "text-yellow-500",
  },
  {
    value: "Advanced",
    label: "Advanced",
    icon: Sparkles,
    color: "text-purple-500",
  },
];

export function BadgeSelector({
  options,
  selected,
  onChange,
  maxSelections = 5,
  type,
}: BadgeSelectorProps) {
  const toggleSkill = (skillName: string) => {
    const existingSkill = selected.find((s) => s.name === skillName);
    if (existingSkill) {
      onChange(selected.filter((s) => s.name !== skillName));
    } else if (selected.length < maxSelections) {
      const newSkill: SelectedSkill = {
        name: skillName,
        ...(type === "skill"
          ? { proficiencyLevel: "Beginner" }
          : { desiredProficiencyLevel: "Beginner" }),
      };
      onChange([...selected, newSkill]);
    }
  };

  const updateProficiency = (skillName: string, level: string) => {
    onChange(
      selected.map((skill) =>
        skill.name === skillName
          ? {
              ...skill,
              ...(type === "skill"
                ? { proficiencyLevel: level }
                : { desiredProficiencyLevel: level }),
            }
          : skill
      )
    );
  };

  return (
    <div className="flex flex-wrap gap-4">
      {options.map((skillName) => {
        const selectedSkill = selected.find((s) => s.name === skillName);
        const isSelected = !!selectedSkill;
        const currentLevel =
          type === "skill"
            ? selectedSkill?.proficiencyLevel
            : selectedSkill?.desiredProficiencyLevel;

        return (
          <motion.div
            key={skillName}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "relative flex flex-col gap-2 rounded-lg border p-4 transition-colors duration-200",
              isSelected
                ? "border-primary/50 bg-primary/5 shadow-sm"
                : "border-muted hover:border-muted-foreground/25"
            )}
          >
            <AnimatePresence>
              {isSelected && currentLevel && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute -top-2 -left-2 rounded-full bg-primary p-1"
                >
                  <Check className="h-3 w-3 text-primary-foreground" />
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => toggleSkill(skillName)}
              className={cn(
                "group relative cursor-pointer transition-opacity duration-200",
                selected.length >= maxSelections &&
                  !isSelected &&
                  "opacity-50 cursor-not-allowed"
              )}
              disabled={selected.length >= maxSelections && !isSelected}
            >
              <Badge
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "w-full px-3 py-1.5 text-sm font-medium transition-all duration-200",
                  isSelected ? "text-center" : "text-left"
                )}
              >
                <span className="inline-block w-full text-center">
                  {skillName}
                </span>
              </Badge>
            </button>

            <AnimatePresence>
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <ToggleGroup
                    type="single"
                    value={currentLevel}
                    onValueChange={(value) => {
                      if (value) updateProficiency(skillName, value);
                    }}
                    className="flex justify-between gap-1.5"
                  >
                    {PROFICIENCY_LEVELS.map((level) => {
                      const Icon = level.icon;
                      const isActive = currentLevel === level.value;
                      return (
                        <ToggleGroupItem
                          key={level.value}
                          value={level.value}
                          size="sm"
                          className={cn(
                            "flex-1 gap-1.5 transition-all duration-200",
                            isActive && level.color
                          )}
                          aria-label={level.value}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span className="text-xs">{level.label}</span>
                        </ToggleGroupItem>
                      );
                    })}
                  </ToggleGroup>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
