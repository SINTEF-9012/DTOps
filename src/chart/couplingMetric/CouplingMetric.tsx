import React from 'react';
import { ChartProps } from '../Chart';
import { renderValueByType } from '../../report/ReportRecordProcessing';
import { evaluateRulesOnNeo4jRecord } from '../../extensions/styling/StyleRuleEvaluator';
import { extensionEnabled } from '../../extensions/ExtensionUtils';
import YAML from 'yaml';
import { CenterFocusStrong } from '@material-ui/icons';

/**
 * Renders Neo4j records as their JSON representation.
 */
const NeoSingleValueChart = (props: ChartProps) => {
  const { records } = props;
  const fontSize = props.settings && props.settings.fontSize ? props.settings.fontSize : 64;
  const color = props.settings && props.settings.color ? props.settings.color : 'rgba(0, 0, 0, 0.87)';
  const format = props.settings && props.settings.format ? props.settings.format : 'auto';
  const textAlign = props.settings && props.settings.textAlign ? props.settings.textAlign : 'left';
  const verticalAlign = props.settings && props.settings.verticalAlign ? props.settings.verticalAlign : 'top';
  const monospace = props.settings && props.settings.monospace !== undefined ? props.settings.monospace : false;
  const description: string =
    props.settings && props.settings.reportDescription !== undefined ? props.settings.desc : '';
  const styleRules =
    extensionEnabled(props.extensions, 'styling') && props.settings && props.settings.styleRules
      ? props.settings.styleRules
      : [];

  const dimensions = props.dimensions ? props.dimensions : { width: 100, height: 100 };
  const reportHeight = dimensions.height - fontSize;

  const value = records && records[0] && records[0]._fields && records[0]._fields[0] ? records[0]._fields[0] : '';

  const createDisplayValue = (value) => {
    if (format == 'json') {
      return JSON.stringify(value, null, 2);
    }
    if (format == 'yml') {
      return YAML.stringify(value, null, 2);
    }
    return renderValueByType(value);
  };

  return (
    <div
      style={{
        height: reportHeight,
        lineHeight: `${reportHeight}px`,
        position: 'relative',
        textAlign: textAlign,
        marginLeft: '15px',
        marginRight: '15px',
        display: 'grid',
      }}
    >
      <div
        style={{
          //   width: '50%',
          //   borderRadius: '50%',
          //   background: '#FF5733',
          gridColumn: '1 / 2',
          height: '100%',
        }}
      >
        <span
          style={{
            // TODO: questa misura è stata messa per tagliare l'ultima cifra perché non ci stava
            width: '86px',
            height: '86px',
            borderRadius: '50%',
            background: evaluateRulesOnNeo4jRecord(records[0], 'text color', color, styleRules),

            display: 'inline-block',
            verticalAlign: verticalAlign,
            whiteSpace: 'pre',
            marginTop: verticalAlign == 'middle' ? '-72px' : '0px', // go to a "true middle", subtract header height.
            fontSize: fontSize,
            textAlign: 'center',
            fontFamily: monospace ? 'monospace' : 'inherit',
            color: '#fff',
            // lineHeight: `${fontSize + 8}px`,
            lineHeight: '86px',
            // color: evaluateRulesOnNeo4jRecord(records[0], 'text color', color, styleRules),
          }}
        >
          {createDisplayValue(value)}
        </span>
      </div>

      <p>{description}</p>
      {/* <div
        style={{
          gridColumn: '2 / 5',
          height: '100%',
          display: 'table',
        }}
      >
        <div
          style={{
            margin: '5px',
            height: '30px',
          }}
        >
          <span
            style={{
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              background: '#FF3206',

              display: 'inline-block',
              verticalAlign: verticalAlign,
              whiteSpace: 'pre',
              marginTop: verticalAlign == 'middle' ? '-72px' : '0px', // go to a "true middle", subtract header height.
              fontSize: fontSize,
              textAlign: 'center',
              fontFamily: monospace ? 'monospace' : 'inherit',
              color: '#fff',
              // lineHeight: `${fontSize + 8}px`,
              lineHeight: '15px',
              // color: evaluateRulesOnNeo4jRecord(records[0], 'text color', color, styleRules),
            }}
          ></span>
          <p
            style={{
              fontSize: '12px',
              height: '30px',
              padding: '0px',
              margin: '0px',
              display: 'inline-block',
              verticalAlign: verticalAlign,
            }}
          >
            High coupling
          </p>
        </div>

        <div
          style={{
            margin: '5px',
            height: '30px',
            display: 'grid',
          }}
        >
          {' '}
          <span
            style={{
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              background: '#FFA806',
              gridColumn: '1 / 2',

              display: 'inline-block',
              verticalAlign: verticalAlign,
              whiteSpace: 'pre',
              marginTop: verticalAlign == 'middle' ? '-72px' : '0px', // go to a "true middle", subtract header height.
              fontSize: fontSize,
              textAlign: 'center',
              fontFamily: monospace ? 'monospace' : 'inherit',
              color: '#fff',
              // lineHeight: `${fontSize + 8}px`,
              lineHeight: '15px',
              // color: evaluateRulesOnNeo4jRecord(records[0], 'text color', color, styleRules),
            }}
          ></span>
          <p
            style={{
              gridColumn: '2 / 10',
              height: '15px',
              display: 'inline-block',
              verticalAlign: verticalAlign,
            }}
          >
            Medium coupling
          </p>
        </div>

        <div
          style={{
            margin: '5px',
            height: '30px',
            display: 'grid',
          }}
        >
          {' '}
          <span
            style={{
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              background: '#77FF06',
              gridColumn: '1 / 2',

              display: 'inline-block',
              verticalAlign: verticalAlign,
              whiteSpace: 'pre',
              marginTop: verticalAlign == 'middle' ? '-72px' : '0px', // go to a "true middle", subtract header height.
              fontSize: fontSize,
              textAlign: 'center',
              fontFamily: monospace ? 'monospace' : 'inherit',
              color: '#fff',
              // lineHeight: `${fontSize + 8}px`,
              lineHeight: '15px',
              // color: evaluateRulesOnNeo4jRecord(records[0], 'text color', color, styleRules),
            }}
          ></span>
          <p
            style={{
              gridColumn: '2 / 10',
              height: '15px',
              display: 'inline-block',
              verticalAlign: verticalAlign,
            }}
          >
            Low coupling
          </p>
        </div> */}
      {/* </div> */}
    </div>
  );
};

export default NeoSingleValueChart;
