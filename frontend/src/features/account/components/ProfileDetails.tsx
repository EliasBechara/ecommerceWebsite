import { Button } from "../../../components/button/Button";
import { FormField } from "../../../components/FormField"
import { FormSection } from "./FormSection";

export const ProfileDetails = () => {
    return (
        <FormSection title="Profile Details">
            <div className="grid grid-cols-2 gap-4">
                <FormField label="First Name" placeholder="First name" />
                <FormField label="Last Name" placeholder="Last name" />
                <FormField label="Phone Number" placeholder="Phone number" />
            </div>
            <Button variant={'profileSettings'}>Save Changes</Button>
        </FormSection>
    );
};