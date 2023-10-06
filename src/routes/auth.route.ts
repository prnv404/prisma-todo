import express, { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import prisma from "../config/prisma";
import BadRequestError from "../lib/error/badrequest.error";
import { Ipayload } from "../lib/middleware/auth.middleware";
import NotFoundError from "../lib/error/notfound.error";

const Router = express.Router();

Router.post("/signup", async (req: Request, res: Response) => {
	const { phone, username, password } = req.body as { phone: string; username: string; password: string };
	const userExist = await prisma.user.findFirst({
		where: {
			phone: phone
		}
	});

	if (userExist) throw new BadRequestError("User Already Exist");
	const salt = await bcrypt.genSalt();
	const hashPassword = await bcrypt.hash(password, salt);
	const user = await prisma.user.create({
		data: {
			phone,
			username,
			password: hashPassword,
			salt
		}
	});
	const payload: Ipayload = { phone: user.phone, userId: user.id };
	const accessToken = jwt.sign(payload, process.env.JWT_ACCESSTOKEN!, {
		expiresIn: "2m"
	});
	const refreshToken = jwt.sign(payload, process.env.JWT_REFRESHTOKEN!, {
		expiresIn: "30d"
	});
	await prisma.user.update({
		where: {
			id: user.id
		},
		data: {
			refreshToken: refreshToken
		}
	});

	req.session = {
		accessToken: accessToken,
		refreshToken: refreshToken
	};

	res.status(201).json({ message: "Signup successfully" });
});

Router.post("/signin", async (req: Request, res: Response) => {
	const { phone, password } = req.body;

	const user = await prisma.user.findFirst({ where: { phone } });
	if (!user) throw new NotFoundError("No user found sorry pls");

	const isCorrect = await bcrypt.compare(password, user.password);
	if (!isCorrect) throw new BadRequestError("wrong password");

	const payload: Ipayload = { phone: user.phone, userId: user.id };

	const accessToken = jwt.sign(payload, process.env.JWT_ACCESSTOKEN!, {
		expiresIn: "2ms"
	});
	const refreshToken = jwt.sign(payload, process.env.JWT_REFRESHTOKEN!, {
		expiresIn: "30d"
	});

	await prisma.user.update({
		where: {
			id: user.id
		},
		data: {
			refreshToken: refreshToken
		}
	});
	req.session = {
		accessToken: accessToken,
		refreshToken: refreshToken
	};
	res.status(200).json({ message: "Signin successfully" });
});

Router.delete("/signout", async (req: Request, res: Response) => {
	const userId = req.user?.userId;
	const user = await prisma.user.findFirst({ where: { id: userId } });
	if (!user) throw new NotFoundError("No user found sorry pls");
	await prisma.user.update({
		where: {
			id: user.id
		},
		data: {
			refreshToken: null
		}
	});
	req.session = {
		accessToken: null,
		refreshToken: null
	};
	res.status(200).json({ message: "Logout successfully" });
});

Router.get("/", async (req: Request, res: Response) => {
	const userId = req.user?.userId;
	const user = await prisma.user.findFirst({ where: { id: userId } });
	res.status(200).json({ user });
});

export { Router as AuthRouter };
