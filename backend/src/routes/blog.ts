import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { createBlogInput } from "@100xdevs/medium-common";
import { updateBlogInput } from "@100xdevs/medium-common";
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
	const { success } = createBlogInput.safeParse({ title, content });
	if (success) {
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
	} else {
		c.status(403);
		return c.json({
			msg: " Unsuccessful because Input Validation Failed",
		});
	}
});
blogRoutes.put("/", async (c) => {
	const userId = c.get("userId");
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const { title, content, id } = await c.req.json();
	const { success } = createBlogInput.safeParse({ title, content, id });
	if (success) {
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
	} else {
		c.status(403);
		return c.json({
			msg: "Update Unsuccessful",
		});
	}
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
