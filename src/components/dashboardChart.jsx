import React from 'react'
import 'chart.js/auto';
import { Chart as ChartJS, registerables } from 'chart.js';
import { FunnelController, TrapezoidElement } from 'chartjs-chart-funnel';
import { Chart } from 'react-chartjs-2';

ChartJS.register(...registerables, FunnelController, TrapezoidElement);

const DashboardChart = ({ title, type, data, options, isHorizontalBarORLine, height }) => {

  const centerTextPlugin = {
    id: "centerText",
    beforeDraw(chart) {
      const { width } = chart;
      const { height } = chart;
      const ctx = chart.ctx;
      ctx.restore();

      const valueText = data.datasets.reduce((sum, dataset) => {
        return sum + dataset.data.reduce((a, b) => a + b, 0)
      }, 0)

      if (valueText) { 

        ctx.font = `bold ${title === "Leads by status" ? "24px" : "14px"} sans-serif`;
        ctx.fillStyle = "#000";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText(valueText, width / 2, height / 2 - 8);

        // Sub-label text
        const labelText = `Total ${title === "Leads" ? "leads" : "profits"}`;
        ctx.font = "14px sans-serif";
        ctx.fillStyle = "#666";
        ctx.fillText(labelText, width / 2, height / 2 + 15);

        ctx.save();
      }
    },
  };

  return (
    <>
      <p className='my-2 lh-lg mx-3 text fw-medium chart-heading'>{title}</p>
      <div className='row chart-inner-body'>

        {isHorizontalBarORLine && type !== 'doughnut'
          ? (
            <div>
              <Chart
                key={type + title + (data?.datasets ?? '')}
                type={type}
                data={data}
                options={options}
                height={height}
              />
            </div>
          ) : (
            <div className='d-flex justify-content-center' style={{ height: type === "bar" ? '150px' : '140px' }}> {/* maxHeight: '400px', overflowY: 'auto' */}
              <Chart
                key={type + title + (data?.datasets ?? '')}
                type={type}
                data={data}
                options={options}
              // plugins={type === "doughnut" ? [centerTextPlugin] : []}
              />
            </div>
          )
        }

        {!isHorizontalBarORLine &&
          <div className="row my-2 bg-body-tertiary rounded-3" style={{ maxHeight: "90px", overflowY: "auto" }}>

            {data?.labels?.map((label, index) => (
              <div className="col-12 d-flex align-items-center py-1" key={index}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 4,
                    backgroundColor: data?.datasets[0]?.backgroundColor[index],
                    marginRight: 6
                  }}>
                </div>
                <span style={{ fontSize: 13, fontWeight: 500}}>{label}</span>
              </div>
            ))}

          </div>
        }

      </div>
    </>
  )
}

export default DashboardChart;