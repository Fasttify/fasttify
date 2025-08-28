import styled from 'styled-components';

// Container principal
export const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
`;

// Top Navigation
export const TopNavigation = styled.nav`
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
`;

export const NavBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;

  svg {
    width: 32px;
    height: 32px;
    color: #667eea;
  }

  img {
    height: 24px;
    width: auto;
    filter: invert(1) brightness(0) saturate(100%) invert(7%) sepia(8%) saturate(1298%) hue-rotate(202deg)
      brightness(95%) contrast(95%);
  }
`;

export const NavTabs = styled.div`
  display: flex;
  gap: 0.5rem;

  @media (max-width: 768px) {
    width: 100%;
    order: 3;
  }
`;

export const NavTab = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  border: none;
  background: ${(props) => (props.$active ? '#f3f4f6' : 'transparent')};
  color: ${(props) => (props.$active ? '#1a1a1a' : '#6b7280')};
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #f3f4f6;
    color: #1a1a1a;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #6b7280;
  font-size: 0.875rem;

  span {
    font-weight: 500;
  }

  button {
    background: none;
    border: 1px solid #e5e7eb;
    color: #6b7280;
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.375rem;

    &:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }

    svg {
      width: 14px;
      height: 14px;
    }
  }

  @media (max-width: 768px) {
    span {
      display: none;
    }
  }
`;

// Dashboard Content
export const DashboardContent = styled.main`
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

// Summary Cards
export const SummarySection = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
`;

export const SummaryCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;

  h3 {
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
    margin: 0 0 0.5rem 0;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .value {
    font-size: 2rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
  }

  .change {
    font-size: 0.875rem;
    color: #10b981;
    margin-top: 0.25rem;
  }
`;

// Filters Section
export const FiltersSection = styled.section`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

export const FiltersRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 200px;

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  input,
  select {
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    background: white;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 1px #667eea;
    }
  }

  @media (max-width: 768px) {
    min-width: auto;
  }
`;

// Table Section
export const TableSection = styled.section`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

export const TableHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
  }
`;

export const TableContainer = styled.div`
  overflow-x: auto;
`;
