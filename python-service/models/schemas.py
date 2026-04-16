from pydantic import BaseModel
from typing import List, Optional

class PageStat(BaseModel):
    page: str
    count: int

class DayStat(BaseModel):
    date: str
    count: int

class EventTypeStat(BaseModel):
    eventType: str
    count: int

class HourlyStat(BaseModel):
    hour: int
    count: int

class AggregationResponse(BaseModel):
    projectId: str
    days: int
    totalEvents: int
    uniqueSessions: int
    uniqueUsers: int
    topPages: List[PageStat]
    eventsByDay: List[DayStat]
    eventsByType: List[EventTypeStat]
    peakHours: List[HourlyStat]

class ReportRow(BaseModel):
    date: str
    page: str
    eventType: str
    sessionId: str
    userId: Optional[str] = None
    timestamp: str

class ReportResponse(BaseModel):
    projectId: str
    totalRows: int
    rows: List[ReportRow]