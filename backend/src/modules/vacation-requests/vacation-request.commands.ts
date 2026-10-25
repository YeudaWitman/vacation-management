// A command is a request to do something. Its name is an instruction (imperative).
export class CreateVacationRequestCommand {
  constructor(
    public readonly userId: number,
    public readonly startDate: string,
    public readonly endDate: string,
    public readonly reason: string | null
  ) {}
}
