import React, { Fragment, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import uvCapitalApi from '../../api/uvCapitalApi';
import ModuleHeader from '../../components/ModuleHeader';
import { Container } from 'react-bootstrap';

const ReportDashboardDetails = () => {
    const location = useLocation();
    // console.log('location-> ' , location);

    const [header , setHeader] = useState();
    const [dashboardCards, setDasboardsData] = useState();

    useEffect(() => {
        fetchData(location.state?.rowData?.id);
    }, []);

    const fetchData = async (report_id) => {
        switch (report_id) {
            case 101:
                fetchDashboardsCardsData();
                break;
            case 102:
                fetchLeadCountByPipeline();
                break;
        }
    }

    const fetchDashboardsCardsData = async () => {
        try {
            const response = await uvCapitalApi.handleDashboardsCardsData();
            if (response.success) {
                console.log('response :', response);

                const dashboardCardATableData = [
                    { id: 1, title: "Total Leads", total: response?.data[0]?.dashboard_cards_data?.total_leads },
                    { id: 2, title: "Total Projects", total: response?.data[0]?.dashboard_cards_data?.total_projects },
                    { id: 3, title: "Pending Task", total: response?.data[0]?.dashboard_cards_data?.total_pending_tasks },
                    {
                        id: 4,
                        title: "Compeleted Task",
                        total: response?.data[0]?.dashboard_cards_data?.total_completed_tasks,
                    },
                    { id: 5, title: "Total Profits", total: response?.data[0]?.dashboard_cards_data?.total_profits },
                ];

                setDasboardsData(dashboardCardATableData);

            }
        } catch (error) {
            console.log("Internal-server-error-->>", error);
            setDasboardsData([]);
        }
    };

    const fetchLeadCountByPipeline = async () => {
        try {
            const response = await uvCapitalApi.getLeadByStatusCount();
            if (response?.success) {
                console.log('response-pipeline-lead :' , response);
                
                // const dashboardCardATableData = [
                //     { id: 1, title: "Total Leads", total: response?.data[0]?.dashboard_cards_data?.total_leads },
                //     { id: 2, title: "Total Projects", total: response?.data[0]?.dashboard_cards_data?.total_projects },
                //     { id: 3, title: "Pending Task", total: response?.data[0]?.dashboard_cards_data?.total_pending_tasks },
                //     {
                //         id: 4,
                //         title: "Compeleted Task",
                //         total: response?.data[0]?.dashboard_cards_data?.total_completed_tasks,
                //     },
                //     { id: 5, title: "Total Profits", total: response?.data[0]?.dashboard_cards_data?.total_profits },
                // ];

                // setDasboardsData(dashboardCardATableData)
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setLeadHeaderDetails([]);
        }
    }

    return (
        <Fragment>
            <div className="relative mt-4">
                <Container>
                    Report Dashboard Details
                    {/* <h5>{header}</h5>
                    <table className='table data-table'>
                        <thead className='data-table-thead'>
                            <tr className='data-table-tr fs-6'>
                                {dashboardCards?.map((item) => (
                                    <th className='data-table-th'>{item?.title}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className='data-table-tbody'>
                            <tr className='data-table-tr' style={{ fontSize: "13px" }}>
                                {dashboardCards?.map((item, index) => (
                                    <td className='data-table-td'>{item?.title !== "Total Profits" ? item?.total : `$ ${item?.total}`}</td>
                                ))}
                            </tr>
                        </tbody>
                    </table> */}
                </Container>
            </div>
        </Fragment>
    )
}

export default ReportDashboardDetails