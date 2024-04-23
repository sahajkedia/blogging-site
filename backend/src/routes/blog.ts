import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export const blogRoutes = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
	};
	Variables: {
		userId: string;
	};
}>();

blogRoutes.post("/", async (c) => {
	const userId = c.get("userId");
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const { title, content } = await c.req.json();
	const post = await prisma.post.create({
		data: {
			title,
			content,
			authorId: userId,
		},
	});

	return c.json({
		id: post.id,
	});
});
blogRoutes.put("/", async (c) => {
	const userId = c.get("userId");
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const { title, content, id } = await c.req.json();
	await prisma.post.update({
		where: {
			id: id,
			authorId: userId,
		},
		data: {
			title: title,
			content: content,
		},
	});

	return c.text("Post Updated");
});

// Add Pagination
blogRoutes.get("/", async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const posts = await prisma.post.findMany();

	return c.json({
		posts,
	});
});

blogRoutes.get("/:id", async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const id = c.req.param("id");
	const post = await prisma.post.findUnique({
		where: {
			id,
		},
	});

	return c.json({
		post,
	});
});
