import { useRef, useState } from "react";

import { useFetcher } from "react-router";
import { Xmark } from "iconoir-react";

interface Props {
  defaultValue: string | null;
  fullName: string;
  disabled: boolean | null;
}

const PROFILE_PHOTO_MAX_SIZE = 1000000; // would be nice to humanise in error message

export function ProfileInput({ defaultValue, fullName, disabled }: Props) {
  const fetcher = useFetcher();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [profilePicturePath, setProfilePicturePath] = useState<string | null>(
    defaultValue,
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const hasImage = selectedImage ?? profilePicturePath;

  const removeProfilePic = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }

    e.preventDefault();

    if (!confirm("Are you sure?")) {
      return;
    }

    if (inputRef.current) {
      inputRef.current.files = null;
      inputRef.current.value = "";
    }
    setSelectedImage(null);
    setProfilePicturePath(null);

    const formData = new FormData();
    formData.append("intent", "profile-picture");
    formData.append("profilePicture", "DELETE");

    void fetcher.submit(formData, {
      method: "POST",
      encType: "multipart/form-data",
    });
  };

  const addProfilePic = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }

    const file = e.target.files?.[0] ?? null;

    if (file === null) {
      alert("Please upload a file.");
      e.currentTarget.value = "";
      return;
    }

    if (file.size > PROFILE_PHOTO_MAX_SIZE) {
      alert(`File too big, maximum accepted is 1MB`);
      e.currentTarget.value = "";
      return;
    }

    if (
      file.type !== "image/png" &&
      file.type !== "image/gif" &&
      file.type !== "image/jpeg"
    ) {
      alert("Incorrect format.");
      e.currentTarget.value = "";
      return;
    }

    setSelectedImage(file);

    const formData = new FormData();
    formData.append("intent", "profile-picture");
    formData.append("profilePicture", file);

    void fetcher.submit(formData, {
      method: "POST",
      encType: "multipart/form-data",
    });
  };

  return (
    <div className="card card-side bg-base-100 m-8 shadow-xl">
      <figure className="border">
        <img
          src={
            selectedImage
              ? URL.createObjectURL(selectedImage)
              : (profilePicturePath ?? "/images/profile-picture.webp")
          }
          alt="profile"
          className="h-44 w-44"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title mb-4">{fullName}</h2>

        {hasImage && (
          <button
            className="btn btn-error w-32 gap-2"
            onClick={removeProfilePic}
            disabled={!!disabled}
          >
            <Xmark className="h-6 w-6" />
            Remove
          </button>
        )}

        <input
          type="file"
          // Deliberately unnamed: this widget submits via its own fetcher with
          // intent=profile-picture. An unnamed input never leaks the file into
          // the surrounding profile-details form submit.
          className={hasImage ? "hidden" : "file-input w-full max-w-xs"}
          ref={inputRef}
          accept="image/png, image/gif, image/jpeg"
          onChange={addProfilePic}
          disabled={!!disabled}
        />
      </div>
    </div>
  );
}
