import { prisma } from "~/db.server";

export async function getUserByIdAsync(id: number) {
  return await prisma.volunteer.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      fullName: true,
      endDate: true,
      volunteerNotes: {
        select: {
          note: true,
        },
      },
    },
  });
}
