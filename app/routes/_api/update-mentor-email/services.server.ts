import { prisma } from "~/db.server";
import {
  deleteAzureUserAsync,
  inviteInternalAchieversUserAsync,
  inviteMentorAsync,
} from "~/services/.server";

export async function isUniqueEmailAsync(email: string) {
  const count = await prisma.volunteer.count({
    where: {
      email,
    },
  });

  return count === 0;
}

export async function udpdateInvitedMentorEmailAsync(
  request: Request,
  id: number,
  email: string,
) {
  const volunteer = await prisma.volunteer.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      azureADId: true,
    },
  });

  if (volunteer.azureADId === null) {
    throw new Error("Volunteer is not part of Azure AD.");
  }

  await deleteAzureUserAsync(request, volunteer.azureADId);

  await prisma.volunteer.update({
    where: {
      id,
    },
    data: {
      email,
    },
  });

  let azureUserId: string;
  if (email.includes("achieversclubwa.org.au")) {
    const azureUser = await inviteInternalAchieversUserAsync(request, email);
    azureUserId = azureUser.id;
  } else {
    azureUserId = await inviteMentorAsync(request, email);
  }

  await prisma.volunteer.update({
    where: {
      id,
    },
    data: {
      azureADId: azureUserId,
    },
  });
}
