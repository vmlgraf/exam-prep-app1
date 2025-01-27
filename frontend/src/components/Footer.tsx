import './styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>&copy; {currentYear} Exam Prep. All Rights Reserved.</p>
    </footer>
  );
};

export default Footer;
