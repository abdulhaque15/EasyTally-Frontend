const FunnelChart = ({ data = [] }) => {

    const sortedData = [...data]?.sort((a, b) => {
        if (a.stage === "New") return -1;
        if (b.stage === "New") return 1;
        return 0;
    });

    const generateBarWidths = (length, max = 100, min = 40) => {
        const step = (max - min) / (length - 1 || 1);
        return Array.from({ length }, (_, i) => Math.round(max - i * step));
    };

    const backgroundColorArray = data?.map((_, index) => {
        const hue = Math.floor((360 / data?.length) * index);
        const saturation = 60;
        const lightness = 80;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    });

    const barWidths = generateBarWidths(sortedData.length);

    return (
        <div className="funnel-chart-inner mx-1"
            style={{ maxHeight: data.length > 5 ? '240px' : 'auto', overflowY: data.length > 5 ? 'auto' : 'unset' }}
        >
            {sortedData?.map((item, index) => {
                const width = barWidths[index] || 32;
                return (
                    <div key={index} className="d-flex justify-content-center align-items-center mb-1">
                        <div className=" text-center funnel-bar d-flex justify-content-center align-items-center"
                            style={{ backgroundColor: `${backgroundColorArray[index]}`, width: `${width}%` }}
                        >
                            {item.stage}
                        </div>
                        <span className="fw-bold mx-1">{item.count}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default FunnelChart;
