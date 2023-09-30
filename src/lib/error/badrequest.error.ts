import CustomError from "./custom.error";

class BadRequestError extends CustomError {
	statusCode = 400;
	constructor(public message: string) {
		super(message);
		Object.setPrototypeOf(this, BadRequestError.prototype);
	}
	error() {
		return [{ message: this.message }];
	}
}

export default BadRequestError;
