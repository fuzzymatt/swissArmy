import React, { useState } from 'react';

const App = () => {
  const [originalFile, setOriginalFile] = useState('');
  const [convertedFile, setConvertedFile] = useState('');
  const [error, setError] = useState('');
  const [conversionType, setConversionType] = useState('jsonToCsv'); // default conversion type

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      setOriginalFile(event.target.result);
    };

    reader.readAsText(file);
  };

  const handleFileConversion = () => {
    fetch('http://localhost:3359/api/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        file: originalFile,
        conversionType
      })
    })
    .then(response => response.ok ? (conversionType === 'csvToXlsx' ? response.blob() : response.json()) : Promise.reject(response))
    .then(data => {
      if (data.error) {
        setError(data.error);
      } else {
        if (conversionType === 'csvToXlsx') {
          const url = URL.createObjectURL(data);
          setConvertedFile({ type: 'blob', data: url });
        } else {
          setConvertedFile({ type: 'text', data: data.convertedFile });
        }
      }
    })
    .catch(error => console.error('Error:', error));
  };
  
  const handleFileDownload = (data, conversionType) => {
    let file;
    let mimeType;
    let fileExtension;
  
    switch (conversionType) {
      case 'csvToXlsx':
        file = data; // no need to parse the Blob
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = 'xlsx';
        break;
      case 'jsonToCsv':
        file = new Blob([data], { type: 'text/csv' });
        mimeType = 'text/csv';
        fileExtension = 'csv';
        break;
      case 'csvToJson':
      default:
        file = new Blob([data], { type: 'application/json' });
        mimeType = 'application/json';
        fileExtension = 'json';
        break;
    }
  
    const element = document.createElement("a");
    element.href = URL.createObjectURL(file);
    element.download = `myFile.${fileExtension}`;
    document.body.appendChild(element);
    element.click();
  };
  

  return (
    <div>
      <h1>File Converter</h1>
      <input type="file" onChange={handleFileUpload} />
      <select value={conversionType} onChange={(e) => setConversionType(e.target.value)}>
        <option value="jsonToCsv">JSON to CSV</option>
        <option value="csvToJson">CSV to JSON</option>
        <option value="csvToXlsx">CSV to XLSX</option>
      </select>
      <button onClick={handleFileConversion}>Convert</button>
      {error && <p>Error: {error}</p>}
      {convertedFile && convertedFile.type === 'text' && <p>{convertedFile.data}</p>}
    {convertedFile && convertedFile.type === 'blob' && <p>Conversion successful. Click the button below to download the file.</p>}
      {convertedFile && <button onClick={() => handleFileDownload(convertedFile.data, conversionType)}>Download</button>
}
    </div>
  );
};

export default App;
