import { Statement } from "../entities/Statement";

type BalanceParams = {
  id?: string;
  amount: number;
  description: string;
  type: string;
  created_at: Date;
  updated_at: Date;
  sender_id?: string;
};

export class BalanceMap {
  static toDTO({
    statement,
    balance,
  }: {
    statement: Statement[];
    balance: number;
  }) {
    const parsedStatement = statement.map(
      ({
        id,
        amount,
        description,
        type,
        created_at,
        updated_at,
        sender_id,
      }) => {
        let data: BalanceParams = {
          id,
          amount: Number(amount),
          description,
          type,
          created_at,
          updated_at,
        };

        if (type === "transfer") {
          data = { ...data, sender_id };
        }

        return data;
      }
    );

    return {
      statement: parsedStatement,
      balance: Number(balance),
    };
  }
}
