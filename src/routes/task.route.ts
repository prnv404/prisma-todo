import express, { Request, Response } from "express";
import prisma from "../config/prisma";
import NotFoundError from "../lib/error/notfound.error";
import authMiddleware from "../lib/middleware/auth.middleware";

const Router = express.Router();

export interface ITask {
	title: string;
	description: string;
	startDate: string;
	endDate: string;
	categoryId: number;
	tagId: number;
}

Router.post("/", authMiddleware, async (req: Request, res: Response) => {
	const userId = req.user?.userId;
	let { title, description, startDate, endDate } = req.body as ITask;
	const StartDate = new Date(startDate).toISOString(); 
	const EndDate = new Date(endDate).toISOString(); 
	const task = await prisma.task.create({
		data: {
			title,
			startDate: StartDate,
			endDate: EndDate,
			description,
			userId
		},
		select: {
			title: true,
			startDate: true,
			endDate: true,
			description: true
		}
	});
	res.status(201).send({ task });
});

Router.get("/all", authMiddleware, async (req: Request, res: Response) => {
	const userId = req.user?.userId;
	const tasks = await prisma.task.findMany({
		where: {
			userId: userId
		}
	});
	res.status(200).send({ tasks });
});

Router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
	const userId = req.user?.userId;
	const taskId = req.params.id;
	const task = await prisma.task.findFirst({
		where: {
			userId: userId,
			id: taskId
		}
	});
	if (task === null) throw new NotFoundError("No task found");
	res.status(200).send({ task });
});

Router.post("/:id", authMiddleware, async (req: Request, res: Response) => {
	const userId = req.user?.userId;
	const taskId = req.params.id;
	let { title, description, startDate, endDate } = req.body as ITask;
	const StartDate = new Date(startDate).toISOString();
	const EndDate = new Date(endDate).toISOString();
	const task = await prisma.task.update({
		where: {
			userId: userId,
			id: taskId
		},
		data: {
			title,
			description,
			startDate: StartDate,
			endDate: EndDate
		}
	});
	res.status(200).send({ task });
});

Router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
	const taskId = req.params.id;
	const userId = req.user?.userId;

	const task = await prisma.task.findFirst({
		where: {
			id: taskId,
			userId
		}
	});
	if (!task) throw new NotFoundError("not task found");

	await prisma.task.delete({
		where: {
			id: taskId,
			userId: userId
		}
	});
	res.status(200).json({ message: "deleted successfully" });
});

Router.post("/complete/:id", authMiddleware, async (req: Request, res: Response) => {
	const userId = req.user?.userId;
	const taskId = req.params.id;
	let { completed } = req.body;
	const task = await prisma.task.update({
		where: {
			userId: userId,
			id: taskId
		},
		data: {
			completed
		}
	});
	res.status(200).send({ task });
});

export { Router as TaskRouter };
