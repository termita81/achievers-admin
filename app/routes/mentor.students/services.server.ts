import { prisma } from "~/db.server";
import { calculateYearLevel } from "~/services";

export async function getMentorStudentsAsync(azureADId: string) {
  const mentor = await prisma.volunteer.findUniqueOrThrow({
    where: {
      azureADId,
    },
    select: {
      id: true,
    },
  });

  const students = await prisma.volunteerToStudentAssignement.findMany({
    where: {
      volunteerId: mentor.id,
    },
    select: {
      student: {
        select: {
          id: true,
          fullName: true,
          dateOfBirth: true,
        },
      },
    },
  });

  return students.map(({ student }) => ({
    ...student,
    yearLevel: calculateYearLevel(student.dateOfBirth),
  }));
}
