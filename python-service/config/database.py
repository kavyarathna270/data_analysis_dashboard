import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB  = os.getenv("MONGO_DB", "insightflow_events")

client: AsyncIOMotorClient = None  # type: ignore
db = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[MONGO_DB]
    print(f"✅ Python service connected to MongoDB: {MONGO_DB}")

async def close_db():
    global client
    if client:
        client.close()

def get_db():
    return db