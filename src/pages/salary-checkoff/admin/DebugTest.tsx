import React, { useState } from 'react';
import { clientService } from '@/services/salary-checkoff/client.service';
import { employerService } from '@/services/salary-checkoff/employer.service';

/**
 * Debug component to test API calls
 * Add this to your admin routes to test
 */
export function DebugTest() {
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testEmployers = async () => {
    try {
      setError('');
      setResult('Testing employers...');
      const data = await employerService.listEmployers();
      setResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setError(`Error: ${err.message}\n${JSON.stringify(err, null, 2)}`);
    }
  };

  const testClients = async () => {
    try {
      setError('');
      setResult('Testing clients...');
      const data = await clientService.listClients();
      setResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setError(`Error: ${err.message}\n${JSON.stringify(err, null, 2)}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Debug Test</h1>

      <div className="space-x-4 mb-4">
        <button
          onClick={testEmployers}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Test Employers API
        </button>
        <button
          onClick={testClients}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Test Clients API
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded mb-4">
          <h3 className="font-bold">Error:</h3>
          <pre className="text-xs overflow-auto">{error}</pre>
        </div>
      )}

      {result && (
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Result:</h3>
          <pre className="text-xs overflow-auto">{result}</pre>
        </div>
      )}
    </div>
  );
}
