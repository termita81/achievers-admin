import { prisma } from "~/db.server";

export async function getUserByIdAsync(id: number) {
  return await prisma.volunteer.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      azureADId: true,
    },
  });
}

export async function updateAzureIdAsync(mentorId: number, azureADId: string) {
  await prisma.volunteer.update({
    where: {
      id: mentorId,
    },
    data: {
      azureADId,
    },
  });
}

export async function removeUserAccessAsync(mentorId: number) {
  await prisma.volunteer.update({
    where: {
      id: mentorId,
    },
    data: {
      azureADId: null,
    },
  });
}
