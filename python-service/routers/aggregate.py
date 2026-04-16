from fastapi import APIRouter, Query, HTTPException
from datetime import datetime, timedelta
from models.schemas import (
    AggregationResponse,
    ReportResponse,
    PageStat,
    DayStat,
    EventTypeStat,
    HourlyStat,
    ReportRow,
)
from config.database import get_db

router = APIRouter(prefix="/aggregate", tags=["Aggregation"])


def get_since(days: int) -> datetime:
    return datetime.utcnow() - timedelta(days=days)


@router.get("", response_model=AggregationResponse)
async def get_aggregation(
    projectId: str = Query(..., description="Project ID to aggregate"),
    days: int = Query(7, ge=1, le=90, description="Number of days to look back"),
):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not connected")

    since = get_since(days)
    collection = db["events"]

    match_stage = {
        "$match": {
            "projectId": projectId,
            "timestamp": {"$gte": since},
        }
    }

    # Run all aggregations concurrently
    total_events, unique_sessions, unique_users, top_pages, by_day, by_type, by_hour = (
        await _run_all(collection, match_stage)
    )

    return AggregationResponse(
        projectId=projectId,
        days=days,
        totalEvents=total_events,
        uniqueSessions=len(unique_sessions),
        uniqueUsers=len(unique_users),
        topPages=[PageStat(page=p["_id"], count=p["count"]) for p in top_pages],
        eventsByDay=[DayStat(date=d["_id"], count=d["count"]) for d in by_day],
        eventsByType=[EventTypeStat(eventType=t["_id"], count=t["count"]) for t in by_type],
        peakHours=[HourlyStat(hour=h["_id"], count=h["count"]) for h in by_hour],
    )


async def _run_all(collection, match_stage):
    import asyncio

    async def total():
        result = await collection.aggregate([
            match_stage,
            {"$count": "total"}
        ]).to_list(1)
        return result[0]["total"] if result else 0

    async def sessions():
        return await collection.distinct(
            "sessionId",
            {**match_stage["$match"]}
        )

    async def users():
        return await collection.distinct(
            "userId",
            {**match_stage["$match"], "userId": {"$exists": True, "$ne": None}}
        )

    async def pages():
        return await collection.aggregate([
            match_stage,
            {"$group": {"_id": "$page", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10},
        ]).to_list(10)

    async def by_day():
        return await collection.aggregate([
            match_stage,
            {
                "$group": {
                    "_id": {
                        "$dateToString": {
                            "format": "%Y-%m-%d",
                            "date": "$timestamp"
                        }
                    },
                    "count": {"$sum": 1},
                }
            },
            {"$sort": {"_id": 1}},
        ]).to_list(90)

    async def by_type():
        return await collection.aggregate([
            match_stage,
            {"$group": {"_id": "$eventType", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
        ]).to_list(20)

    async def by_hour():
        return await collection.aggregate([
            match_stage,
            {
                "$group": {
                    "_id": {"$hour": "$timestamp"},
                    "count": {"$sum": 1},
                }
            },
            {"$sort": {"_id": 1}},
        ]).to_list(24)

    return await asyncio.gather(
        total(), sessions(), users(),
        pages(), by_day(), by_type(), by_hour()
    )


# ─── Raw report endpoint (feeds CSV export to S3 in Step 6) ──
@router.get("/report", response_model=ReportResponse)
async def get_report(
    projectId: str = Query(...),
    days: int = Query(7, ge=1, le=90),
):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not connected")

    since = get_since(days)
    collection = db["events"]

    raw = await collection.find(
        {
            "projectId": projectId,
            "timestamp": {"$gte": since},
        },
        {"_id": 0, "page": 1, "eventType": 1,
         "sessionId": 1, "userId": 1, "timestamp": 1}
    ).sort("timestamp", -1).limit(1000).to_list(1000)

    rows = [
        ReportRow(
            date=r["timestamp"].strftime("%Y-%m-%d"),
            page=r.get("page", ""),
            eventType=r.get("eventType", ""),
            sessionId=r.get("sessionId", ""),
            userId=r.get("userId"),
            timestamp=r["timestamp"].isoformat(),
        )
        for r in raw
    ]

    return ReportResponse(
        projectId=projectId,
        totalRows=len(rows),
        rows=rows,
    )