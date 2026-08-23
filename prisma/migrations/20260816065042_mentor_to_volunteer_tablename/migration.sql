-- DropForeignKey
ALTER TABLE `ApprovalbyMRC` DROP FOREIGN KEY `ApprovalbyMRC_mentorId_fkey`;

-- DropForeignKey
ALTER TABLE `EoIProfile` DROP FOREIGN KEY `EoIProfile_mentorId_fkey`;

-- DropForeignKey
ALTER TABLE `Goal` DROP FOREIGN KEY `Goal_mentorId_fkey`;

-- DropForeignKey
ALTER TABLE `Goal` DROP FOREIGN KEY `Goal_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `ImportedHistory` DROP FOREIGN KEY `ImportedHistory_mentorId_fkey`;

-- DropForeignKey
ALTER TABLE `Induction` DROP FOREIGN KEY `Induction_mentorId_fkey`;

-- DropForeignKey
ALTER TABLE `MentorAttendance` DROP FOREIGN KEY `MentorAttendance_chapterId_fkey`;

-- DropForeignKey
ALTER TABLE `MentorAttendance` DROP FOREIGN KEY `MentorAttendance_mentorId_fkey`;

-- DropForeignKey
ALTER TABLE `MentorNote` DROP FOREIGN KEY `MentorNote_mentorId_fkey`;

-- DropForeignKey
ALTER TABLE `MentorResource` DROP FOREIGN KEY `MentorResource_mentorResourceCategoryId_fkey`;

-- DropForeignKey
ALTER TABLE `MentorSession` DROP FOREIGN KEY `MentorSession_chapterId_fkey`;

-- DropForeignKey
ALTER TABLE `MentorSession` DROP FOREIGN KEY `MentorSession_mentorId_fkey`;

-- DropForeignKey
ALTER TABLE `MentorShareInfo` DROP FOREIGN KEY `MentorShareInfo_mentorSharedToId_fkey`;

-- DropForeignKey
ALTER TABLE `MentorShareInfo` DROP FOREIGN KEY `MentorShareInfo_mentorSharingId_fkey`;

-- DropForeignKey
ALTER TABLE `MentorSkill` DROP FOREIGN KEY `MentorSkill_mentorId_fkey`;

-- DropForeignKey
ALTER TABLE `MentorToStudentAssignement` DROP FOREIGN KEY `MentorToStudentAssignement_mentorId_fkey`;

-- DropForeignKey
ALTER TABLE `PoliceCheck` DROP FOREIGN KEY `PoliceCheck_mentorId_fkey`;

-- DropForeignKey
ALTER TABLE `Reference` DROP FOREIGN KEY `Reference_mentorId_fkey`;

-- DropForeignKey
ALTER TABLE `Session` DROP FOREIGN KEY `Session_chapterId_fkey`;

-- DropForeignKey
ALTER TABLE `Session` DROP FOREIGN KEY `Session_mentorSessionId_fkey`;

-- DropForeignKey
ALTER TABLE `WelcomeCall` DROP FOREIGN KEY `WelcomeCall_mentorId_fkey`;

-- DropForeignKey
ALTER TABLE `WWCCheck` DROP FOREIGN KEY `WWCCheck_mentorId_fkey`;

-- DropIndex
DROP INDEX `ApprovalbyMRC_mentorId_key` ON `ApprovalbyMRC`;

-- DropIndex
DROP INDEX `EoIProfile_mentorId_key` ON `EoIProfile`;

-- DropIndex
DROP INDEX `Goal_mentorId_fkey` ON `Goal`;

-- DropIndex
DROP INDEX `Goal_studentId_mentorId_idx` ON `Goal`;

-- DropIndex
DROP INDEX `ImportedHistory_mentorId_key` ON `ImportedHistory`;

-- DropIndex
DROP INDEX `Induction_mentorId_key` ON `Induction`;

-- DropIndex
DROP INDEX `MentorAttendance_chapterId_mentorId_attendedOn_key` ON `MentorAttendance`;

-- DropIndex
DROP INDEX `MentorAttendance_mentorId_fkey` ON `MentorAttendance`;

-- DropIndex
DROP INDEX `MentorNote_mentorId_fkey` ON `MentorNote`;

-- DropIndex
DROP INDEX `MentorResource_mentorResourceCategoryId_fkey` ON `MentorResource`;

-- DropIndex
DROP INDEX `MentorSession_chapterId_mentorId_attendedOn_key` ON `MentorSession`;

-- DropIndex
DROP INDEX `MentorSession_mentorId_fkey` ON `MentorSession`;

-- DropIndex
DROP INDEX `MentorShareInfo_mentorSharedToId_fkey` ON `MentorShareInfo`;

-- DropIndex
DROP INDEX `MentorShareInfo_mentorSharingId_mentorSharedToId_key` ON `MentorShareInfo`;

-- DropIndex
DROP INDEX `MentorSkill_mentorId_fkey` ON `MentorSkill`;

-- DropIndex
DROP INDEX `MentorToStudentAssignement_mentorId_studentId_key` ON `MentorToStudentAssignement`;

-- DropIndex
DROP INDEX `PoliceCheck_mentorId_key` ON `PoliceCheck`;

-- DropIndex
DROP INDEX `Reference_mentorId_fkey` ON `Reference`;

-- DropIndex
DROP INDEX `Session_chapterId_mentorSessionId_studentSessionId_key` ON `Session`;

-- DropIndex
DROP INDEX `Session_mentorSessionId_fkey` ON `Session`;

-- DropIndex
DROP INDEX `WelcomeCall_mentorId_key` ON `WelcomeCall`;

-- DropIndex
DROP INDEX `WWCCheck_mentorId_key` ON `WWCCheck`;

-- AlterTable
ALTER TABLE `ApprovalbyMRC` RENAME COLUMN mentorId TO volunteerId;

-- AlterTable
ALTER TABLE `EoIProfile` RENAME COLUMN mentorId TO volunteerId;

-- AlterTable
ALTER TABLE `Goal` RENAME COLUMN mentorId TO volunteerId;

-- AlterTable
ALTER TABLE `ImportedHistory` RENAME COLUMN mentorId TO volunteerId;

-- AlterTable
ALTER TABLE `Induction` RENAME COLUMN mentorId TO volunteerId;

-- AlterTable
ALTER TABLE `MentorAttendance` RENAME COLUMN mentorId TO volunteerId;

-- AlterTable
ALTER TABLE `MentorNote` RENAME COLUMN mentorId TO volunteerId;

-- AlterTable
ALTER TABLE `MentorResource` RENAME COLUMN mentorResourceCategoryId TO volunteerResourceCategoryId;

-- AlterTable
ALTER TABLE `MentorSession` RENAME COLUMN mentorId TO volunteerId;

-- AlterTable
ALTER TABLE `MentorSkill` RENAME COLUMN mentorId TO volunteerId;

-- AlterTable
ALTER TABLE `MentorToStudentAssignement` RENAME COLUMN mentorId TO volunteerId;

-- AlterTable
ALTER TABLE `PoliceCheck` RENAME COLUMN mentorId TO volunteerId;

-- AlterTable
ALTER TABLE `Reference` RENAME COLUMN mentorId TO volunteerId;

-- AlterTable
ALTER TABLE `Session` RENAME COLUMN mentorSessionId TO volunteerSessionId;

-- AlterTable
ALTER TABLE `WelcomeCall` RENAME COLUMN mentorId TO volunteerId;

-- AlterTable
ALTER TABLE `WWCCheck` RENAME COLUMN mentorId TO volunteerId;

-- AlterTable
ALTER TABLE `MentorShareInfo` RENAME COLUMN mentorSharingId TO volunteerSharingId;

-- AlterTable
ALTER TABLE `MentorShareInfo` RENAME COLUMN mentorSharedToId TO volunteerSharedToId;

-- AlterTable
RENAME TABLE `MentorAttendance` TO `VolunteerAttendance`;

-- AlterTable
RENAME TABLE `MentorNote` TO `VolunteerNote`;

-- AlterTable
RENAME TABLE `MentorResource` TO `VolunteerResource`;

-- AlterTable
RENAME TABLE `MentorResourceCategory` TO `VolunteerResourceCategory`;

-- AlterTable
RENAME TABLE `MentorSession` TO `VolunteerSession`;

-- AlterTable
RENAME TABLE `MentorSkill` TO `VolunteerSkill`;

-- AlterTable
RENAME TABLE `MentorToStudentAssignement` TO `VolunteerToStudentAssignement`;

-- AlterTable
RENAME TABLE `Mentor` TO `Volunteer`;

-- AlterTable
RENAME TABLE `MentorShareInfo` TO `VolunteerShareInfo`;

-- CreateIndex
CREATE UNIQUE INDEX `ApprovalbyMRC_volunteerId_key` ON `ApprovalbyMRC`(`volunteerId`);

-- CreateIndex
CREATE UNIQUE INDEX `EoIProfile_volunteerId_key` ON `EoIProfile`(`volunteerId`);

-- CreateIndex
CREATE INDEX `Goal_studentId_volunteerId_idx` ON `Goal`(`studentId`, `volunteerId`);

-- CreateIndex
CREATE UNIQUE INDEX `ImportedHistory_volunteerId_key` ON `ImportedHistory`(`volunteerId`);

-- CreateIndex
CREATE UNIQUE INDEX `Induction_volunteerId_key` ON `Induction`(`volunteerId`);

-- CreateIndex
CREATE UNIQUE INDEX `VolunteerAttendance_chapterId_volunteerId_attendedOn_key` ON `VolunteerAttendance`(`chapterId`, `volunteerId`, `attendedOn`);

-- CreateIndex
CREATE UNIQUE INDEX `VolunteerSession_chapterId_volunteerId_attendedOn_key` ON `VolunteerSession`(`chapterId`, `volunteerId`, `attendedOn`);

-- CreateIndex
CREATE UNIQUE INDEX `VolunteerShareInfo_volunteerSharingId_volunteerSharedToId_key` ON `VolunteerShareInfo`(`volunteerSharingId`, `volunteerSharedToId`);

-- CreateIndex
CREATE UNIQUE INDEX `VolunteerToStudentAssignement_volunteerId_studentId_key` ON `VolunteerToStudentAssignement`(`volunteerId`, `studentId`);

-- CreateIndex
CREATE UNIQUE INDEX `PoliceCheck_volunteerId_key` ON `PoliceCheck`(`volunteerId`);

-- CreateIndex
CREATE UNIQUE INDEX `Session_chapterId_volunteerSessionId_studentSessionId_key` ON `Session`(`chapterId`, `volunteerSessionId`, `studentSessionId`);

-- CreateIndex
CREATE UNIQUE INDEX `WelcomeCall_volunteerId_key` ON `WelcomeCall`(`volunteerId`);

-- CreateIndex
CREATE UNIQUE INDEX `WWCCheck_volunteerId_key` ON `WWCCheck`(`volunteerId`);

-- AddForeignKey
ALTER TABLE `VolunteerSkill` ADD CONSTRAINT `VolunteerSkill_volunteerId_fkey` FOREIGN KEY (`volunteerId`) REFERENCES `Volunteer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VolunteerNote` ADD CONSTRAINT `VolunteerNote_volunteerId_fkey` FOREIGN KEY (`volunteerId`) REFERENCES `Volunteer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImportedHistory` ADD CONSTRAINT `ImportedHistory_volunteerId_fkey` FOREIGN KEY (`volunteerId`) REFERENCES `Volunteer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EoIProfile` ADD CONSTRAINT `EoIProfile_volunteerId_fkey` FOREIGN KEY (`volunteerId`) REFERENCES `Volunteer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WelcomeCall` ADD CONSTRAINT `WelcomeCall_volunteerId_fkey` FOREIGN KEY (`volunteerId`) REFERENCES `Volunteer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reference` ADD CONSTRAINT `Reference_volunteerId_fkey` FOREIGN KEY (`volunteerId`) REFERENCES `Volunteer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Induction` ADD CONSTRAINT `Induction_volunteerId_fkey` FOREIGN KEY (`volunteerId`) REFERENCES `Volunteer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoliceCheck` ADD CONSTRAINT `PoliceCheck_volunteerId_fkey` FOREIGN KEY (`volunteerId`) REFERENCES `Volunteer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WWCCheck` ADD CONSTRAINT `WWCCheck_volunteerId_fkey` FOREIGN KEY (`volunteerId`) REFERENCES `Volunteer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalbyMRC` ADD CONSTRAINT `ApprovalbyMRC_volunteerId_fkey` FOREIGN KEY (`volunteerId`) REFERENCES `Volunteer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VolunteerToStudentAssignement` ADD CONSTRAINT `VolunteerToStudentAssignement_volunteerId_fkey` FOREIGN KEY (`volunteerId`) REFERENCES `Volunteer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VolunteerAttendance` ADD CONSTRAINT `VolunteerAttendance_volunteerId_fkey` FOREIGN KEY (`volunteerId`) REFERENCES `Volunteer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_volunteerSessionId_fkey` FOREIGN KEY (`volunteerSessionId`) REFERENCES `VolunteerSession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VolunteerSession` ADD CONSTRAINT `VolunteerSession_volunteerId_fkey` FOREIGN KEY (`volunteerId`) REFERENCES `Volunteer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Goal` ADD CONSTRAINT `Goal_volunteerId_fkey` FOREIGN KEY (`volunteerId`) REFERENCES `Volunteer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VolunteerShareInfo` ADD CONSTRAINT `VolunteerShareInfo_volunteerSharingId_fkey` FOREIGN KEY (`volunteerSharingId`) REFERENCES `Volunteer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VolunteerShareInfo` ADD CONSTRAINT `VolunteerShareInfo_volunteerSharedToId_fkey` FOREIGN KEY (`volunteerSharedToId`) REFERENCES `Volunteer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VolunteerResource` ADD CONSTRAINT `VolunteerResource_volunteerResourceCategoryId_fkey` FOREIGN KEY (`volunteerResourceCategoryId`) REFERENCES `VolunteerResourceCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--

