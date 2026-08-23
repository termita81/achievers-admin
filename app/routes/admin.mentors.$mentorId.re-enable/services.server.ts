import { prisma } from "~/db.server";

export async function getUserByIdAsync(id: number) {
  return await prisma.volunteer.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      fullName: true,
    },
  });
}

export async function updateEndDateAsync(volunteerId: number) {
  await prisma.volunteer.update({
    where: {
      id: volunteerId,
    },
    data: {
      endDate: null,
    },
  });
}
