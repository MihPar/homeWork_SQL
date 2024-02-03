export type AccountDataType = {
	userName: string
	email: string
	passwordHash: string
	createdAt: string
}

export type EmailConfirmationType = {
   confirmationCode: string
   expirationDate: Date
   isConfirmed: boolean
}	

export type UserViewType = {
   id: string;
   login: string;
   email: string;
   createdAt: string;
 }