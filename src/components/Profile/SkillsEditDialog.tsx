import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {BadgeSelector, SelectedSkill} from "@/components/ui/badge-selector";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import {User} from "@/types/user";
import {IT_SKILLS} from "@/pages/auth/skills";

interface SkillsEditDialogProps {
    open: boolean;
    onClose: () => void;
    user: User;
    onSave: (skills: SelectedSkill[]) => void;
}

export function SkillsEditDialog({ open, onClose, user, onSave }: SkillsEditDialogProps) {
    const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>(
        user.skills.map(skill => ({
            name: skill.name,
            proficiencyLevel: skill.proficiencyLevel
        }))
    );

    const handleSubmit = async () => {
        try {
            await onSave(selectedSkills);
            onClose();
        } catch (error) {
            console.error('Error saving skills:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Skills</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <BadgeSelector
                        options={IT_SKILLS}
                        selected={selectedSkills}
                        onChange={setSelectedSkills}
                        type="skill"
                        maxSelections={5}
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}