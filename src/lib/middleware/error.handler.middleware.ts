import { Request, Response, NextFunction } from "express";
import CustomError from "../error/custom.error";

export const ErrorHandler = async (error: Error, req: Request, res: Response, next: NextFunction) => {
	if (error instanceof CustomError) {
		return res.status(error.statusCode).send({ errors: error.error() });
	}
	console.log(error);
	res.status(500).send({
		errors: [{ message: "something went wrong" }]
	});
};
