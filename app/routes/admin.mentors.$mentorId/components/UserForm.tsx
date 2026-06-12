import { Form, useSubmit } from "react-router";
import React from "react";

import { DateInput, Input, Message, Radio, Select } from "~/components";

import { ProfileInput } from "./ProfileInput";

interface Props {
  user: {
    profilePicturePath: string | null;
    fullName: string;
    email: string;
    azureADId: string | null;
    chapterId: number;
    firstName: string;
    lastName: string;
    preferredName: string | null;
    mobile: string;
    addressStreet: string;
    addressSuburb: string;
    addressState: string;
    addressPostcode: string;
    dateOfBirth: Date | null;
    emergencyContactName: string | null;
    emergencyContactNumber: string | null;
    emergencyContactAddress: string | null;
    emergencyContactRelationship: string | null;
    additionalEmail: string | null;
    hasApprovedToPublishPhotos: boolean | null; // conceptually a boolean, but a string really
    frequency: string;
  };
  chapters: {
    id: number;
    name: string;
  }[];
  successMessage?: string | null;
  errorMessage?: string | null;
}

export function UserForm({
  user,
  chapters,
  successMessage,
  errorMessage,
}: Props) {
  const [isEditing, setIsEditing] = React.useState(false);

  const initialData = React.useMemo(() => user, [user]);

  const [formData, setFormData] = React.useState(user);

  const submit = useSubmit();

  // Bumped on every save so the <Message> banner remounts (and re-shows)
  // even when the action returns the same message text twice in a row.
  const [saveCount, setSaveCount] = React.useState(0);

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  // Generic handler to capture changes from inputs
  // This converts the components into Controlled Components during "Editing" phase.
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    if (!isEditing) {
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  React.useEffect(() => {
    // Resync local form state when the loader data changes from outside
    // (e.g. a sibling fetcher revalidates the route after a checklist delete
    // or a profile-picture change). Skip while editing so an external
    // revalidation cannot silently wipe the user's unsaved edits.
    if (isEditing) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(user);
  }, [user, isEditing]);

  const handleCancel = () => {
    if (!confirm("Cancel changing the details?")) {
      return;
    }
    // Discard unsaved changes by reverting state to original props
    setIsEditing(false);
    setFormData(initialData);
  };

  const handleSave = (evt: React.SubmitEvent<HTMLFormElement>) => {
    evt.preventDefault();

    submit(evt.currentTarget).catch((error) =>
      console.error("Error saving profile details", error),
    );

    setSaveCount((n) => n + 1);
    setIsEditing(false); // Return to read-only mode on success
  };

  return (
    <Form
      onSubmit={handleSave}
      method="post"
      className="border-primary relative mb-8 flex-1 overflow-y-auto md:mr-8 md:mb-0 md:border-r md:pr-4"
    >
      <fieldset className="fieldset">
        <input type="hidden" name="intent" value="profile-details" />

        <ProfileInput
          defaultValue={formData.profilePicturePath}
          fullName={formData.fullName}
          disabled={!isEditing}
        />

        <Input
          type="email"
          value={formData.email}
          label="Email"
          name="email"
          disabled={formData.azureADId !== null}
          required
          onChange={handleChange}
          readOnly={!isEditing}
        />

        <Select
          name="chapterId"
          label="Chapter"
          value={formData.chapterId.toString()}
          required
          options={[{ value: "", label: "Select a chapter" }].concat(
            chapters.map(({ id, name }) => ({
              label: name,
              value: id.toString(),
            })),
          )}
          onChange={handleChange}
          disabled={!isEditing}
        />

        <Select
          name="frequency"
          label="Preferred frequency"
          value={formData.frequency}
          options={[
            { value: "", label: "Not specified" },
            { value: "FORTNIGHTLY", label: "Fortnightly" },
            { value: "WEEKLY", label: "Weekly" },
          ]}
          onChange={handleChange}
          disabled={!isEditing}
        />

        <Input
          value={formData.firstName}
          label="First name"
          name="firstName"
          required
          onChange={handleChange}
          readOnly={!isEditing}
        />

        <Input
          value={formData.preferredName ?? ""}
          label="Preferred name"
          name="preferredName"
          onChange={handleChange}
          readOnly={!isEditing}
        />

        <Input
          value={formData.lastName}
          label="Last name"
          name="lastName"
          required
          onChange={handleChange}
          readOnly={!isEditing}
        />

        <Input
          value={formData.mobile}
          label="Mobile"
          name="mobile"
          required
          onChange={handleChange}
          readOnly={!isEditing}
        />

        <Input
          value={formData.addressStreet}
          label="Address street"
          name="addressStreet"
          required
          onChange={handleChange}
          readOnly={!isEditing}
        />

        <Input
          value={formData.addressSuburb}
          label="Address suburb"
          name="addressSuburb"
          required
          onChange={handleChange}
          readOnly={!isEditing}
        />

        <Input
          value={formData.addressState}
          label="Address state"
          name="addressState"
          required
          onChange={handleChange}
          readOnly={!isEditing}
        />

        <Input
          value={formData.addressPostcode}
          label="Address postcode"
          name="addressPostcode"
          required
          onChange={handleChange}
          readOnly={!isEditing}
        />

        <DateInput
          value={formData.dateOfBirth}
          label="Date of birth"
          name="dateOfBirth"
          onChange={handleChange}
          readOnly={!isEditing}
        />

        <Input
          value={formData.emergencyContactName ?? ""}
          label="Emergency contact name"
          name="emergencyContactName"
          onChange={handleChange}
          readOnly={!isEditing}
        />

        <Input
          value={formData.emergencyContactNumber ?? ""}
          label="Emergency contact number"
          name="emergencyContactNumber"
          onChange={handleChange}
          readOnly={!isEditing}
        />

        <Input
          value={formData.emergencyContactAddress ?? ""}
          label="Emergency contact address"
          name="emergencyContactAddress"
          onChange={handleChange}
          readOnly={!isEditing}
        />

        <Input
          value={formData.emergencyContactRelationship ?? ""}
          label="Emergency contact relationship"
          name="emergencyContactRelationship"
          onChange={handleChange}
          readOnly={!isEditing}
        />

        <Input
          type="email"
          value={formData.additionalEmail ?? ""}
          label="Additional email"
          name="additionalEmail"
          onChange={handleChange}
          readOnly={!isEditing}
        />

        <Radio
          label="Permission to publish photos?"
          name="hasApprovedToPublishPhotos"
          value={formData.hasApprovedToPublishPhotos?.toString() ?? ""}
          options={[
            {
              label: "Yes",
              value: "true",
            },
            {
              label: "No",
              value: "false",
            },
          ]}
          onChange={handleChange}
          disabled={!isEditing}
        />

        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-4">
          <Message
            key={saveCount}
            successMessage={successMessage}
            errorMessage={errorMessage}
          />

          {isEditing ? (
            <div className="flex gap-4">
              <button className="btn btn-primary w-48" type="submit">
                Save
              </button>
              <button
                className="btn btn-primary w-48"
                type="button"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary w-48"
              type="button"
              onClick={handleStartEditing}
            >
              Edit
            </button>
          )}
        </div>
      </fieldset>
    </Form>
  );
}
