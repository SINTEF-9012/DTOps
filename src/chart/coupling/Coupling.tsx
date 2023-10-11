import React from 'react';
import { ChartProps } from '../Chart';
import { renderValueByType } from '../../report/ReportRecordProcessing';

const smallSystemSize: number = 4;
const ADSACriticalityThresholds: number[] = [0.5, 1.0];
const ADSACriticalityLabels: string[] = ['low', 'high', 'very high'];
const giniADSCriticalityThresholds: number[] = [30];
const giniADSCriticalityLabels: string[] = ['balanced', 'not balanced'];
const SCFCriticalityThresholds: number[] = [0.05, 0.1];
const SCFCriticalityLabels: string[] = ['low', 'high', 'very high'];
enum SystemCriticality {
  low = 'low',
  high = 'high',
  veryHigh = 'very high',
}

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

function systemCriticalityEvaluation(
  systemIsLarge: boolean,
  ADSACriticality: number,
  giniADSCriticality: number,
  SCFCriticality: number
): SystemCriticality {
  let criticality: number = 0;
  const maximumCriticality =
    (ADSACriticalityLabels.length > SCFCriticalityLabels.length
      ? ADSACriticalityLabels.length - 1
      : SCFCriticalityLabels.length - 1) +
    giniADSCriticalityLabels.length -
    1;
  console.log('Maximum criticality: ' + maximumCriticality);
  if (systemIsLarge) {
    criticality += Math.floor((ADSACriticality + SCFCriticality) / 2);
  } else {
    criticality += ADSACriticality;
  }
  criticality += giniADSCriticality;
  const veryHighCriticalityIndex = Math.floor(maximumCriticality / 3) * 2;
  const HighCriticalityIndex = Math.floor(maximumCriticality / 3);
  if (criticality >= veryHighCriticalityIndex) {
    return SystemCriticality.veryHigh;
  } else if (criticality >= HighCriticalityIndex) {
    return SystemCriticality.high;
  }
  return SystemCriticality.low;
}

const CouplingAnalysis = (props: ChartProps) => {
  const records = props.records;

  return records.map((r) => {
    return (
      <div>
        {r['_fields'].map((value) => {
          let numberOfServices = parseInt(renderValueByType(value.properties.N));
          let ADSA = parseFloat(renderValueByType(value.properties.ADSA).replace(',', '.'));
          let giniADS = parseInt(renderValueByType(value.properties.giniADS).replace('%', ''));
          let SCF = parseFloat(renderValueByType(value.properties.SCF).replace(',', '.'));

          const systemIsLarge: boolean = isSystemLarge(numberOfServices);
          const ADSACriticality: number = getMetricCriticality(ADSA, ADSACriticalityThresholds);
          const giniADSCriticality: number = getMetricCriticality(giniADS, giniADSCriticalityThresholds);
          const SCFCriticality: number = getMetricCriticality(SCF, SCFCriticalityThresholds);

          const systemCriticality: SystemCriticality = systemCriticalityEvaluation(
            systemIsLarge,
            ADSACriticality,
            giniADSCriticality,
            SCFCriticality
          );

          return (
            <>
              <p>
                {'The number of dependencies in the system is '}
                <strong>{ADSACriticalityLabels[ADSACriticality]}</strong>
              </p>
              <p>
                {'Coupling dispersion: '}
                <strong>{giniADSCriticalityLabels[giniADSCriticality]}</strong>
              </p>
              {systemIsLarge && (
                <p>
                  {'Dependency graph density criticality: '}
                  <strong>{SCFCriticalityLabels[SCFCriticality]}</strong>
                </p>
              )}
              <p>
                {'Overall system criticality: '}
                <strong>{systemCriticality}</strong>
              </p>
            </>
          );
        })}
      </div>
    );
  });
};

export default CouplingAnalysis;
