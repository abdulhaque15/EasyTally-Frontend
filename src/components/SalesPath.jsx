const SalesPath = ({ title, isActive, index, salesPath, setSalesPath }) => {
    const setChangeSelectedPath = (key) => {
        setSalesPath(salesPath.map((item, index) => index === key ? {...item, isActive : true} : {...item , isActive : false}))
        // console.log(key);
    }
    return (
        <div className={`step-box ${isActive && "active-path"}`} onClick={() => setChangeSelectedPath(index)}>{title}</div>
    )
}

export default SalesPath