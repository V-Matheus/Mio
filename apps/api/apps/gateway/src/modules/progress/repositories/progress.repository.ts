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

export interface GrpcTrackProgressSummary {
  trackId: number
  trackSlug: string
  trackTitle: string
  totalLessons: number
  completedLessons: number
  progressPercentage: number
  currentLessonSlug: string
  currentLessonTitle: string
}

export interface GrpcRecentActivityEntry {
  lessonId: number
  lessonSlug: string
  lessonTitle: string
  trackSlug: string
  trackTitle: string
  completedAt: string
}

export interface GrpcStudentProfileProgressResponse {
  totalCompletedLessons: number
  completedTracksCount: number
  inProgressTracks: GrpcTrackProgressSummary[]
  recentActivities: GrpcRecentActivityEntry[]
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

  getStudentProfileProgress(data: {
    userCode: string
  }): Observable<GrpcStudentProfileProgressResponse>
}
