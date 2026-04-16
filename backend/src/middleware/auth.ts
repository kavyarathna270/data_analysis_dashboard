import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: { id: string; email: string }
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Allow request through — resolvers will guard
    // protected queries individually
    return next()
  }

  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string
      email: string
    }
    req.user = decoded
  } catch {
    // Invalid token — resolvers will reject protected queries
  }

  next()
}