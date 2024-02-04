import { UserClass } from "./api/users/user.class";

declare global {
	namespace Express {
		export interface Request {
			user: UserClass | null
		}
	}
}