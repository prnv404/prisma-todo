import CustomError from "./custom.error";

class NotFoundError extends CustomError {
	statusCode = 404;
	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, NotFoundError.prototype);
	}
	error() {
		return [{ message: "Not Found" }];
	}
}

export default NotFoundError;