-- DropForeignKey
ALTER TABLE `Volunteer` DROP FOREIGN KEY `Mentor_chapterId_fkey`;

-- DropForeignKey
ALTER TABLE `VolunteerSkill` DROP FOREIGN KEY `MentorSkill_skillId_fkey`;

-- DropForeignKey
ALTER TABLE `VolunteerToStudentAssignement` DROP FOREIGN KEY `MentorToStudentAssignement_studentId_fkey`;

-- AlterTable
ALTER TABLE `StudentSession` MODIFY `status` ENUM('AVAILABLE', 'UNAVAILABLE', 'PENDING') NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE `VolunteerSession` MODIFY `status` ENUM('AVAILABLE', 'UNAVAILABLE', 'PENDING') NOT NULL DEFAULT 'AVAILABLE';

-- AddForeignKey
ALTER TABLE `Volunteer` ADD CONSTRAINT `Volunteer_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VolunteerSkill` ADD CONSTRAINT `VolunteerSkill_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `Skill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VolunteerToStudentAssignement` ADD CONSTRAINT `VolunteerToStudentAssignement_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VolunteerAttendance` ADD CONSTRAINT `VolunteerAttendance_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VolunteerSession` ADD CONSTRAINT `VolunteerSession_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Goal` ADD CONSTRAINT `Goal_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Volunteer` RENAME INDEX `Mentor_azureADId_key` TO `Volunteer_azureADId_key`;

-- RenameIndex
ALTER TABLE `Volunteer` RENAME INDEX `Mentor_email_key` TO `Volunteer_email_key`;

-- RenameIndex
ALTER TABLE `VolunteerResource` RENAME INDEX `MentorResource_label_url_key` TO `VolunteerResource_label_url_key`;

-- RenameIndex
ALTER TABLE `VolunteerResourcecategory` RENAME INDEX `MentorResourceCategory_label_key` TO `VolunteerResourceCategory_label_key`;