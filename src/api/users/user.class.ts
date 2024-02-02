export class UserClass {
	constructor(
		public id: string,
		public userName: string,
		public email: string,
		public passwordHash: string,
		public createdAt: string
	) {
	}
		
}

export class EmailConfirmationClass extends UserClass {
	constructor(
		public id: string,
		public userName: string,
		public email: string,
		public passwordHash: string,
		public createdAt: string
	) {
		super(id, userName, email, passwordHash, createdAt)
	}
		userId: string
		confirmationCode: string
		expirationDate: Date
		isConfirmed: boolean
}