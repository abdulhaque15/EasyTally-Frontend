import React, { Fragment } from 'react'
import ModuleHeader from '../../components/ModuleHeader'
import { Container, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ReportDashboardDetails from "./ReportDashboardDetails";
import { FaTachometerAlt } from 'react-icons/fa';

const ReportDashboard = () => {
    const navigate = useNavigate();
    
    const tableHeaders = [
        { key: 'name', show: true, label: 'Title' }
    ]

    const listOfReports = [
        { id: 101, name: 'Dasboard Card' },
        { id: 102, name: 'Leads by pipeline card' },
        { id: 103, name: 'Leads Status' },
        { id: 104, name: 'Project & profite' },
        { id: 105, name: 'Today Created Task & Event' },
        { id: 106, name: 'Total profits earned by proejcts' },
        { id: 107, name: 'Employee task performance' },
        { id: 108, name: 'Lead dustribution by pipeline' },
        { id: 109, name: 'Un-assigned leads' }
    ];

    const handleNameClick = (row) => {
        navigate(`/reports/view/${row.id}`, { state: { rowData: row } });
    };

    return (
        <Fragment>

            <ModuleHeader header={"Report & Analytics"} icon={<FaTachometerAlt />} />

            {
                !location.pathname.includes('view') ? (
                    <>
                        <Container className="d-flex justify-content-end mb-2">
                            <button className="btn created-record-btn rounded-3 border-0">Created Report</button>
                        </Container>

                        <Container>
                            <Table responsive striped hover className='data-table'>
                                <thead className='data-table-thead'>
                                    <tr className='fs-6 data-table-tr'>
                                        {tableHeaders?.map((item) => <th className='data-table-th'>{item.label}</th>)}
                                    </tr>
                                </thead>
                                <tbody className='data-table-tbody'>
                                    {listOfReports?.map((obj) => (
                                        <tr key={obj?.id} className='data-table-tr' style={{ fontSize: "12px" }}>
                                            {
                                                tableHeaders?.map((item, index) => (
                                                    <td className='data-table-td'>
                                                        {item?.key === "name" ? (
                                                            <span
                                                                className='text-primary'
                                                                style={{ cursor: "pointer" }}
                                                                onClick={() => handleNameClick(obj)}
                                                            >
                                                                {obj[item?.key]}
                                                            </span>)
                                                            : obj[item?.key]}
                                                    </td>
                                                ))
                                            }
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Container>
                    </>
                ) : (
                    <ReportDashboardDetails />
                )
            }


        </Fragment>
    )
}

export default ReportDashboard