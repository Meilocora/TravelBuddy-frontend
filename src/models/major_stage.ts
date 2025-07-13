import { CustomCountry } from './custom_country';
import { MinorStage } from './minor_stage';
import { Costs, Transportation, Validable } from './other_models';

export interface MajorStage {
  id: number;
  title: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  additional_info: string;
  country: CustomCountry;
  costs: Costs;
  transportation?: Transportation;
  minorStages?: MinorStage[];
  currentMajorStage?: boolean;
}

export interface MajorStageValues {
  title: string;
  scheduled_start_time: string | null;
  scheduled_end_time: string | null;
  additional_info: string | null;
  budget: number;
  spent_money: number;
  country: string;
}

export interface MajorStageFormValues {
  title: Validable<string>;
  scheduled_start_time: Validable<string | null>;
  scheduled_end_time: Validable<string | null>;
  additional_info: Validable<string | undefined>;
  budget: Validable<number>;
  spent_money: Validable<number>;
  country: Validable<string>;
}
