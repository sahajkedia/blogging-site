import { Hono } from "hono";
import { decode, sign, verify } from "hono/jwt";
import { userRoutes } from "./routes/user";
import { blogRoutes } from "./routes/blog";

const app = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		JWT_SECRET: string;
	};
	Variables: {
		userId: string;
	};
}>();

app.route("/api/v1/user", userRoutes);
app.route("/api/v1/blogs", blogRoutes);
app.use("/api/v1/blogs/*", async (c, next) => {
	const header = c.req.header("authorization") || "";
	const token = header.split(" ")[1];
	const payload = await verify(token, c.env.JWT_SECRET);

	if (!payload) {
		c.status(404);
		return c.json({
			message: "Not Logged In",
		});
	}
	c.set("userId", payload.id);
	await next();
});

export default app;
