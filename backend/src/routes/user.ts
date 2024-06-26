import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";
import { signupInput, signinInput } from "@100xdevs/medium-common";
export const userRoutes = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
	};
}>();

userRoutes.post("/signup", async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const { email, password, name } = await c.req.json();
	const { success } = signupInput.safeParse({ email, password, name });
	if (success) {
		const user = await prisma.user.create({
			data: {
				email,
				password,
				name,
			},
		});
		const token = await sign({ id: user.id }, c.env.JWT_SECRET);
		return c.json({
			jwt: token,
		});
	} else {
		c.status(403);
		return c.json("Error Occurred");
	}
});

userRoutes.post("/signin", async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const { email, password } = await c.req.json();
	const { success } = signinInput.safeParse({ email, password });
	if (success) {
		const user = await prisma.user.findUnique({
			where: {
				email,
				password,
			},
		});
		console.log(user);
		if (!user) {
			c.status(403);
			return c.json({
				error: "User Not Found",
			});
		} else {
			const token = await sign({ id: user?.id }, c.env.JWT_SECRET);
			return c.json({ jwt: token });
		}
	} else {
		c.status(403);
		return c.json("Error Occurred");
	}
});
