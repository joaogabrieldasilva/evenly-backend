import { Elysia, t } from "elysia";
import jwt from "jsonwebtoken";

const groups = [
  {
    id: 1,
    name: "Summer Vacation",
    description: "Expenses for our beach trip",
    totalExpenses: 1250.75,
    members: [
      { id: 1, name: "Alice", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 2, name: "Bob", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 3, name: "Charlie", avatar: "/placeholder.svg?height=40&width=40" },
    ],
  },
  {
    id: 2,
    name: "Road Trip",
    description: "Cross-country adventure expenses",
    totalExpenses: 876.5,
    members: [
      { id: 4, name: "David", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 5, name: "Eve", avatar: "/placeholder.svg?height=40&width=40" },
    ],
  },
  {
    id: 3,
    name: "Ski Trip",
    description: "Winter getaway costs",
    totalExpenses: 2100.0,
    members: [
      { id: 6, name: "Frank", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 7, name: "Grace", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 8, name: "Henry", avatar: "/placeholder.svg?height=40&width=40" },
    ],
  },
];

export const userRoutes = new Elysia()

  .get("/trip-groups", () => {
    return groups;
  })
  .get(
    "/trip-groups/:id",
    ({ params: { id } }) => groups.find((group) => group.id === id),
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  );
