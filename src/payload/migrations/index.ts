import * as migration_20260425_154423_initialset from './20260425_154423_initialset';
import * as migration_20260509_141620_rm_body_add_case_study_fields from './20260509_141620_rm_body_add_case_study_fields';

export const migrations = [
  {
    up: migration_20260425_154423_initialset.up,
    down: migration_20260425_154423_initialset.down,
    name: '20260425_154423_initialset',
  },
  {
    up: migration_20260509_141620_rm_body_add_case_study_fields.up,
    down: migration_20260509_141620_rm_body_add_case_study_fields.down,
    name: '20260509_141620_rm_body_add_case_study_fields'
  },
];
