import { prisma } from "~/db.server";
import { getLoggedUserInfoAsync } from "~/services/.server";

export async function getStudentsInChapterAsync(
  chapterId: number,
  mentorId: number,
) {
  return prisma.student.findMany({
    where: {
      endDate: null,
      chapterId,
      volunteerToStudentAssignement: {
        none: {
          volunteerId: mentorId,
        },
      },
    },
    select: {
      id: true,
      fullName: true,
    },
  });
}

export async function getMentorWithStudentsAsync(mentorId: number) {
  return prisma.volunteer.findFirstOrThrow({
    where: {
      endDate: null,
      id: mentorId,
    },
    select: {
      id: true,
      fullName: true,
      frequencyInDays: true,
      chapterId: true,
      volunteerToStudentAssignement: {
        select: {
          student: {
            select: {
              id: true,
              fullName: true,
              endDate: true,
            },
          },
        },
      },
    },
  });
}

export async function assignStudentToMentorAsync(
  request: Request,
  mentorId: number,
  studentId: number,
) {
  const loggedUser = await getLoggedUserInfoAsync(request);

  await prisma.volunteerToStudentAssignement.create({
    data: {
      volunteerId: mentorId,
      studentId,
      assignedBy: loggedUser.oid,
    },
  });
}

export async function removeMentorStudentAssignement(
  mentorId: number,
  studentId: number,
) {
  await prisma.volunteerToStudentAssignement.delete({
    where: {
      volunteerId_studentId: {
        volunteerId: mentorId,
        studentId,
      },
    },
  });
}
