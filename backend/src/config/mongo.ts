import mongoose from 'mongoose'

export const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL as string)
    console.log('✅ MongoDB connected')
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err)
    process.exit(1)
  }
}