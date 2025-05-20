const StatsCard = ({ title, value }) => {
  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '1rem',
      width: '200px',
      textAlign: 'center',
    }}>
      <h4>{title}</h4>
      <p style={{ fontSize: '1.5rem' }}>{value}</p>
    </div>
  );
};

export default StatsCard;