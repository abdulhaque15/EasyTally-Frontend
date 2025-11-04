import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const LeadDashboardChart = ({ CHART_PERCENTAGE = 50, TOTAL_LEADS, REMAINING_LEADS }) => {
  let data = {
    datasets: [
      {
        label: 'C : ',
        data: [  REMAINING_LEADS, TOTAL_LEADS ],
        backgroundColor: [
          'rgb(212 179 124)',
          'rgb(212 179 124)',
        ],
        borderColor: [
          'rgb(212 179 124)',
          'rgb(212 179 124)',
        ],
        borderWidth: 1
      },
    ],
  }; 
  return (<Doughnut data={{ ...data, [data.datasets.data]: [CHART_PERCENTAGE, CHART_PERCENTAGE] }} />)
}

export default LeadDashboardChart