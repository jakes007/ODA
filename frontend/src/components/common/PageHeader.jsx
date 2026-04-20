export default function PageHeader({ title, subtitle }) {
  return (
    <div className="page-header premium-page-header">
      <h2 className="page-title">{title}</h2>

      {subtitle ? (
        <p className="page-subtitle">{subtitle}</p>
      ) : null}
    </div>
  );
}