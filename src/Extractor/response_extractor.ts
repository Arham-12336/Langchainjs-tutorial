import { TextLoader } from "langchain/document_loaders";
import * as fs from 'fs';


const extractResponses = (logFilePath: fs.PathOrFileDescriptor) => {
    // Read the log file
    const logContent = fs.readFileSync(logFilePath, 'utf-8');
  
    // Extract responses from the log content
    const Regex = new RegExp(/2023-07-([0][1-9]|[12][0-9]|3[01])T\d\d:\d\d:\d\d.\d\d\dz response /);

    const responses = logContent
      .split('\n') // Split the log content by newlines
      .filter(line => line.match(/2023-07-([0][1-9]|[12][0-9]|3[01])T\d\d:\d\d:\d\d.\d\d\dz response /)) // Filter lines starting with "Response: "
      .map(line => line.substring(/2023-07-([0][1-9]|[12][0-9]|3[01])T\d\d:\d\d:\d\d.\d\d\dz response /.length)); // Extract the response content
  
    return responses;
  };
  
  // Example usage
  const logFilePath = 'src/Extractor/logsfile.txt';
  const responses = extractResponses(logFilePath);
  
  // Store responses in a JSON file
  const jsonFilePath = 'response.json';
  fs.writeFileSync(jsonFilePath, JSON.stringify(responses, null, 2));
  
  console.log('Responses extracted and stored in responses.json file.');