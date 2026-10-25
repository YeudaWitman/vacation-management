// An event is a fact. Its name is past tense: it already happened.
export class VacationRequestCreatedEvent {
  constructor(
    public readonly requestId: number,
    public readonly userId: number,
    public readonly startDate: string,
    public readonly endDate: string
  ) {}
}
