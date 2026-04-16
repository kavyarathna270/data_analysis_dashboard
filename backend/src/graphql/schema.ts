import { buildSchema } from 'graphql'

export const schema = buildSchema(`
  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: String!
  }

  type Project {
    id: ID!
    name: String!
    description: String
    apiKey: String!
    createdAt: String!
  }

  type DashboardStats {
    totalEvents: Int!
    uniqueSessions: Int!
    topPages: [PageStat!]!
    eventsByDay: [DayStat!]!
  }

  type PageStat {
    page: String!
    count: Int!
  }

  type DayStat {
    date: String!
    count: Int!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    myProjects: [Project!]!
    dashboardStats(projectId: ID!, days: Int): DashboardStats!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createProject(name: String!, description: String): Project!
  }
`)