import { Journey, SpendingCategory } from '../src/models';
import { formatAmount, formatPercentage } from '../src/utils';

export interface SpendingsObject {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface ChartData {
  category: string;
  value: number;
  text: string;
  color: string;
  focused?: boolean;
}

export class SpendingsList {
  private spendings: Record<SpendingCategory, SpendingsObject>;

  constructor(colors: string[], journeys?: Journey[]) {
    this.spendings = {} as Record<SpendingCategory, SpendingsObject>;
    Object.values(SpendingCategory).forEach((category, idx) => {
      this.spendings[category] = {
        category: category,
        amount: 0,
        percentage: 0,
        color: colors[idx % colors.length],
      };
    });
    if (journeys) {
      this.fillSpendingsList(journeys);
    }
  }

  addAmount(category: SpendingCategory, amount: number) {
    this.spendings[category].amount += amount;
    this.updatePercentages();
  }

  getSpendings(): SpendingsObject[] {
    return Object.values(this.spendings);
  }

  fillSpendingsList(journeys: Journey[]) {
    for (const journey of journeys) {
      if (journey.majorStages) {
        for (const majorStage of journey.majorStages) {
          majorStage.transportation &&
            this.addAmount(
              SpendingCategory.transportation,
              majorStage.transportation.transportation_costs
            );
          if (majorStage.minorStages) {
            for (const minorStage of majorStage.minorStages) {
              minorStage.transportation &&
                this.addAmount(
                  SpendingCategory.transportation,
                  minorStage.transportation.transportation_costs
                );
              this.addAmount(
                SpendingCategory.acommodation,
                minorStage.accommodation.costs
              );
              if (minorStage.costs.spendings) {
                for (const spending of minorStage.costs.spendings) {
                  this.addAmount(
                    spending.category as SpendingCategory,
                    spending.amount
                  );
                }
              }
            }
          }
        }
      }
    }
  }

  getChartData(mode: 'amount' | 'percentage'): ChartData[] {
    let chartData: ChartData[] = [];
    if (mode === 'percentage') {
      chartData = Object.values(this.spendings).map((spending) => ({
        value: spending.percentage,
        text: formatPercentage(spending.percentage),
        color: spending.color,
        category: spending.category,
      }));
    } else {
      chartData = Object.values(this.spendings).map((spending) => ({
        value: spending.amount,
        text: formatAmount(spending.amount),
        color: spending.color,
        category: spending.category,
      }));
    }

    const filteredChartData = chartData.filter((item) => item.value !== 0);

    const sortedChartData = filteredChartData
      .slice()
      .sort((b, a) => a.value - b.value);

    return sortedChartData;
  }

  getTotalAmount(): number {
    return Object.values(this.spendings).reduce(
      (sum, obj) => sum + obj.amount,
      0
    );
  }

  private updatePercentages() {
    const total = Object.values(this.spendings).reduce(
      (sum, obj) => sum + obj.amount,
      0
    );
    Object.values(this.spendings).forEach((obj) => {
      obj.percentage = total > 0 ? (obj.amount / total) * 100 : 0;
    });
  }
}
