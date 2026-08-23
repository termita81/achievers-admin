import type { PrismaClient } from "~/prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/client";

export async function assignMentorsToStudentsAsync(
  tx: Omit<
    PrismaClient<never, undefined, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
  >,
) {
  await tx.volunteerToStudentAssignement.deleteMany();

  const volunteersAtChapter = await tx.volunteer.findMany();
  const studentsAtChapter = await tx.student.findMany();

  await tx.volunteerToStudentAssignement.createMany({
    data: [
      {
        volunteerId: volunteersAtChapter[0].id,
        studentId: studentsAtChapter[0].id,
        assignedBy: "test",
      },
      {
        volunteerId: volunteersAtChapter[0].id,
        studentId: studentsAtChapter[1].id,
        assignedBy: "test",
      },
      {
        volunteerId: volunteersAtChapter[0].id,
        studentId: studentsAtChapter[2].id,
        assignedBy: "test",
      },

      {
        volunteerId: volunteersAtChapter[1].id,
        studentId: studentsAtChapter[1].id,
        assignedBy: "test",
      },
      {
        volunteerId: volunteersAtChapter[2].id,
        studentId: studentsAtChapter[2].id,
        assignedBy: "test",
      },
    ],
  });
}
