import React, { useState, useEffect } from "react";
import { Col, Container, Row, Table } from "react-bootstrap";
import DashboardCard from "../../components/DashboardCard";
import FunnelChart from "../../components/FunnelChart";
import DasboardChart from "../../components/DashboardChart";
import TodoApp from "../../components/GlobalTodo";
import { Form, Link } from "react-router-dom";
import uvCapitalApi from "../../api/uvCapitalApi";
import { FaUsers, FaUserCheck, FaFileInvoice, FaChartLine } from "react-icons/fa";
import { Grid } from "react-loader-spinner";
import { BackgroundColor } from "@tiptap/extension-text-style";

const Dashboard = () => {
  const [cardsData, setCardsData] = useState();
  const [chartsData, setChartsData] = useState();
  const [todayTaksEvent, setTodayTaskevent] = useState();

  useEffect(() => {
    fetchCardsData();
    fetchChartsData();
    fetchTodayEventOrTask();
  }, []);

  //  Fetch all task and event of Today   //
  const fetchTodayEventOrTask = async () => {
    try {
      const todatTaskEventList =
        await uvCapitalApi.retriveTodayTaskAndEvent();
      if (todatTaskEventList.success) {
        setTodayTaskevent(todatTaskEventList?.data[0]?.today_event_task);
      }
    } catch (error) {
      setTodayTaskevent([]);
      console.log("task-event Error :", error);
    }
  };

  const header = [
    { key: "name", label: "Name" },
    { key: "status", label: "Status" },
  ];
  //-------   END ./    ----------//

  const fetchCardsData = async () => {
    try {
      const { data } = await uvCapitalApi.handleDashboardsCardsData();
      setCardsData(data[0]?.dashboard_cards_data);
    } catch (error) {
      console.log("Internal-server-error-->>", error);
    }
  };

  const fetchChartsData = async () => {
    try {
      const { data } = await uvCapitalApi.handleDashboardsChartsData();
      setChartsData(data[0]?.charts_data);
    } catch (error) {
      console.log("Server-error-->>", error);
    }
  };

  const generateBackgroundColors = (dataArray) => {
    if (!Array.isArray(dataArray)) return [];

    return dataArray?.map((_, index) => {
      const hue = Math.floor((360 / dataArray?.length) * index);  // evenly spaced hues
      const saturation = 60;
      const lightness = 80;
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    });
  }

  const dashboardCardArr = [
    { id: 1, title: "Total Lead", icon: <FaUsers />, count: cardsData?.total_lead || 0, color: "#3F8F6B" },
    { id: 2, title: "Converted Lead", icon: <FaUserCheck />, count: cardsData?.converted_Lead || 0, color: "#4CA482" },
    { id: 3, title: "Lost Lead", icon: <FaFileInvoice />, count: cardsData?.lost_lead || 0, color: "#63B295" },
    { id: 4, title: "Total Deal", icon: <FaFileInvoice />, count: cardsData?.total_deal || 0, color: "#5FBF99" },
    { id: 5, title: "Deal Conversion Rate", icon: <FaFileInvoice />, count: `${cardsData?.deal_conversion_rate} %` || 0, color: "#8CCFB5" },
    { id: 6, title: "Revenue Earn by Deal", icon: <FaChartLine />, avg_contract: cardsData?.revenue_earn_by_deal || 6851, color: "#d2ddd3" },
  ];

  /*------- Total Deals by potential amount & convert amount  -------*/
  const dealClosingPerformance = chartsData?.deal_closing_performance || [];
  const dealClosingPerformanceChart = {
    labels: dealClosingPerformance.map(item => item.deal_name),
    datasets: [
      {
        label: 'Converted Amount',
        data: dealClosingPerformance.map(item => item.converted_amount),
        backgroundColor: '#ec3050ff'
      },
      {
        label: 'Potential Amount',
        data: dealClosingPerformance.map(item => item.potential_amount),
        backgroundColor: '#f7e05de8'
      }
    ]
  };

  const dealClosingPerformanceOption = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          font: { size: 10 }
        }
      }
    },
    scales: {
      y: {
        display : false,
        stacked: true,
        ticks: {
          font: { size: 9 }
        },
        grid: { display: false }
      },
      x: {
        display: false,
        stacked: true,
        font: { size: 5 },
        grid: { display: false }
      }
    }
  };

  /*  END ./  */

  /*****  Lead Count By Source    *******/
  const leadSourceData = chartsData?.lead_by_source?.map(item => item?.count);
  const leadCountBySource = {
    labels: chartsData?.lead_by_source?.map(item => item?.source),
    datasets: [
      {
        data: leadSourceData,
        backgroundColor: generateBackgroundColors(leadSourceData),
        borderWidth: 0.3
      }
    ],
  };

  const leadCountBySourceOption = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { display: false },
      y: { display: false }
    }
  };
  /**   END ./   */

  /*----  Lead Count By Manager   -----*/
  const leadByManager = {
    labels: chartsData?.lead_count_by_manager?.map(item => item?.manager),
    datasets: [
      {
        data: chartsData?.lead_count_by_manager?.map(item => item?.count),
        backgroundColor: generateBackgroundColors(leadSourceData),
        borderWidth: 0.3,
        barPercentage: 0.6
      }
    ],
  }

  const leadByManagerOption = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { display: false },
      y: {
        grid: { display: false },
        ticks: {
          precision: 0,
          stepSize: 25,
        },
      }
    }
  };
  /*  END ./  */


  /** Lead Distribute by Category */
  console.log('charts-data :', chartsData?.lead_charts_data?.client_by_category)
  const leadByCategoryData = {
    labels: ['Equity Capital Markets', 'Debt Capital Markets', 'Mergers & Acquisitions'],
    datasets: [
      {
        data: [
          chartsData?.lead_charts_data?.lead_by_category?.debt_capital_total || 0,
          chartsData?.lead_charts_data?.lead_by_category?.equity_capital_total || 0,
          chartsData?.lead_charts_data?.lead_by_category?.mergers_acquistions || 0,
        ],
        backgroundColor: generateBackgroundColors([
          chartsData?.lead_charts_data?.lead_by_category?.debt_capital_total || 0,
          chartsData?.lead_charts_data?.lead_by_category?.equity_capital_total || 0,
          chartsData?.lead_charts_data?.lead_by_category?.mergers_acquistions || 0,
        ]),
        barPercentage: 0.6
      }
    ]
  }

  const leadByCategoryOption = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { display: false },
      y: {
        grid: { display: false },
        ticks: {
          precision: 0,
          stepSize: 1,
        },
      }
    }
  };
  /**   END ./   */

  /** Lead Distribute by Category */
  console.log('charts-data :', chartsData?.lead_charts_data?.client_by_category)
  const clientDistributionByCategoryData = {
    labels: ['Equity Capital Markets', 'Debt Capital Markets', 'Mergers & Acquisitions'],
    datasets: [
      {
        data: [
          chartsData?.lead_charts_data?.client_by_category?.debt_capital_total || 0,
          chartsData?.lead_charts_data?.client_by_category?.equity_capital_total || 0,
          chartsData?.lead_charts_data?.client_by_category?.mergers_acquistions || 0,
        ],
        backgroundColor: generateBackgroundColors([
          chartsData?.lead_charts_data?.client_by_category?.debt_capital_total || 0,
          chartsData?.lead_charts_data?.client_by_category?.equity_capital_total || 0,
          chartsData?.lead_charts_data?.client_by_category?.mergers_acquistions || 0,
        ]),
        barPercentage: 0.6
      }
    ]
  }

  const clientDistributionByCategoryOption = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { display: false },
      y: {
        grid: { display: false },
        ticks: {
          precision: 0,
          stepSize: 1,
        },
      }
    }
  };
  /**   END ./   */

  return (
    <Container fluid className="dashboard-container">
      <Row className="mt-3 gx-3 gy-3">
        {cardsData && dashboardCardArr?.map((item) => (
          <Col key={item?.id} xs={12} sm={6} md={4} lg={2}>
            <DashboardCard cardInfo={item} />
          </Col>
        ))}
      </Row>

      {(chartsData) && (
        <>
          <Row className="mx-sm-4 mt-sm-3">
            <Col lg={6} md={6} sm={12} className="my-sm-2 chart-monile-box">
              <div className="chart-box">
                <p className="my-2 lh-lg mx-3 text fw-medium chart-heading'"></p>
                <p className='my-2 lh-lg mx-3 text fw-medium chart-heading'>Number of Deals per Pipeline Stage</p>
                <FunnelChart data={chartsData?.sales_funnel} />
              </div>
            </Col>

            <Col lg={6} md={6} sm={12} className="my-sm-2 chart-monile-box">
              <div className="chart-box">
                <DasboardChart
                  title="Deal Summary: Potential vs. Converted Amounts"
                  type="bar"
                  data={dealClosingPerformanceChart}
                  options={dealClosingPerformanceOption}
                  isHorizontalBarORLine={true}
                />
              </div>
            </Col>
          </Row>

          <Row className="mx-sm-4 mt-sm-3">
            <Col lg={4} md={6} sm={12} className="my-sm-2 chart-monile-box">
              <div className="chart-box">
                <DasboardChart
                  title="Number of Leads by Source"
                  type="doughnut"
                  data={leadCountBySource}
                  options={leadCountBySourceOption}
                />
              </div>
            </Col>

            <Col lg={4} md={6} sm={12} className="my-sm-2 chart-monile-box">
              <div className="chart-box">
                <DasboardChart
                  title="Breakdown of Leads Handled by Each Manager"
                  type="bar"
                  data={leadByManager}
                  options={leadByManagerOption}
                />
              </div>
            </Col>

            <Col lg={4} md={6} sm={12} className="my-sm-2 chart-monile-box">
              <div className="chart-box">
                <DasboardChart
                  title="Lead Distribution by Category"
                  type="bar"
                  data={leadByCategoryData}
                  options={leadByCategoryOption}
                />
              </div>
            </Col>

          </Row>
          
          <Row className="mx-sm-4 mt-sm-3">

            <Col lg={4} md={6} sm={12} className="my-sm-2 chart-monile-box">
              <div className="chart-box">
                <DasboardChart
                  title="Client Distribution by Category"
                  type="bar"
                  data={clientDistributionByCategoryData}
                  options={clientDistributionByCategoryOption}
                />
              </div>
            </Col>

            <Col lg={8} md={6} sm={12} className="my-sm-2 chart-monile-box">
              <div className="p-3 chart-box rounded h-100">
                <h6 className="mb-2 fw-semibold">Task</h6>
                <Table striped hover borderless responsive size="sm" className="data-table">
                  <thead className="data-table-thead">
                    <tr className="data-table-tr">
                      {header?.map((obj, index) => (<th className="data-table-th" key={index}>{obj?.label}</th>))}
                    </tr>
                  </thead>
                  <tbody className="data-table-tbody">
                    {todayTaksEvent?.task?.length
                      ? (
                        todayTaksEvent?.event?.map((obj) => (
                          <tr key={obj?.id} className="data-table-tr">
                            {header?.map((item, index) => (
                              <td key={index} style={{ fontSize: "14px" }} className="data-table-td">
                                {item?.key === "name" ? (
                                  <Link to={`/events/view/${obj.id}`} style={{ textDecoration: "none" }}>
                                    {obj[item?.key]}
                                  </Link>
                                ) : (
                                  <span
                                    className="badge rounded-pill detail-h3 w-100"
                                    style={{ backgroundColor: "grey" }}
                                  >
                                    {obj[item?.key]}
                                  </span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr className="data-table-tr">
                          <td colSpan={header?.length} className="text-center data-table-td">
                            No Tasks Found
                          </td>
                        </tr>
                      )}
                  </tbody>
                </Table>
              </div>
            </Col>

          </Row>
        </>
      )}
    </Container>
  );
};
export default Dashboard;