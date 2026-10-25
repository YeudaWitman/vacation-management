import { FindOperator } from "typeorm";
import type { VacationRequest } from "../../src/modules/vacation-requests/vacation-request.entity";

// A tiny in-memory stand-in for a TypeORM repository.
// It understands only what our handlers use: plain values and the Not / LessThanOrEqual /
// MoreThanOrEqual operators. It is NOT a database, so it proves our rules, not our SQL
// (the real overlap query was tested separately against PostgreSQL).

type Row = VacationRequest;

function matches(value: unknown, condition: unknown): boolean {
  if (condition instanceof FindOperator) {
    const expected = condition.value as any;
    switch (condition.type) {
      case "not":
        return value !== expected;
      case "lessThanOrEqual":
        return (value as string) <= expected;
      case "moreThanOrEqual":
        return (value as string) >= expected;
      default:
        throw new Error(`Fake repository does not support operator "${condition.type}"`);
    }
  }
  return value === condition;
}

function matchesWhere(row: Row, where: Record<string, unknown>): boolean {
  return Object.entries(where).every(([key, condition]) => matches((row as any)[key], condition));
}

export class FakeVacationRepository {
  rows: Row[] = [];
  private nextId = 1;

  reset() {
    this.rows = [];
    this.nextId = 1;
    this.beforeUpdate = undefined;
  }
  // Lets a test simulate "someone else decided the row between our check and our UPDATE".
  beforeUpdate?: () => void;

  seed(partial: Partial<Row> & Pick<Row, "userId" | "startDate" | "endDate">): Row {
    const row = {
      id: this.nextId++,
      reason: null,
      comments: null,
      status: "Pending",
      ...partial,
    } as Row;
    this.rows.push(row);
    return row;
  }

  create(data: Partial<Row>): Row {
    return { ...data } as Row; // in memory only, like the real create()
  }

  async save(row: Row): Promise<Row> {
    const saved = { ...row, id: this.nextId++ } as Row;
    this.rows.push(saved);
    return saved;
  }

  async findOne({ where }: { where: Record<string, unknown> }): Promise<Row | null> {
    return this.rows.find((r) => matchesWhere(r, where)) ?? null;
  }

  async findOneBy(where: Record<string, unknown>): Promise<Row | null> {
    return this.findOne({ where });
  }

  async findOneByOrFail(where: Record<string, unknown>): Promise<Row> {
    const row = await this.findOne({ where });
    if (!row) throw new Error("not found");
    return row;
  }

  async update(where: Record<string, unknown>, changes: Partial<Row>): Promise<{ affected: number }> {
    this.beforeUpdate?.();
    const targets = this.rows.filter((r) => matchesWhere(r, where));
    targets.forEach((r) => Object.assign(r, changes));
    return { affected: targets.length };
  }
}
