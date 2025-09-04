import { ResponsiveDialog } from "@/components/responsive-dialog";
import { AgentForm } from "./agent-form";

interface NewAgentsDialog{
    open: boolean,
    onOpenChange: (open: boolean) => void;
};

export const NewAgentsDialog = ({
    open, 
    onOpenChange
}: NewAgentsDialog) => {
    return (
        <ResponsiveDialog
        title="New Agent"
        description="Create a new agent"
        open={open}
        onOpenChange={onOpenChange}
            >
               <AgentForm
               onSuccess={()=> onOpenChange(false)}
               onCancel={()=> onOpenChange(false)}
               />
            </ResponsiveDialog>
    );
}