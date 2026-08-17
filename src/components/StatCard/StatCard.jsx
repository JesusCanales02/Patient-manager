import "./StatCard.css"

const StatCard = ({title, value, icon: Icon, variant = "Default"})=>{
    return(
    <>
    <div className={`stat-card stat-card-${variant}`}>
      <div className="stat-card-info">
        <span>{title}</span>
        <strong>{value}</strong>
      </div>

      <div className="stat-card-icon">
        <Icon size={24} />
      </div>
    </div>
    </>
)
}

export default StatCard