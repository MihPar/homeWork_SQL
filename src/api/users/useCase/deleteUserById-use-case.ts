import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../users.repository';

export class DeleteUserByIdCommnad {
  constructor(public userId: string) {}
}
@CommandHandler(DeleteUserByIdCommnad)
export class DeleteUserByIdUseCase implements ICommandHandler<DeleteUserByIdCommnad> {
  constructor(protected readonly usersRepository: UsersRepository	) {}
  async execute(command: DeleteUserByIdCommnad): Promise<boolean> {
    const deleteId: boolean = await this.usersRepository.deleteById(
      command.userId,
    );
    return deleteId;
  }
}
