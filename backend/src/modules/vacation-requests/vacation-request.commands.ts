// A command is a request to do something. Its name is an instruction (imperative).
export class CreateVacationRequestCommand {
  constructor(
    public readonly userId: number,
    public readonly startDate: string,
    public readonly endDate: string,
    public readonly reason: string | null
  ) {}
}

export class ApproveVacationRequestCommand {
  constructor(public readonly requestId: number) {}
}

export class RejectVacationRequestCommand {
  constructor(
    public readonly requestId: number,
    public readonly comment: string
  ) {}
}
