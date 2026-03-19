export function EscrowCard({ title, description, actionLabel, children }) {
  return (
    <section className="card">
      <div className="card__header">
        <h2>{title}</h2>
        <button type="button">{actionLabel}</button>
      </div>
      <p>{description}</p>
      <div className="card__body">{children}</div>
    </section>
  );
}
