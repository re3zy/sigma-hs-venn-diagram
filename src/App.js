import React, { useState, useEffect, useMemo } from 'react';
import { client, useConfig, useElementData } from '@sigmacomputing/plugin';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

client.config.configureEditorPanel([
  { name: "source", type: "element" },
  { name: "setsColumn", type: "column", source: "source", allowMultiple: true },
  { name: "valuesColumn", type: "column", source: "source", allowMultiple: false },
  { name: "namesColumn", type: "column", source: "source", allowMultiple: false },
  { name: "chartTitle", type: "text", defaultValue: "The Unattainable Triangle" }
]);

const getSigmaData = (config, sigmaData) => {
  if (!sigmaData[config['setsColumn']] || !sigmaData[config['valuesColumn']] || !sigmaData[config['namesColumn']]) {
    return null;
  }

  let vennData = [];
  for (let i = 0; i < sigmaData[config['setsColumn']].length; i++) {
    vennData.push({
      sets: sigmaData[config['setsColumn']][i].split(',').map(s => s.trim()),
      value: sigmaData[config['valuesColumn']][i],
      name: sigmaData[config['namesColumn']][i] || ''
    });
  }

  return {
    chart: {
      type: 'venn',
      spacing: [50, 0, 30, 20],
    },
    title: {
      text: client.config.getKey("chartTitle"),
      align: 'center',
      margin: 30
    },
    plotOptions: {
      venn: {
        borderWidth: 2,
        states: {
          hover: {
            borderWidth: 3
          }
        }
      }
    },
    series: [{
      name: 'Venn Diagram',
      data: vennData,
      accessibility: {
        point: {
          descriptionFormat: '{index}. {point.name}: {point.value}.'
        }
      }
    }]
  };
};

const useMain = () => {
  const config = useConfig();
  const sigmaData = useElementData(config.source);
  const payload = useMemo(() => getSigmaData(config, sigmaData), [config, sigmaData]);
  const [chartOptions, setChartOptions] = useState(null);

  useEffect(() => {
    setChartOptions(payload);
  }, [payload]);

  return chartOptions;
};

const App = () => {
  const options = useMain();

  if (!options) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ width: '100%', minHeight: '400px', height: '100%', position: 'absolute' }}>
      <HighchartsReact highcharts={Highcharts} options={options} containerProps={{ style: { height: '100%', width: '100%' }}} />
    </div>
  );
};

export default App;