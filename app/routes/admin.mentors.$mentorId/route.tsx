import type { AzureUserWebAppWithRole } from "~/services/.server";
import type { MentorCommand } from "~/domain/aggregates/mentor/Mentor";
import type { Route } from "./+types/route";

import invariant from "tiny-invariant";
import { NavArrowRight } from "iconoir-react";
import { parseFormData } from "@mjackson/form-data-parser";

import {
  deleteUserProfilePicture,
  getAzureUserWithRolesByIdAsync,
  getUserProfilePictureUrl,
  memoryHandlerDispose,
  saveUserProfilePicture,
  uploadHandler,
} from "~/services/.server";
import { isDateExpired, isStringNullOrEmpty } from "~/services";
import { StateLink } from "~/components";

import {
  getUserByIdAsync,
  updateMentorByIdAsync,
  getChaptersAsync,
  removeWelcomeCall,
  removeInduction,
  removePoliceCheck,
  removeWwccheck,
  removeApprovalMrc,
} from "./services.server";
import { UserForm, CheckList, Header } from "./components";

export async function loader({ request, params }: Route.LoaderArgs) {
  invariant(params.mentorId, "mentorId not found");

  const user = await getUserByIdAsync(Number(params.mentorId));

  let azureUserInfo: AzureUserWebAppWithRole | null = null;
  if (user.azureADId !== null) {
    azureUserInfo = await getAzureUserWithRolesByIdAsync(
      request,
      user.azureADId,
    );
  }

  const profilePicturePath = user?.profilePicturePath
    ? getUserProfilePictureUrl(user.profilePicturePath)
    : null;

  const chapters = await getChaptersAsync();

  return {
    user: {
      ...user,
      profilePicturePath,
      frequency:
        user.frequencyInDays === 14
          ? "FORTNIGHTLY"
          : user.frequencyInDays === 7
            ? "WEEKLY"
            : "",
    },
    isWwcCheckExpired: isDateExpired(user.wwcCheck?.expiryDate),
    isPoliceCheckExpired: isDateExpired(user.policeCheck?.expiryDate),
    welcomeCallCompleted: user.welcomeCall !== null,
    references: user.references,
    inductionCompleted: user.induction !== null,
    policeCheckCompleted: user.policeCheck !== null,
    wwcCheckCompleted: user.wwcCheck !== null,
    approvalbyMRCCompleted: user.approvalbyMRC !== null,
    volunteerAgreementSignedOn: user.volunteerAgreementSignedOn,
    mentorAppRoleAssignmentId:
      azureUserInfo?.appRoleAssignments.find(
        ({ roleName }) => roleName === "Mentor",
      )?.id ?? null,
    chapters,
  };
}

interface ActionResult {
  intent: "delete-check" | "profile-picture" | "profile-details";
  successMessage: string | null;
  errorMessage: string | null;
}

async function deleteCheck(
  mentorId: number,
  formData: FormData,
): Promise<ActionResult> {
  const intent = "delete-check";
  const check = formData.get("check")?.toString();

  switch (check) {
    case "welcomeCall":
      await removeWelcomeCall(mentorId);
      break;

    case "induction":
      await removeInduction(mentorId);
      break;

    case "police-check":
      await removePoliceCheck(mentorId);
      break;

    case "wwc-check":
      await removeWwccheck(mentorId);
      break;

    case "approval-mrc":
      await removeApprovalMrc(mentorId);
      break;

    default:
      return {
        intent,
        successMessage: null,
        errorMessage: `Unknown check: "${check}"`,
      };
  }

  return {
    intent,
    successMessage: "Deleted successfully!",
    errorMessage: null,
  };
}

async function updateProfilePicture(
  mentorId: number,
  formData: FormData,
): Promise<ActionResult> {
  const intent = "profile-picture";
  const profilePicture = formData.get("profilePicture");

  if (profilePicture === "DELETE") {
    await deleteUserProfilePicture(mentorId);

    return {
      intent,
      successMessage: "Profile picture deleted successfully!",
      errorMessage: null,
    };
  }

  if (profilePicture instanceof File && profilePicture.size > 0) {
    await saveUserProfilePicture(mentorId, profilePicture);

    memoryHandlerDispose("profilePicture");

    return {
      intent,
      successMessage: "Profile picture updated successfully!",
      errorMessage: null,
    };
  }

  return {
    intent,
    successMessage: null,
    errorMessage: "No profile picture provided.",
  };
}

