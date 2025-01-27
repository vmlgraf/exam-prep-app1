import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import Footer from '../components/Footer'; 

describe('Footer Component', () => {
  it('renders without crashing', () => {
    render(<Footer />);
    const footerElement = screen.getByText(/Exam Prep. All Rights Reserved./i);
    expect(footerElement).toBeInTheDocument();
  });

  it('displays the current year', () => {
    const currentYear = new Date().getFullYear();
    render(<Footer />);
    const footerElement = screen.getByText(new RegExp(`© ${currentYear}`, 'i'));
    expect(footerElement).toBeInTheDocument();
  });
});
