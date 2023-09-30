import app from "./app";

process.on("uncaughtException", () => {
	process.exit(1);
});

app.listen(3000, () => {
	console.log(`server is listening on port 3000`);
});
