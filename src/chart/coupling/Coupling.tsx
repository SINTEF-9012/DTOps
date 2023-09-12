import React from 'react';
import { ChartProps } from '../Chart';
import { renderValueByType } from '../../report/ReportRecordProcessing';

const smallSystemSize: number = 4;
const ADSACriticalityThresholds: number[] = [0.5, 1.0];
const ADSACriticalityLabels: string[] = ['low', 'high', 'very high'];
const giniADSCriticalityThresholds: number[] = [0.3];
const giniADSCriticalityLabels: string[] = ['balanced', 'not balanced'];
const SCFCriticalityThresholds: number[] = [0.05, 0.1];
const SCFCriticalityLabels: string[] = ['green', 'yellow', 'red'];

function isSystemLarge(numberOfServices: number) {
  let systemIsLarge = false;
  if (numberOfServices > smallSystemSize) systemIsLarge = true;
  return systemIsLarge;
}

function getMetricCriticality(metric: number, thresholds: number[]) {
  for (let i = 0; i < thresholds.length; i++) {
    if (metric <= thresholds[i]) {
      return i;
    }
  }
  return thresholds.length;
}

const CouplingAnalysis = (props: ChartProps) => {
  const records = props.records;
  return records.map((r) => {
    return (
      <div>
        {r['_fields'].map((value) => {
          let numberOfServices = parseInt(renderValueByType(value.properties.N));
          let ADSA = renderValueByType(value.properties.ADSA);
          let giniADS = renderValueByType(value.properties.giniADS);
          let SCF = renderValueByType(value.properties.SCF);

          console.log('numberOfServices: ' + numberOfServices);
          console.log('ADSA: ' + ADSA);
          console.log('giniADS: ' + giniADS);
          console.log('SCF: ' + SCF);

          const systemIsLarge: boolean = isSystemLarge(numberOfServices);
          const ADSACriticality: number = getMetricCriticality(ADSA, ADSACriticalityThresholds);
          const giniADSCriticality: number = getMetricCriticality(giniADS, giniADSCriticalityThresholds);
          const SCFCriticality: number = getMetricCriticality(SCF, SCFCriticalityThresholds);

          return (
            <>
              <p>
                {'The system is '}
                <strong>{systemIsLarge ? 'large' : 'small'}</strong>
              </p>
              <p>
                {'The number of dependencies in the system is '}
                <strong>{ADSACriticalityLabels[ADSACriticality]}</strong>
              </p>
              <p>
                {'Gini ADS coeficient criticality: '}
                <strong>{giniADSCriticalityLabels[giniADSCriticality]}</strong>
              </p>
              <p>
                {'Dependency graph density criticality: '}
                <strong>{SCFCriticalityLabels[SCFCriticality]}</strong>
              </p>
            </>
          );
        })}
      </div>
    );
  });
};

export default CouplingAnalysis;
