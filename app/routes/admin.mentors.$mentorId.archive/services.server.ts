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

export async function archiveUserAsync(volunteerId: number, endReason: string) {
  return await prisma.$transaction(async (tx) => {
    await tx.volunteerToStudentAssignement.deleteMany({
      where: {
        volunteerId,
      },
    });

    await tx.volunteerNote.create({
      data: {
        note: endReason,
        volunteerId,
      },
    });

    return await tx.volunteer.update({
      where: {
        id: volunteerId,
      },
      data: {
        azureADId: null,
        endDate: new Date(),
        status: "ARCHIVED",
      },
    });
  });
}