async function updateProfileDetails(
  mentorId: number,
  formData: FormData,
): Promise<ActionResult> {
  const intent = "profile-details";

  const chapterId = formData.get("chapterId")?.toString();
  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();
  const preferredName = formData.get("preferredName")?.toString();
  const email = formData.get("email")?.toString();
  const mobile = formData.get("mobile")?.toString();

  const addressStreet = formData.get("addressStreet")?.toString();
  const addressSuburb = formData.get("addressSuburb")?.toString();
  const addressState = formData.get("addressState")?.toString();
  const addressPostcode = formData.get("addressPostcode")?.toString();

  const dateOfBirth = formData.get("dateOfBirth")?.toString();
  const additionalEmail = formData.get("additionalEmail")?.toString();

  const frequency = formData.get("frequency")?.toString() ?? "";

  const emergencyContactName = formData.get("emergencyContactName")?.toString();
  const emergencyContactNumber = formData
    .get("emergencyContactNumber")
    ?.toString();
  const emergencyContactAddress = formData
    .get("emergencyContactAddress")
    ?.toString();
  const emergencyContactRelationship = formData
    .get("emergencyContactRelationship")
    ?.toString();

  const hasApprovedToPublishPhotos = formData
    .get("hasApprovedToPublishPhotos")
    ?.toString();

  if (
    isStringNullOrEmpty(firstName) ||
    isStringNullOrEmpty(lastName) ||
    isStringNullOrEmpty(mobile) ||
    isStringNullOrEmpty(addressStreet) ||
    isStringNullOrEmpty(addressSuburb) ||
    isStringNullOrEmpty(addressState) ||
    isStringNullOrEmpty(addressPostcode)
  ) {
    return {
      intent,
      successMessage: null,
      errorMessage: "Missing required fields.",
    };
  }

  const dataCreate: MentorCommand = {
    firstName,
    lastName,
    mobile,
    addressStreet,
    addressSuburb,
    addressState,
    addressPostcode,
    additionalEmail: isStringNullOrEmpty(additionalEmail)
      ? null
      : additionalEmail.trim(),
    dateOfBirth: isStringNullOrEmpty(dateOfBirth)
      ? null
      : new Date(dateOfBirth + "T00:00"),
    emergencyContactName: emergencyContactName ?? null,
    emergencyContactNumber: emergencyContactNumber ?? null,
    emergencyContactAddress: emergencyContactAddress ?? null,
    emergencyContactRelationship: emergencyContactRelationship ?? null,
    chapterId: Number(chapterId),
    preferredName: isStringNullOrEmpty(preferredName) ? null : preferredName,
    frequencyInDays:
      frequency === "FORTNIGHTLY" ? 14 : frequency === "WEEKLY" ? 7 : null,
    hasApprovedToPublishPhotos: hasApprovedToPublishPhotos === "true",
  };

  await updateMentorByIdAsync(mentorId, dataCreate, email);

  return {
    intent,
    successMessage: "User successfully saved!",
    errorMessage: null,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.mentorId, "mentorId not found");
  const mentorId = Number(params.mentorId);

  // Three independent mutation sources post to this route:
  // - the profile details form (navigation submit)
  // - the profile picture widget (fetcher)
  // - the checklist deletes (fetcher)
  // Each declares an explicit `intent` field for clarity.
  // Only the profile picture upload is multipart; everything else is urlencoded.
  const formData = request.headers
    .get("content-type")
    ?.includes("multipart/form-data")
    ? await parseFormData(request, uploadHandler)
    : await request.formData();

  const intent = formData.get("intent")?.toString();

  switch (intent) {
    case "delete-check":
      return await deleteCheck(mentorId, formData);

    case "profile-picture":
      return await updateProfilePicture(mentorId, formData);

    case "profile-details":
      return await updateProfileDetails(mentorId, formData);

    default:
      throw new Response(`Unknown form intent: "${intent ?? ""}"`, {
        status: 400,
      });
  }
}

export default function Index({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  // Fetcher-based mutations (checklist deletes, profile picture) read their
  // results from their own fetcher.data; only the profile-details navigation
  // submit surfaces through actionData. Guard by intent so a result from one
  // source can never be displayed as feedback for another.
  const profileDetailsResult =
    actionData?.intent === "profile-details" ? actionData : undefined;

  return (
    <div className="flex h-full flex-col">
      <Header
        chapterId={loaderData.user.chapterId}
        mentorId={loaderData.user.id}
        endDate={loaderData.user.endDate}
        mentorAppRoleAssignmentId={loaderData.mentorAppRoleAssignmentId}
      />

      <hr className="my-4" />

      <div className="content-area md:flex">
        <UserForm
          user={loaderData.user}
          chapters={loaderData.chapters}
          successMessage={profileDetailsResult?.successMessage}
          errorMessage={profileDetailsResult?.errorMessage}
        />

        <hr className="my-8 md:hidden" />

        <div className="flex-1 overflow-y-auto">
          <CheckList
            approvalbyMRCCompleted={loaderData.approvalbyMRCCompleted}
            inductionCompleted={loaderData.inductionCompleted}
            isPoliceCheckExpired={loaderData.isPoliceCheckExpired}
            isWwcCheckExpired={loaderData.isWwcCheckExpired}
            policeCheckCompleted={loaderData.policeCheckCompleted}
            references={loaderData.references}
            volunteerAgreementSignedOn={loaderData.volunteerAgreementSignedOn}
            welcomeCallCompleted={loaderData.welcomeCallCompleted}
            wwcCheckCompleted={loaderData.wwcCheckCompleted}
          />

          <hr className="my-4" />

          <div>
            <StateLink
              className="btn"
              to={`/admin/chapters/${loaderData.user.chapterId}/mentors/${loaderData.user.id}`}
            >
              Assign students <NavArrowRight />
            </StateLink>
          </div>
        </div>
      </div>
    </div>
  );
}
