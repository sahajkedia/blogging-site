import { Hono } from "hono";

const app = new Hono();

app.post("/signup", (c) => {
	return c.text("Hello Hono!");
});

app.post("/signin", (c) => {
	return c.text("Hello Hono!");
});
app.post("/blog", (c) => {
	return c.text("Hello Hono!");
});
app.put("/blog", (c) => {
	return c.text("Hello Hono!");
});
app.get("/blog/:id", (c) => {
	return c.text("Hello Hono!");
});

export default app;
