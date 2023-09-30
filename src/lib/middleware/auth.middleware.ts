import { Response, Request, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

export interface Ipayload {
	userId: string;
	phone: string;
}

declare global {
	namespace Express {
		interface Request {
			user?: Ipayload;
		}
	}
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const AC_TOKEN = req.session?.accessToken;
	const refreshToken = req.session?.refreshToken;

	try {
		if (!AC_TOKEN) return res.status(401).json({ error: "not authorized for this request" });
		const decode = jwt.verify(AC_TOKEN, process.env.JWT_ACCESSTOKEN!) as Ipayload;
		if (decode) {
			req.user = decode;
			next();
		}
	} catch (error) {
		if (refreshToken) {
			const isValid = jwt.verify(refreshToken, process.env.JWT_REFRESHTOKEN!) as Ipayload;
			if (isValid) {
				const accessToken = jwt.sign(
					{
						phone: isValid.phone,
						userId: isValid.userId
					},
					process.env.JWT_ACCESSTOKEN!,
					{
						expiresIn: "30s"
					}
				);
				req.session!.accessToken = accessToken;
				next();
			}
		} else {
			return res.status(400).json({ message: "Do signin or signup" });
		}
	}
};

export default authMiddleware;
