import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  body {
    font-family: 'Inter', Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f9fafc;
    color: #333;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Poppins', sans-serif;
    color: #2c3e50;
    margin: 0 0 10px;
  }

  a {
    color: #3498db;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
    color: #2980b9;
  }

  button {
    font-family: 'Inter', Arial, sans-serif;
    padding: 0.75rem 1.25rem;
    font-size: 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  button:hover {
    background-color: #3498db;
    color: #fff;
  }

  input, textarea, select {
    width: 100%;
    padding: 0.75rem;
    margin: 0.5rem 0;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 5px;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
`;

export default GlobalStyles;
