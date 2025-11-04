const DashboardCard = (obj) => {
    const { title, count, avg_contract, color, icon } = obj?.cardInfo;

    const formatNumberIntl = (value) => {
        return Number(value).toLocaleString('en-US');
    }

    return (
        <>
            <div className="dashboard-card my-sm-2 py-2 text-start" style={{ borderLeft: `3px solid ${color}` }}>
                <div className="dash-board-title mx-3 d-flex align-items-center justify-content-between">
                    {title}
                    {/* <span className="d-flex align-items-center justify-content-center" style={{ color: `${color}` }}>{icon}</span> */}
                </div>
                <div className="dash-board-number fw-semibold mx-3">
                    {title === "Revenue Earn by Deal" ? `₹ ${formatNumberIntl(avg_contract)}` : count}
                </div>
            </div>
        </>
    )
}

export default DashboardCard