import './styles/LoadingGrid.css';
export const LoadingGrid = () => {
  const skeletons = [0, 1, 2, 3, 4, 5].map(i => <div className="skeleton" key={i}><div /><div /><div /></div>);
  return <div className="loading-grid" aria-label="Loading scores" aria-busy="true">{skeletons}</div>;
};
