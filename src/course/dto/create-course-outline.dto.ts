// create-course-outline.dto.ts
export class CreateCourseOutlineDto {
  departmentId: string;
  status: string;
  document: string;
  courseName: string;
  notes?: string;
  teacherId: unknown;
}
