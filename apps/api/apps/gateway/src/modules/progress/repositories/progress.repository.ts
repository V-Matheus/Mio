import type { Observable } from "rxjs"

export interface GrpcProgressResponse {
  ok?: boolean
  lessonCompleted?: boolean
}

export interface GrpcLessonProgressResponse {
  lastSectionId?: number
  completedAt?: string
  viewedSectionIds?: number[]
}

export interface ProgressServiceClient {
  markSectionViewed(data: {
    userCode: string
    sectionId: number
  }): Observable<GrpcProgressResponse>

  markLessonCompleted(data: {
    userCode: string
    lessonId: number
  }): Observable<GrpcProgressResponse>

  getLessonProgress(data: {
    userCode: string
    lessonId: number
  }): Observable<GrpcLessonProgressResponse>
}
